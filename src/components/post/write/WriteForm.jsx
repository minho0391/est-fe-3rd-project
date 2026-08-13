// [글 작성 폼] (제목, 추가 설명 입력창)
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "react-quill-new/dist/quill.snow.css";
import ContentFetcher from "./ContentFetcher";
import AiContentModal from "./AiContentModal";
import ContentFetcherModal from "./ContentFetcherModal";
import Button from "@/components/ui/Button";
import { CloseIcon, InfoOutlinedIcon } from "@/images/icons";
import {
  getCommunityBoards,
  getCurrentCommunityUser,
} from "@/lib/communityQueries";
import {
  createPost,
  updatePost,
  uploadPostImage,
} from "@/lib/communityMutations";
import { normalizeCommunityVideoEmbeds } from "@/lib/sanitizeCommunityHtml";

// React Quill SSR 이슈 방지를 위한 Dynamic Import
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// 일반 링크는 상세 페이지 sanitizer와 동일하게 http/https URL만 허용합니다.
// 단순 문자열(예: abc)이나 잘못된 호스트가 링크로 저장되지 않도록 URL 형식도 검증합니다.
const normalizeExternalUrl = rawUrl => {
  const value = String(rawUrl ?? "").trim();
  if (!value || /\s/.test(value)) return "";
  if (/^(mailto:|tel:)/i.test(value)) return "";

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (!url.hostname || !url.hostname.includes(".")) return "";
    return url.href;
  } catch {
    return "";
  }
};

// 영상 iframe은 출력 sanitizer allowlist와 동일하게 YouTube/Vimeo만 허용합니다.
// "안녕하세요", "test", "abc"처럼 유효한 URL 호스트가 아니거나 지원하지 않는 도메인은
// iframe을 만들지 않고 빈 문자열을 반환해 사용자 안내만 표시합니다.
// 일반 URL은 에디터의 링크 버튼으로 입력합니다.
const normalizeVideoUrl = rawUrl => {
  const normalized = normalizeExternalUrl(rawUrl);
  if (!normalized) return "";

  try {
    const url = new URL(normalized);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        const videoId = url.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }

      const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/);
      return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : "";
    }

    if (host === "vimeo.com") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return /^\d+$/.test(videoId ?? "")
        ? `https://player.vimeo.com/video/${videoId}`
        : "";
    }

    if (host === "player.vimeo.com") {
      const match = url.pathname.match(/^\/video\/(\d+)/);
      return match?.[1] ? `https://player.vimeo.com/video/${match[1]}` : "";
    }

    return "";
  } catch {
    return "";
  }
};

const isQuillContentEmpty = value => {
  if (!value) return true;

  const hasEmbeddedContent = /<(img|video|iframe)\b/i.test(value);
  if (hasEmbeddedContent) return false;

  return (
    value
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length === 0
  );
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "align",
  "link",
  "image",
  "video",
];

