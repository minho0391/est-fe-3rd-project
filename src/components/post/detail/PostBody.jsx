// [본문 영역] (제목, 작성자, 공유된 AI 생성 콘텐츠 내용)
"use client";

import React from "react";

export default function PostDetailContent({
  post,
  isLiked = false,
  onLikeToggle,
}) {
  if (!post) return null;

  const { title, author, createdAt, views, likes, board, tags, content } = post;

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

          <button
            type="button"
            className={`post-body-likeButton ${isLiked ? "post-body-likeButtonActive" : ""}`}
            aria-pressed={isLiked}
            onClick={onLikeToggle}
          >
            {isLiked ? "좋아요 취소" : "좋아요"} {likes}
          </button>
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
