"use client";

import "@/community/common.css";
import "@/community/post.css";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WriteForm from "@/components/post/write/WriteForm";
import {
  getCommunityPostById,
  getCurrentCommunityUser,
} from "@/lib/communityQueries";

export default function PostEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadPost = async () => {
      try {
        setLoading(true);
        setError("");

        const [row, user] = await Promise.all([
          getCommunityPostById(id),
          getCurrentCommunityUser(),
        ]);

        if (!active) return;

        if (!row || !user || row.authorId !== user.id) {
          setError("본인이 작성한 게시글만 수정할 수 있습니다.");
          return;
        }

        setPost(row);
      } catch (loadError) {
        if (!active) return;
        setError(loadError?.message || "게시글을 불러오지 못했습니다.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPost();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="community-scope community-page detail-page-container">
        <p className="community-listState">게시글을 불러오는 중입니다.</p>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="community-scope community-page detail-page-container">
        <p className="community-listState community-listStateError">{error}</p>
        <button
          type="button"
          className="detail-page-backBtn"
          onClick={() => router.replace(`/post/${id}`)}
        >
          상세로 돌아가기
        </button>
      </main>
    );
  }

  const initialValues = {
    board: post.board,
    title: post.title,
    description: post.description,
    content: post.content,
    tags: post.tags,
  };

  return (
    <main className="community-scope community-page post-write-page">
      <WriteForm postId={post.id} initialValues={initialValues} />
    </main>
  );
}
