// [ 점검 및 확인 항목 ]               [ ✨ AI 콘텐츠 생성 ]   [ 🔄 기존 콘텐츠 불러오기 ]
// --------------------------------------------------------------------------------------
// 🔑 Supabase 환경 변수                     필  요                   필  요
// 🔌 Supabase 클라이언트                   필  요                   필  요
// 👤 로그인 세션                             권장 / 필요               필  요
// 🛡️ posts 테이블 & RLS 저장시            필  요                   필  요
// ⚡ generate-community-post 배포      필  요                 불 필 요
// 🤖 AI API 비밀 키                             필  요                 불 필 요
// --------------------------------------------------------------------------------------
// 💡 요약: AI 생성을 위해서는 Edge Function 배포 및 외부 AI API Key 세팅이 추가로 필요합니다.

// [AI 콘텐츠 생성 모달] Supabase Edge Function을 호출해 게시글 초안을 생성합니다.
"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { CloseIcon } from "@/images/icons";
import { supabase } from "@/lib/supabase";

const parseKeywords = value =>
  value
    .split(",")
    .map(keyword => keyword.trim())
    .filter(Boolean);

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
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTitle(initialTitle);
    setDescription(initialDescription);
    setKeywords(initialKeywords.join(", "));
    setFollowUpPrompt("");
    setErrorMessage("");
  }, [open, initialTitle, initialDescription, initialKeywords]);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = event => {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, isLoading, onClose]);

  if (!open) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setFollowUpPrompt("");

    try {
      const parsedKeywords = parseKeywords(keywords);
      const { data, error } = await supabase.functions.invoke(
        "generate-community-post",
        {
          body: {
            title: title.trim() || undefined,
            description: description.trim() || undefined,
            keywords: parsedKeywords,
          },
        },
      );

      if (error) throw error;

      if (data?.needsMoreInformation) {
        setFollowUpPrompt(
          data.followUpPrompt ?? "조금 더 자세한 정보를 입력해 주세요.",
        );
        return;
      }

      onApply({
        title: data?.title ?? "",
        description: data?.description ?? "",
        content: data?.content ?? "",
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
        className="write-aiModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-aiModal-title"
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

          {followUpPrompt && (
            <div className="write-aiModal-followUp" role="status">
              {followUpPrompt}
            </div>
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
