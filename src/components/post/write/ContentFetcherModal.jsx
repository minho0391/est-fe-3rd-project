// [기존 콘텐츠 불러오기 모달] 로그인 사용자가 작성한 게시글을 Supabase에서 조회합니다.
"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { CloseIcon, RefreshIcon } from "@/images/icons";
import {
  getPostsByAuthorId,
  getCurrentCommunityUser,
} from "@/lib/communityQueries";

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
        const me = await getCurrentCommunityUser();

        if (!me) {
          throw new Error("기존 콘텐츠를 불러오려면 로그인이 필요합니다.");
        }

        const posts = await getPostsByAuthorId(me.id);

        if (isMounted) setPosts(posts ?? []);
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