export default function WriteForm({ initialValues = null, postId = null }) {
  const router = useRouter();
  const editorWrapperRef = useRef(null);
  const isEditMode = Boolean(postId);
  const [board, setBoard] = useState(initialValues?.board ?? "자유게시판");
  const [boards, setBoards] = useState([]);
  const [boardsError, setBoardsError] = useState("");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  ); // 추가 설명 State
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [contentSource, setContentSource] = useState("MANUAL");
  const [tags, setTags] = useState(initialValues?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExistingModalOpen, setIsExistingModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: ["", "center", "right", "justify"] }],
          ["link", "video", "image"],
          ["clean"],
        ],
        handlers: {
          image: function handleImage() {
            const quill = this.quill;
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.click();

            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;

              try {
                const imageUrl = await uploadPostImage(file);
                const range = quill.getSelection(true);
                const index = range?.index ?? quill.getLength();

                quill.insertEmbed(index, "image", imageUrl, "user");
                quill.setSelection(index + 1, 0, "silent");
              } catch (error) {
                console.error("본문 이미지 업로드 실패", error);
                window.alert(
                  error?.message ||
                    "이미지 업로드에 실패했습니다. 다시 시도해 주세요.",
                );
              }
            };
          },
          video: function handleVideo() {
            const quill = this.quill;
            const rawUrl = window.prompt(
              "YouTube 또는 Vimeo URL을 입력해 주세요.",
            );
            if (!rawUrl) return;

            const videoUrl = normalizeVideoUrl(rawUrl);
            if (!videoUrl) {
              window.alert("YouTube 또는 Vimeo URL만 입력해 주세요.");
              return;
            }

            const range = quill.getSelection(true);
            const index = range?.index ?? quill.getLength();
            quill.insertEmbed(index, "video", videoUrl, "user");
            quill.setSelection(index + 1, 0, "silent");
          },
          link: function handleLink(value) {
            const quill = this.quill;
            const currentRange = quill.getSelection(true);
            if (!currentRange) return;

            if (value === false) {
              quill.format("link", false, "user");
              return;
            }

            const rawUrl = window.prompt("연결할 URL을 입력해 주세요.");
            if (!rawUrl) return;

            const linkUrl = normalizeExternalUrl(rawUrl);
            if (!linkUrl) {
              window.alert("올바른 URL을 입력해 주세요.");
              return;
            }

            if (currentRange.length > 0) {
              quill.format("link", linkUrl, "user");
              return;
            }

            quill.insertText(
              currentRange.index,
              linkUrl,
              "link",
              linkUrl,
              "user",
            );
            quill.setSelection(
              currentRange.index + linkUrl.length,
              0,
              "silent",
            );
          },
        },
      },
    }),
    [],
  );

  const showEditorPlaceholder =
    !isEditorFocused && isQuillContentEmpty(content);

  useEffect(() => {
    let isMounted = true;

    const loadBoards = async () => {
      try {
        setBoardsError("");
        const [rows, currentUser] = await Promise.all([
          getCommunityBoards(),
          getCurrentCommunityUser(),
        ]);

        if (!isMounted) return;

        const isAdmin = currentUser?.role === "관리자";
        const writableBoards = rows.filter(
          item => item.write_role !== "admin" || isAdmin,
        );

        setBoards(writableBoards);

        const hasCurrentBoard = writableBoards.some(
          item => item.name === board,
        );
        if (!hasCurrentBoard && writableBoards.length > 0) {
          const defaultBoard =
            writableBoards.find(item => item.name === "자유게시판")?.name ??
            writableBoards[0].name;
          setBoard(defaultBoard);
        }
      } catch (error) {
        console.error("게시판 목록을 불러오지 못했습니다.", error);

        if (isMounted) {
          setBoards([]);
          setBoardsError("게시판 목록을 불러오지 못했습니다.");
        }
      }
    };

    loadBoards();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const wrapper = editorWrapperRef.current;
    if (!wrapper) return undefined;

    let observedToolbar = null;

    const updateToolbarHeight = toolbar => {
      if (!toolbar) return;

      wrapper.style.setProperty(
        "--quill-toolbar-height",
        `${toolbar.getBoundingClientRect().height}px`,
      );
    };

    // ResizeObserver는 컴포넌트 생명주기 동안 한 번만 생성합니다.
    const toolbarResizeObserver = new ResizeObserver(entries => {
      const [entry] = entries;
      const toolbar = entry?.target;

      if (toolbar instanceof HTMLElement) {
        updateToolbarHeight(toolbar);
      }
    });

    const observeToolbar = () => {
      const toolbar = wrapper.querySelector(".ql-toolbar");
      if (!toolbar || toolbar === observedToolbar) return;

      if (observedToolbar) {
        toolbarResizeObserver.unobserve(observedToolbar);
      }

      observedToolbar = toolbar;
      toolbarResizeObserver.observe(toolbar);
      updateToolbarHeight(toolbar);
    };

    // Dynamic import 이후 툴바가 마운트되는 시점만 감지합니다.
    const toolbarMountObserver = new MutationObserver(observeToolbar);
    toolbarMountObserver.observe(wrapper, { childList: true, subtree: true });
    observeToolbar();

    return () => {
      toolbarMountObserver.disconnect();
      toolbarResizeObserver.disconnect();
    };
  }, []);

  const handleApplyAiContent = generatedPost => {
    setTitle(generatedPost.title ?? "");
    setDescription(generatedPost.description ?? "");
    setContent(generatedPost.content ?? "");
    setTags(Array.isArray(generatedPost.tags) ? generatedPost.tags : []);
    setContentSource("AI");
  };

  const handleApplyExistingContent = selectedPost => {
    setBoard(selectedPost.board ?? "자유게시판");
    setTitle(selectedPost.title ?? "");
    setDescription(selectedPost.description ?? "");
    setContent(selectedPost.content ?? "");
    setTags(Array.isArray(selectedPost.tags) ? selectedPost.tags : []);
    setContentSource(selectedPost.isAiGenerated ? "AI" : "EXISTING");
  };

  // 태그 추가 함수
  const handleAddTag = () => {
    const trimmedInput = tagInput.trim();

    if (trimmedInput && !tags.includes(trimmedInput)) {
      setTags([...tags, trimmedInput]);
      setTagInput("");
    }
  };

  // Enter 키로 태그 추가 시 폼 제출 방지
  const handleKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault();

      handleAddTag();
    }
  };

  // 태그 삭제 함수
  const handleRemoveTag = tagToRemove => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 실제 Supabase posts 테이블에 저장한 뒤 생성된 게시글 상세로 이동합니다.
  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isQuillContentEmpty(content)) {
      setSubmitError("내용을 입력해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      // 과거 데이터나 일반 링크 형태로 남은 YouTube/Vimeo URL도
      // 저장 전에 Quill 영상 iframe 마크업으로 통일합니다.
      const normalizedContent = normalizeCommunityVideoEmbeds(content);

      if (isEditMode) {
        await updatePost(postId, {
          board,
          title,
          description,
          content: normalizedContent,
          tags,
        });
        router.push(`/post/${postId}`);
      } else {
        const createdPostId = await createPost({
          board,
          title,
          description,
          content: normalizedContent,
          tags,
          isAiGenerated: contentSource === "AI",
        });
        router.push(`/post/${createdPostId}`);
      }
    } catch (error) {
      console.error(
        isEditMode ? "게시글 수정 실패" : "게시글 등록 실패",
        error,
      );
      setSubmitError(
        error?.message ||
          (isEditMode
            ? "게시글 수정에 실패했습니다. 다시 시도해 주세요."
            : "게시글 등록에 실패했습니다. 다시 시도해 주세요."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="write-pageContent">
      <div className="write-container">
        {/* Header Area */}
        <div className="write-headerRow">
          <div className="write-titleGroup">
            <h1 className="write-pageTitle">
              {isEditMode ? "게시글 수정" : "커뮤니티 글 작성"}
            </h1>

            <p className="write-pageSubtitle">
              {isEditMode
                ? "작성한 게시글의 내용을 수정할 수 있습니다."
                : "소중한 순간을 커뮤니티와 함께 나누어 보세요."}
            </p>
          </div>

          <div className="write-fetcherGroup">
            <ContentFetcher
              onAiGenerate={() => setIsAiModalOpen(true)}
              onExistingContent={() => setIsExistingModalOpen(true)}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="write-form">
          {/* 게시판 선택 */}
          <div className="write-section">
            <label className="write-label">게시판 선택</label>

            <select
              value={board}
              onChange={e => setBoard(e.target.value)}
              className="write-select"
            >
              {boards.map(boardItem => (
                <option key={boardItem.id} value={boardItem.name}>
                  {boardItem.name}
                </option>
              ))}
            </select>

            {boardsError && (
              <p className="write-boardError" role="alert">
                {boardsError}
              </p>
            )}
          </div>

          {/* 제목 */}
          <div className="write-section">
            <label className="write-label">제목</label>

            <input
              type="text"
              placeholder="제목을 입력해 주세요."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="write-input"
              required
            />
          </div>

          {/* 추가 설명 (한 줄 소개) */}
          <div className="write-section">
            <label className="write-label">추가 설명</label>

            <textarea
              placeholder="게시글에 대한 간단한 설명을 입력해 주세요."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="write-textarea"
              rows={3}
            />
          </div>

          {/* 내용 */}
          <div className="write-section">
            <label className="write-label">내용</label>

            <div ref={editorWrapperRef} className="write-editorWrapper">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                onFocus={() => setIsEditorFocused(true)}
                onBlur={() => setIsEditorFocused(false)}
                modules={modules}
                formats={formats}
                className="write-quillEditor"
              />

              {showEditorPlaceholder && (
                <span className="write-editorPlaceholder" aria-hidden="true">
                  함께 나누고 싶은 소중한 순간을 기록해 보세요.
                </span>
              )}
            </div>
          </div>

          {/* 태그 영역 */}
          <div className="write-section">
            <label className="write-label">태그</label>

            <div className="write-tagContainer">
              {tags.map(tag => (
                <span key={tag} className="write-tagChip">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="write-tagRemoveBtn"
                    aria-label={`${tag} 태그 삭제`}
                  >
                    <CloseIcon aria-hidden="true" fontSize="small" />
                  </button>
                </span>
              ))}

              <div className="write-tagInputWrapper">
                <input
                  type="text"
                  placeholder="+ 태그 추가 (Enter)"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="write-tagInput"
                />
              </div>
            </div>
          </div>

          {/* 등록 버튼 영역 */}
          {submitError && (
            <p className="write-submitError" role="alert">
              {submitError}
            </p>
          )}

          <div className="write-actionRow">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? "수정 중..."
                  : "등록 중..."
                : isEditMode
                  ? "수정하기"
                  : "등록"}
            </Button>
          </div>

          {/* 커뮤니티 활동 안내 */}
          <div className="write-noticeCard">
            <div className="write-noticeTitle">
              <InfoOutlinedIcon className="write-infoIcon" aria-hidden="true" />
              커뮤니티 활동 안내
            </div>

            <p className="write-noticeText">
              커뮤니티 정회원은 누구나 자유롭게 글을 작성하고, 서로의 생각에
              좋아요와 댓글로 공감할 수 있습니다.
              <br />
              따뜻하고 건강한 커뮤니티 문화를 위해 서로를 존중해 주세요.
            </p>
          </div>
        </form>
      </div>

      <AiContentModal
        open={isAiModalOpen}
        initialTitle={title}
        initialDescription={description}
        initialKeywords={tags}
        onClose={() => setIsAiModalOpen(false)}
        onApply={handleApplyAiContent}
      />

      <ContentFetcherModal
        open={isExistingModalOpen}
        onClose={() => setIsExistingModalOpen(false)}
        onApply={handleApplyExistingContent}
      />
    </div>
  );
}
