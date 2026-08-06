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

// [기존 콘텐츠 불러오기 모달] 로그인 사용자가 작성한 게시글을 Supabase에서 조회합니다.
"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { CloseIcon, RefreshIcon } from "@/images/icons";
import { supabase } from "@/lib/supabase";

const normalizePost = post => ({
  id: post.id,
  board: post.board_type ?? post.boardType ?? "자유게시판",
  title: post.title ?? "",
  description: post.description ?? "",
  content: post.content ?? "",
  tags: Array.isArray(post.tags) ? post.tags : [],
  isAiGenerated: Boolean(post.is_ai_generated ?? post.isAiGenerated),
  createdAt: post.created_at ?? post.createdAt ?? "",
});

export default function ContentFetcherModal({ open, onClose, onApply }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = event => {
      if (event.key === "Escape" && !isLoading) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, isLoading, onClose]);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const loadPosts = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          throw new Error("기존 콘텐츠를 불러오려면 로그인이 필요합니다.");
        }

        const { data, error } = await supabase
          .from("posts")
          .select(
            "id, board_type, title, description, content, tags, is_ai_generated, created_at",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (isMounted) setPosts((data ?? []).map(normalizePost));
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

  const handleSelect = post => {
    onApply(post);
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
        className="write-existingModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-existingModal-title"
      >
        <header className="write-existingModal-header">
          <div>
            <h2
              id="write-existingModal-title"
              className="write-existingModal-title"
            >
              기존 콘텐츠 불러오기
            </h2>
            <p className="write-existingModal-description">
              내가 작성한 게시글을 선택하면 현재 작성 폼에 내용을 채웁니다.
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
                    onClick={() => handleSelect(post)}
                  >
                    <span className="write-existingModal-itemMeta">
                      <span>{post.board}</span>
                      {post.createdAt && (
                        <time dateTime={post.createdAt}>
                          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
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
        </div>

        <footer className="write-existingModal-actions">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            닫기
          </Button>
        </footer>
      </section>
    </div>
  );
}
