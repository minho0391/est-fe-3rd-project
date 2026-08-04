// [게시판 상세] 페이지 (localhost:3000/post/1)
"use client";

import React from "react";
import Link from "next/link";
import PostDetailContent from "@/components/post/detail/PostBody.jsx";
import CommentSection from "@/components/post/detail/Comments.jsx";

export default function PostDetailPage({ params }) {
  // 동적 파라미터 [id] 수신
  const postId = params?.id || "1";

  // 실제 서버 API 연동 전 사용할 데이터 구조
  const mockPostData = {
    id: postId,
    title: `[${postId}번] AI 기반 커뮤니티 게시글 상세 예시입니다.`,
    board: "정보공유",
    author: {
      name: "홍길동",
      avatarUrl: "https://via.placeholder.com/40",
      role: "정회원",
    },
    createdAt: "2026-08-01 14:30",
    views: 128,
    likes: 24,
    tags: ["게시판상세", "Nextjs", "React"],
    content: `
      <p>게시판 상세 페이지 본문 영역입니다.</p>
      <p>공유된 <strong>AI 콘텐츠</strong>와 다양한 사용자 의견을 이곳에서 확인하고 댓글을 작성할 수 있습니다.</p>
    `,
  };

  return (
    <main className="detail-page-container">
      {/* 1. 상단 목록 돌아가기 바 */}
      <div className="detail-page-navigationRow">
        <Link href="/post" className="detail-page-backBtn">
          ← 목록으로 돌아가기
        </Link>
      </div>

      {/* 2. 본문 영역 */}
      <PostDetailContent post={mockPostData} />

      {/* 3. 댓글 영역 */}
      <CommentSection />
    </main>
  );
}
