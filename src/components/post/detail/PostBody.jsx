// [본문 영역] (제목, 작성자, 공유된 AI 생성 콘텐츠 내용)
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AccountCircleIcon,
  AutoAwesomeIcon,
  FavoriteBorderIcon,
  FavoriteIcon,
  RemoveRedEyeIcon,
} from "@/images/icons";
import { sanitizeCommunityHtml } from "@/lib/sanitizeCommunityHtml";
import { submitCommunityReport } from "@/lib/communityMutations";

const buildLoginUrl = returnUrl =>
  `/sign-in?returnUrl=${encodeURIComponent(returnUrl || "/post")}`;

export default function PostDetailContent({
  post,
  isLiked = false,
  isLikePending = false,
  onLikeToggle,
  isOwner = false,
  isDeletePending = false,
  onDelete,
  currentUser = null,
  returnUrl = "/post",
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const safeContent = useMemo(
    () => sanitizeCommunityHtml(post?.content),
    [post?.content],
  );

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);
  if (!post) return null;
  const {
    title,
    author,
    createdAt,
    views,
    likes,
    board,
    tags,
    isAiGenerated = false,
  } = post;

  const sharePost = async () => {
    setMenuOpen(false);
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        window.alert("게시글 링크를 복사했습니다.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") console.error("공유 실패", error);
    }
  };

  return (
    <article className="post-body-container">
      <div className="post-body-header">
        <h1 className="post-body-title">{title}</h1>
        <div className="post-body-headerActions">
          <span className="post-body-boardBadge">{board}</span>
          <div className="community-moreWrap" ref={menuRef}>
            <button
              type="button"
              className="community-moreButton"
              aria-label="게시글 더보기"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(v => !v)}
            >
              ⋮
            </button>
            {menuOpen && (
              <div className="community-moreMenu" role="menu">
                {isOwner && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => router.push(`/post/${post.id}/edit`)}
                  >
                    수정하기
                  </button>
                )}
                <button type="button" role="menuitem" onClick={sharePost}>
                  공유하기
                </button>
                {isOwner && (
                  <button
                    type="button"
                    role="menuitem"
                    className="community-dangerMenuItem"
                    disabled={isDeletePending}
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.();
                    }}
                  >
                    {isDeletePending ? "삭제 중..." : "삭제하기"}
                  </button>
                )}
                {!isOwner && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => {
                      setMenuOpen(false);

                      // 댓글 신고와 동일하게 비로그인 사용자는 먼저 로그인 화면으로 보냅니다.
                      if (!currentUser) {
                        router.push(buildLoginUrl(returnUrl));
                        return;
                      }

                      const reason = window.prompt(
                        "신고 사유를 입력해 주세요. (2~300자)",
                      );
                      if (reason == null) return;

                      try {
                        await submitCommunityReport({
                          targetType: "post",
                          targetId: post.id,
                          reason,
                        });
                        window.alert(
                          "신고가 접수되었습니다. 운영진 검토 후 필요한 조치를 진행합니다.",
                        );
                      } catch (error) {
                        window.alert(
                          error?.message || "신고 접수에 실패했습니다.",
                        );
                      }
                    }}
                  >
                    신고하기
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
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
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      </div>
      {tags?.length > 0 && (
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
