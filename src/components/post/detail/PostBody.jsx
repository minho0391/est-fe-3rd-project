// [본문 영역] (제목, 작성자, 공유된 AI 생성 콘텐츠 내용)
"use client";

import React from "react";

export default function PostDetailContent({ post }) {
  // 전달받은 post 데이터가 없을 경우 기본 렌더링용 객체
  const defaultPost = {
    title: "AI로 작성한 2026년 주간 생산성 향상 리포트",
    author: {
      name: "김철수",
      avatarUrl: "https://via.placeholder.com/40",
      role: "정회원",
    },
    createdAt: "2026-08-01 14:30",
    views: 342,
    likes: 45,
    board: "정보공유",
    tags: ["AI생성", "생산성", "개발일지"],
    // 공유된 AI 생성 콘텐츠 (HTML/텍스트 형태)
    content: `
      <p>이번 주에 진행한 <strong>AI 기반 업무 자동화 프로젝트</strong>의 성과 요약입니다.</p>
      <h3>1. 주요 성과</h3>
      <ul>
        <li>반복적인 이메일 작성 시간 50% 단축</li>
        <li>Next.js 컴포넌트 자동 생성 파이프라인 구축</li>
      </ul>
      <blockquote>"AI 도구를 적극 활용하면 본연의 비즈니스 로직 설계에 훨씬 더 집중할 수 있습니다."</blockquote>
      <p>궁금하신 점은 댓글로 남겨주세요!</p>
    `,
  };

  const { title, author, createdAt, views, likes, board, tags, content } =
    post || defaultPost;

  return (
    <article className="post-body-container">
      {/* 1. 게시판 카테고리 & 제목 */}
      <div className="post-body-header">
        <h1 className="post-body-title">{title}</h1>

        <span className="post-body-boardBadge">{board}</span>
      </div>

      {/* 2. 작성자 및 게시글 정보 영역 */}
      <div className="post-body-authorRow">
        <div className="post-body-authorInfo">
          {author?.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={`${author.name} 프로필`}
              className="post-body-avatar"
            />
          ) : (
            <div className="post-body-avatarPlaceholder">👤</div>
          )}

          <div className="post-body-authorMeta">
            <div className="post-body-nameGroup">
              <span className="post-body-authorName">{author?.name}</span>

              <span className="post-body-roleBadge">{author?.role}</span>
            </div>

            <span className="post-body-postDate">{createdAt}</span>
          </div>
        </div>

        <div className="post-body-postStats">
          <span>조회수 {views}</span>

          <span>·</span>

          <span>좋아요 {likes}</span>
        </div>
      </div>

      <hr className="post-body-divider" />

      {/* 3. 공유된 AI 생성 콘텐츠 내용 영역 */}
      <div className="post-body-contentWrapper">
        <div className="post-body-aiBadge">
          <span>✨ AI로 생성 및 공유된 콘텐츠입니다.</span>
        </div>

        {/* HTML 태그를 그대로 렌더링할 때 dangerouslySetInnerHTML 활용 */}
        <div
          className="post-body-articleBody"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* 4. 태그 영역 */}
      {tags && tags.length > 0 && (
        <div className="post-body-tagList">
          {tags.map(tag => (
            <span key={tag} className="post-body-tagItem">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
