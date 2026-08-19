// [AI 콘텐츠 생성 모달] 생성 결과를 미리보기로 확인한 뒤 적용할 때만 작성 폼에 반영합니다.
"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { CloseIcon } from "@/images/icons";
import useFocusTrap from "@/hooks/useFocusTrap";
import { sanitizeCommunityHtml } from "@/lib/sanitizeCommunityHtml";

const parseKeywords = value =>
  value
    .split(",")
    .map(keyword => keyword.trim())
    .filter(Boolean);

const escapeHtml = value =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const toQuillHtml = value => {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text;

  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map(
      paragraph => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`,
    )
    .join("");
};

export default function AiContentModal({
  open,
  initialTitle = "",
  initialDescription = "",
  initialKeywords = [],
  onClose,
  onApply,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [previewPost, setPreviewPost] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTitle(initialTitle);
    setDescription(initialDescription);
    setKeywords(initialKeywords.join(", "));
    setPreviewPost(null);
    setErrorMessage("");
    setIsLoading(false);
  }, [open, initialTitle, initialDescription, initialKeywords]);

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

  if (!open) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const parsedKeywords = parseKeywords(keywords);
      const response = await fetch("/api/generate-community-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          keywords: parsedKeywords,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "AI 생성에 실패했습니다.");
      }

      // 생성 직후 작성 폼을 수정하지 않고 모달 내부의 임시 미리보기 상태에만 저장합니다.
      setPreviewPost({
        title: data?.title ?? "",
        description: data?.description ?? "",
        content: toQuillHtml(data?.content),
        tags: Array.isArray(data?.tags) ? data.tags : [],
        isAiGenerated: true,
      });
    } catch (error) {
      console.error("AI 콘텐츠 생성에 실패했습니다.", error);
      setErrorMessage(
        "AI 콘텐츠를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!previewPost) return;
    onApply(previewPost);
    onClose();
  };

  return (
    <div
      className="write-aiModalBackdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <section
        ref={modalRef}
        className="write-aiModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-aiModal-title"
        tabIndex={-1}
      >
        <header className="write-aiModal-header">
          <div>
            <h2 id="write-aiModal-title" className="write-aiModal-title">
              {previewPost ? "AI 콘텐츠 미리보기" : "AI 콘텐츠 생성"}
            </h2>
            <p className="write-aiModal-description">
              {previewPost
                ? "생성된 내용을 확인한 뒤 적용을 눌러야 작성 중인 글에 반영됩니다."
                : "제목, 설명, 키워드를 바탕으로 게시글 초안을 생성합니다."}
            </p>
          </div>

          <button
            type="button"
            className="write-aiModal-closeButton"
            onClick={onClose}
            disabled={isLoading}
            aria-label="AI 콘텐츠 생성 모달 닫기"
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </header>

        <div className="write-aiModal-body">
          {!previewPost ? (
            <>
              <label className="write-aiModal-field">
                <span>제목</span>
                <input
                  type="text"
                  value={title}
                  onChange={event => setTitle(event.target.value)}
                  placeholder="생성할 게시글의 제목"
                />
              </label>

              <label className="write-aiModal-field">
                <span>설명</span>
                <textarea
                  value={description}
                  onChange={event => setDescription(event.target.value)}
                  placeholder="게시글에서 다루고 싶은 내용을 입력해 주세요."
                />
              </label>

              <label className="write-aiModal-field">
                <span>키워드</span>
                <input
                  type="text"
                  value={keywords}
                  onChange={event => setKeywords(event.target.value)}
                  placeholder="여행, 제주, 추천"
                />
              </label>
            </>
          ) : (
            <article
              className="write-preview"
              aria-label="AI 생성 콘텐츠 읽기 전용 미리보기"
            >
              <div className="write-preview-meta">
                <span className="write-preview-badge">읽기 전용</span>
                <h3 className="write-preview-title">
                  {previewPost.title || "제목 없음"}
                </h3>
                {previewPost.description && (
                  <p className="write-preview-description">
                    {previewPost.description}
                  </p>
                )}
                {previewPost.tags.length > 0 && (
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
          )}

          {errorMessage && (
            <div className="write-aiModal-error" role="alert">
              {errorMessage}
            </div>
          )}
        </div>

        <footer className="write-aiModal-actions">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </Button>

          {previewPost ? (
            <>
              <Button
                type="button"
                variant="tertiary"
                size="md"
                onClick={() => setPreviewPost(null)}
              >
                다시 생성
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
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? "생성 중..." : "미리보기 생성"}
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
}
