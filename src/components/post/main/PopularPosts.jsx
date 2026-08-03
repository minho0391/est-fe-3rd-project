// [인기 게시글 미리보기 영역]
"use client";

import React from "react";

export default function PopularPreview({ posts = [] }) {
  // 샘플 인기 게시글 데이터
  const samplePosts = [
    {
      id: 101,
      board: "자유게시판",
      title: "이번 주 꼭 확인해야 할 주요 커뮤니티 이슈 모음",
      commentCount: 24,
      likes: 182,
      createdAt: "10분 전",
    },
    {
      id: 102,
      board: "정보공유",
      title: "개발자 및 기획자를 위한 2026 생산성 툴 추천 TOP 5",
      commentCount: 15,
      likes: 145,
      createdAt: "1시간 전",
    },
    {
      id: 103,
      board: "Q&A",
      title: "Next.js App Router에서 컴포넌트 구조 깔끔하게 짜는 팁 질문",
      commentCount: 32,
      likes: 98,
      createdAt: "3시간 전",
    },
  ];

  const displayPosts = posts.length > 0 ? posts : samplePosts;

  return (
    <section className="popular-container">
      <div className="popular-header">
        <div className="popular-titleGroup">
          <span className="popular-fireIcon">🔥</span>

          <h3 className="popular-title">지금 인기 있는 게시글</h3>
        </div>

        <button type="button" className="popular-moreBtn">
          전체보기 &gt;
        </button>
      </div>

      <div className="popular-postList">
        {displayPosts.map(post => (
          <div key={post.id} className="popular-postCard">
            <div className="popular-cardHeader">
              <span className="popular-boardBadge">{post.board}</span>

              <span className="popular-time">{post.createdAt}</span>
            </div>

            <h4 className="popular-postTitle">{post.title}</h4>

            <div className="popular-cardFooter">
              <div className="popular-statGroup">
                <span className="popular-statItem">❤️ {post.likes}</span>

                <span className="popular-statItem">💬 {post.commentCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
