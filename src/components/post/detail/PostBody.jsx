// [본문 영역] (제목, 작성자, 공유된 AI 생성 콘텐츠 내용)
"use client";

import React from "react";
import {
  AccountCircleIcon,
  AutoAwesomeIcon,
  FavoriteBorderIcon,
  FavoriteIcon,
  RemoveRedEyeIcon,
} from "@/images/icons";

export default function PostDetailContent({
  post,
  isLiked = false,
  isLikePending = false,
  onLikeToggle,
}) {
  if (!post) return null;

  const {
    title,
    author,
    createdAt,
    views,
    likes,
    board,
    tags,
    content,
    isAiGenerated = false,
  } = post;

  return (
    <article className="post-body-container">
      <div className="post-body-header">
        <h1 className="post-body-title">{title}</h1>
        <span className="post-body-boardBadge">{board}</span>
      </div>

      <div className="post-body-authorRow">
        <div className="post-body-authorInfo">
          {author?.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={`${author.name} 프로필`}
              className="post-body-avatar"
            />
          ) : (
            <div className="post-body-avatarPlaceholder">
              <AccountCircleIcon aria-hidden="true" />
            </div>
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
          <span className="post-body-statItem">
            <RemoveRedEyeIcon aria-hidden="true" fontSize="small" />
            <span>조회수 {views}</span>
          </span>

          <button
            type="button"
            className={`post-body-likeButton ${isLiked ? "post-body-likeButtonActive" : ""}`}
            aria-pressed={isLiked}
            onClick={onLikeToggle}
            disabled={isLikePending}
          >
            {isLiked ? (
              <FavoriteIcon aria-hidden="true" fontSize="small" />
            ) : (
              <FavoriteBorderIcon aria-hidden="true" fontSize="small" />
            )}
            <span>좋아요 {likes}</span>
          </button>
        </div>
      </div>

      <hr className="post-body-divider" />

      <div className="post-body-contentWrapper">
        {isAiGenerated && (
          <div className="post-body-aiBadge">
            <span>
              <AutoAwesomeIcon aria-hidden="true" fontSize="small" />
              AI 로 생성 및 공유된 콘텐츠입니다.
            </span>
          </div>
        )}

        <div
          className="post-body-articleBody"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

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
