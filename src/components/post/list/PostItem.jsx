// [게시글 리스트] 내 개별 게시글 정보 (공지/일반 구분)
"use client";

import React from "react";

export default function PostItem({ post }) {
  // 샘플 데이터가 없을 경우를 대비한 기본값
  const {
    isNotice = false,
    board = "자유게시판",
    title = "게시글 제목이 들어갈 위치입니다.",
    description = "게시글에 대한 간단한 요약 설명 영역입니다.",
    author = "작성자",
    createdAt = "2026.08.01",
    views = 0,
    likes = 0,
    commentsCount = 0,
  } = post || {};

  return (
    <div
      className={`${"post-item-itemCard"} ${isNotice ? "post-item-noticeCard" : ""}`}
    >
      {/* 상단 뱃지 영역 (공지 / 일반 게시판 구분) */}
      <div className="post-item-headerRow">
        {isNotice ? (
          <span className="post-item-noticeBadge">📢 공지사항</span>
        ) : (
          <span className="post-item-boardBadge">{board}</span>
        )}

        <span className="post-item-date">{createdAt}</span>
      </div>

      {/* 게시글 제목 및 요약 설명 */}
      <div className="post-item-contentGroup">
        <h3 className="post-item-title">
          {isNotice && <span className="post-item-noticeText">[공지] </span>}

          {title}
        </h3>

        {description && <p className="post-item-description">{description}</p>}
      </div>

      {/* 하단 메타 정보 (작성자, 조회수, 좋아요, 댓글 수) */}
      <div className="post-item-footerRow">
        <div className="post-item-authorGroup">
          <span className="post-item-author">{author}</span>
        </div>

        <div className="post-item-statsGroup">
          <span className="post-item-statItem">👁️ {views}</span>

          <span className="post-item-statItem">❤️ {likes}</span>

          <span className="post-item-statItem">💬 {commentsCount}</span>
        </div>
      </div>
    </div>
  );
}
