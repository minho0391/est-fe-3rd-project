// 게시글 작성 공통 미리보기 컴포넌트
"use client";

import { useMemo } from "react";
import { sanitizeCommunityHtml } from "@/lib/sanitizeCommunityHtml";

export default function WritePreviewContent({ post, ariaLabel }) {
  const sanitizedContent = useMemo(
    () => sanitizeCommunityHtml(post?.content ?? ""),
    [post?.content],
  );

  if (!post) return null;

  return (
    <article className="write-preview" aria-label={ariaLabel}>
      <div className="write-preview-meta">
        <span className="write-preview-badge">읽기 전용</span>

        {(post.board || post.createdAt) && (
          <div className="write-preview-context">
            {post.board && <span>{post.board}</span>}
            {post.createdAt && (
              <time dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString("ko-KR")}
              </time>
            )}
          </div>
        )}

        <h3 className="write-preview-title">{post.title || "제목 없음"}</h3>

        {post.description && (
          <p className="write-preview-description">{post.description}</p>
        )}

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="write-preview-tags">
            {post.tags.map(tag => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div
        className="write-preview-content ql-editor"
        tabIndex={0}
        role="region"
        aria-label="미리보기 본문"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </article>
  );
}
