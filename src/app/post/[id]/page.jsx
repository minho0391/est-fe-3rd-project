// [게시판 상세] 페이지 (localhost:3000/post/1)
"use client";

import "@/community/common.css";
import "@/community/post.css";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PostDetailContent from "@/components/post/detail/PostBody.jsx";
import CommentSection from "@/components/post/detail/Comments.jsx";
import {
  getCommunityPostById,
  getCommentsByPostId,
} from "@/data/communityPosts";

export default function PostDetailPage() {
  const params = useParams();

  const postId = params?.id;

  const staticPost = useMemo(
    () => (postId === "preview" ? null : getCommunityPostById(postId)),
    [postId],
  );

  const [previewPost, setPreviewPost] = useState(null);

  const basePost = previewPost ?? staticPost;

  const [views, setViews] = useState(basePost?.views ?? 0);

  const [likes, setLikes] = useState(basePost?.likes ?? 0);

  const [isLiked, setIsLiked] = useState(false);

  const countedPostRef = useRef(null);

  useEffect(() => {
    if (postId !== "preview") {
      setPreviewPost(null);
      return;
    }

    // TODO: Supabase 상세 조회 연동 후 /post/preview 분기 및 sessionStorage 미리보기 읽기 로직 제거
    const savedPost = sessionStorage.getItem("community-preview-post");

    if (!savedPost) {
      setPreviewPost(null);
      return;
    }

    try {
      setPreviewPost(JSON.parse(savedPost));
    } catch (error) {
      console.error("게시글 미리보기 데이터를 불러오지 못했습니다.", error);
      sessionStorage.removeItem("community-preview-post");
      setPreviewPost(null);
    }
  }, [postId]);

  useEffect(() => {
    if (!basePost) return;

    setViews(basePost.views ?? 0);
    setLikes(basePost.likes ?? 0);
    setIsLiked(false);

    if (countedPostRef.current !== basePost.id) {
      countedPostRef.current = basePost.id;
      setViews(current => current + 1);
    }
  }, [basePost?.id, basePost?.views, basePost?.likes]);

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
            삭제되었거나 존재하지 않는 게시글입니다.
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
    views,
    likes,
  };

  const initialComments = getCommentsByPostId(basePost.id);

  const handleLikeToggle = () => {
    setIsLiked(current => {
      setLikes(value => Math.max(0, value + (current ? -1 : 1)));
      return !current;
    });
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
        isLiked={isLiked}
        onLikeToggle={handleLikeToggle}
      />

      <CommentSection initialComments={initialComments} />
    </main>
  );
}
