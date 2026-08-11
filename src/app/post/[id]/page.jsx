// [게시판 상세] 페이지 (localhost:3000/post/[id])
"use client";

import "@/community/common.css";
import "@/community/post.css";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import PostDetailContent from "@/components/post/detail/PostBody.jsx";
import CommentSection from "@/components/post/detail/Comments.jsx";
import {
  getCommunityPostById,
  getCommentsByPostId,
  getCurrentCommunityUser,
  incrementPostView,
  togglePostLike,
} from "@/lib/communityQueries";
import { deletePost } from "@/lib/communityMutations";

const buildLoginUrl = returnUrl =>
  `/sign-in?returnUrl=${encodeURIComponent(returnUrl || "/post")}`;

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const postId = params?.id;

  const [basePost, setBasePost] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isLikePending, setIsLikePending] = useState(false);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDetail = async () => {
      if (!postId || postId === "preview") {
        if (mounted) {
          setBasePost(null);
          setComments([]);
          setLoadError(
            postId === "preview"
              ? "미리보기 게시글은 더 이상 사용하지 않습니다."
              : "게시글을 찾을 수 없습니다.",
          );
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const [post, commentRows, user] = await Promise.all([
          getCommunityPostById(postId),
          getCommentsByPostId(postId),
          getCurrentCommunityUser(),
        ]);

        if (!mounted) return;

        setCurrentUser(user);
        setComments(commentRows);

        if (!post) {
          setBasePost(null);
          return;
        }

        setBasePost(post);

        // 실제 DB 조회수 집계 후 최신 값을 다시 읽습니다.
        await incrementPostView(post.id);
        const refreshedPost = await getCommunityPostById(post.id);
        if (mounted && refreshedPost) setBasePost(refreshedPost);
      } catch (error) {
        console.error("게시글 상세를 불러오지 못했습니다.", error);
        if (mounted) {
          setLoadError("게시글을 불러오지 못했습니다. 다시 시도해 주세요.");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadDetail();

    return () => {
      mounted = false;
    };
  }, [postId]);

  const handleLikeToggle = async () => {
    if (!currentUser) {
      router.push(buildLoginUrl(pathname));
      return;
    }

    if (!basePost || isLikePending) return;

    try {
      setIsLikePending(true);
      await togglePostLike(basePost.id);
      const refreshedPost = await getCommunityPostById(basePost.id);
      if (refreshedPost) setBasePost(refreshedPost);
    } catch (error) {
      console.error("좋아요 처리 실패", error);
    } finally {
      setIsLikePending(false);
    }
  };

  const handleDeletePost = async () => {
    if (!currentUser) {
      router.push(buildLoginUrl(pathname));
      return;
    }

    if (!basePost || currentUser.id !== basePost.authorId || isDeletePending) {
      return;
    }

    const confirmed = window.confirm(
      "게시글을 삭제하면 댓글·대댓글·좋아요·태그 연결·조회 기록과 본문에 업로드한 이미지도 함께 정리됩니다. 삭제하시겠습니까?",
    );
    if (!confirmed) return;

    try {
      setIsDeletePending(true);
      setDeleteError("");
      await deletePost(basePost.id);
      router.replace("/post/list");
      router.refresh();
    } catch (error) {
      console.error("게시글 삭제 실패", error);
      setDeleteError(error?.message || "게시글 삭제에 실패했습니다.");
    } finally {
      setIsDeletePending(false);
    }
  };

  if (isLoading) {
    return (
      <main className="community-scope community-page detail-page-container">
        <p className="community-listState">게시글을 불러오는 중입니다.</p>
      </main>
    );
  }

  if (!basePost) {
    return (
      <main className="community-scope community-page detail-page-container">
        <div className="detail-page-navigationRow">
          <Link href="/post/list" className="detail-page-backBtn">
            ← 목록으로 돌아가기
          </Link>
        </div>

        <section className="post-detail-emptyState">
          <h1 className="community-section-title">
            게시글을 찾을 수 없습니다.
          </h1>
          <p className="community-section-description">
            {loadError || "삭제되었거나 존재하지 않는 게시글입니다."}
          </p>
        </section>
      </main>
    );
  }

  const post = {
    ...basePost,
    author: {
      id: basePost.authorId,
      name: basePost.author,
      avatarUrl: basePost.authorAvatarUrl,
      role: basePost.authorRole,
    },
  };

  return (
    <main className="community-scope community-page detail-page-container">
      <div className="detail-page-navigationRow">
        <Link href="/post/list" className="detail-page-backBtn">
          ← 목록으로 돌아가기
        </Link>
      </div>

      <PostDetailContent
        post={post}
        isLiked={Boolean(basePost.likedByCurrentUser)}
        isLikePending={isLikePending}
        onLikeToggle={handleLikeToggle}
        canDelete={Boolean(
          currentUser?.id && currentUser.id === basePost.authorId,
        )}
        isDeletePending={isDeletePending}
        onDelete={handleDeletePost}
      />

      {deleteError && (
        <p className="post-detail-deleteError" role="alert">
          {deleteError}
        </p>
      )}

      <CommentSection
        postId={basePost.id}
        initialComments={comments}
        currentUser={currentUser}
        returnUrl={pathname}
      />
    </main>
  );
}
