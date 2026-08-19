// [기존 콘텐츠 불러오기 모달] 게시글을 선택해 미리본 뒤 적용할 때만 작성 폼에 반영합니다.
"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { CloseIcon, RefreshIcon } from "@/images/icons";
import useFocusTrap from "@/hooks/useFocusTrap";
import { sanitizeCommunityHtml } from "@/lib/sanitizeCommunityHtml";
import {
  getPostsByAuthorId,
  getCurrentCommunityUser,
} from "@/lib/communityQueries";

export default function ContentFetcherModal({ open, onClose, onApply }) {
  const [posts, setPosts] = useState([]);
  const [previewPost, setPreviewPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const modalRef = useFocusTrap(open);
  const sanitizedPreviewContent = useMemo(
    () => sanitizeCommunityHtml(previewPost?.content ?? ""),
    [previewPost],
  );

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = event => {
      if (event.key === "Escape" && !isLoading) {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, isLoading, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setPreviewPost(null);

    const loadPosts = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const me = await getCurrentCommunityUser();
        if (!me) {
          throw new Error("기존 콘텐츠를 불러오려면 로그인이 필요합니다.");
        }

        const rows = await getPostsByAuthorId(me.id);
        if (isMounted) setPosts(rows ?? []);
      } catch (error) {
        console.error("기존 콘텐츠 조회에 실패했습니다.", error);
        if (isMounted) {
          setPosts([]);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "기존 콘텐츠를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPosts();
    return () => {
      isMounted = false;
    };
  }, [open]);

  if (!open) return null;

  const handleApply = () => {
    if (!previewPost) return;
    onApply(previewPost);
    onClose();
  };

  return (
    <div
      className="write-existingModalBackdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <section
        ref={modalRef}
        className="write-existingModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-existingModal-title"
        tabIndex={-1}
      >
        <header className="write-existingModal-header">
          <div>
            <h2
              id="write-existingModal-title"
              className="write-existingModal-title"
            >
              {previewPost ? "기존 콘텐츠 미리보기" : "기존 콘텐츠 불러오기"}
            </h2>
            <p className="write-existingModal-description">
              {previewPost
                ? "선택한 내용을 확인한 뒤 적용을 눌러야 작성 중인 글에 반영됩니다."
                : "내가 작성한 게시글을 선택해 미리볼 수 있습니다."}
            </p>
          </div>

          <button
            type="button"
            className="write-existingModal-closeButton"
            onClick={onClose}
            disabled={isLoading}
            aria-label="기존 콘텐츠 불러오기 모달 닫기"
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </header>

        <div className="write-existingModal-body">
          {previewPost ? (
            <article
              className="write-preview"
              aria-label="기존 콘텐츠 읽기 전용 미리보기"
            >
              <div className="write-preview-meta">
                <span className="write-preview-badge">읽기 전용</span>
                <div className="write-preview-context">
                  <span>{previewPost.board || "게시판 미지정"}</span>
                  {previewPost.createdAt && (
                    <time dateTime={previewPost.createdAt}>
                      {new Date(previewPost.createdAt).toLocaleDateString(
                        "ko-KR",
                      )}
                    </time>
                  )}
                </div>
                <h3 className="write-preview-title">
                  {previewPost.title || "제목 없음"}
                </h3>
                {previewPost.description && (
                  <p className="write-preview-description">
                    {previewPost.description}
                  </p>
                )}
                {Array.isArray(previewPost.tags) &&
                  previewPost.tags.length > 0 && (
                    <div className="write-preview-tags">
                      {previewPost.tags.map(tag => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                  )}
              </div>
              <div
                className="write-preview-content ql-editor"
                dangerouslySetInnerHTML={{ __html: sanitizedPreviewContent }}
              />
            </article>
          ) : (
            <>
              {isLoading && (
                <div className="write-existingModal-state" role="status">
                  <RefreshIcon aria-hidden="true" />
                  게시글을 불러오는 중입니다.
                </div>
              )}

              {!isLoading && errorMessage && (
                <div className="write-existingModal-error" role="alert">
                  {errorMessage}
                </div>
              )}

              {!isLoading && !errorMessage && posts.length === 0 && (
                <div className="write-existingModal-state">
                  불러올 수 있는 게시글이 없습니다.
                </div>
              )}

              {!isLoading && !errorMessage && posts.length > 0 && (
                <ul className="write-existingModal-list">
                  {posts.map(post => (
                    <li key={post.id} className="write-existingModal-item">
                      <button
                        type="button"
                        className="write-existingModal-selectButton"
                        onClick={() => setPreviewPost(post)}
                      >
                        <span className="write-existingModal-itemMeta">
                          <span>{post.board}</span>
                          {post.createdAt && (
                            <time dateTime={post.createdAt}>
                              {new Date(post.createdAt).toLocaleDateString(
                                "ko-KR",
                              )}
                            </time>
                          )}
                        </span>
                        <strong className="write-existingModal-itemTitle">
                          {post.title || "제목 없음"}
                        </strong>
                        {post.description && (
                          <span className="write-existingModal-itemDescription">
                            {post.description}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <footer className="write-existingModal-actions">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </Button>

          {previewPost && (
            <>
              <Button
                type="button"
                variant="tertiary"
                size="md"
                onClick={() => setPreviewPost(null)}
              >
                다시 선택
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleApply}
              >
                적용
              </Button>
            </>
          )}
        </footer>
      </section>
    </div>
  );
}
