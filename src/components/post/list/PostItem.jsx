// [게시글 리스트] 내 개별 게시글 정보 (공지/일반 구분)
"use client";

import Link from "next/link";

export default function PostItem({ post, compact = false }) {
  const {
    id = 1,
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
    <Link
      href={`/post/${id}`}
      className={`post-item-itemCard ${isNotice ? "post-item-noticeCard" : ""} ${compact ? "post-item-compact" : ""}`}
    >
      <div className="post-item-headerRow">
        <span
          className={
            isNotice ? "post-item-noticeBadge" : "post-item-boardBadge"
          }
        >
          {isNotice ? "공지" : board}
        </span>

        <span className="post-item-date">{createdAt}</span>
      </div>

      <div className="post-item-contentGroup">
        <h3 className="post-item-title">
          {isNotice && <span className="post-item-noticeText">[공지] </span>}

          {title}
        </h3>

        {description && <p className="post-item-description">{description}</p>}
      </div>

      <div className="post-item-footerRow">
        <span className="post-item-author">{author}</span>

        <div className="post-item-statsGroup">
          <span className="post-item-statItem">조회 {views}</span>

          <span className="post-item-statItem">좋아요 {likes}</span>

          <span className="post-item-statItem">댓글 {commentsCount}</span>
        </div>
      </div>
    </Link>
  );
}
