// [AI 콘텐츠 생성 모달] Next.js API Route(/api/generate-community-post)를 호출해 게시글 초안을 생성합니다.
"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { CloseIcon } from "@/images/icons";
import useFocusTrap from "@/hooks/useFocusTrap";

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

// Alan의 평문 본문을 Quill에서 문단이 유지되는 HTML로 변환합니다.
const toQuillHtml = value => {
  const text = String(value ?? "").trim();
  if (!text) return "";

  // 이미 HTML로 반환된 경우에는 중복 변환하지 않습니다.
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
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTitle(initialTitle);
    setDescription(initialDescription);
    setKeywords(initialKeywords.join(", "));
    setErrorMessage("");
  }, [open, initialTitle, initialDescription, initialKeywords]);

  const modalRef = useFocusTrap(open);

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
        headers: {
          "Content-Type": "application/json",
        },
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

      onApply({
        title: data?.title ?? "",
        description: data?.description ?? "",
        content: toQuillHtml(data?.content),
        tags: Array.isArray(data?.tags) ? data.tags : [],
        isAiGenerated: true,
      });
      onClose();
    } catch (error) {
      console.error("AI 콘텐츠 생성에 실패했습니다.", error);
      setErrorMessage(
        "AI 콘텐츠를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="write-aiModalBackdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isLoading) {
          onClose();
        }
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
              AI 콘텐츠 생성
            </h2>
            <p className="write-aiModal-description">
              제목, 설명, 키워드를 바탕으로 게시글 초안을 생성합니다.
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
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? "생성 중..." : "AI 초안 생성"}
          </Button>
        </footer>
      </section>
    </div>
  );
}
