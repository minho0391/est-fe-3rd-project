// [글 작성 폼] (제목, 추가 설명 입력창)
"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "react-quill-new/dist/quill.snow.css";
import ContentFetcher from "./ContentFetcher";
import AiContentModal from "./AiContentModal";
import ContentFetcherModal from "./ContentFetcherModal";
import Button from "@/components/ui/Button";
import { CloseIcon, InfoOutlinedIcon } from "@/images/icons";
import { getCommunityBoards } from "@/lib/communityQueries";

// React Quill SSR 이슈 방지를 위한 Dynamic Import
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: ["", "center", "right"] }],
    ["link", "video", "image"],
    ["clean"],
  ],
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

export default function WriteForm() {
  const router = useRouter();
  const editorWrapperRef = useRef(null);
  const [board, setBoard] = useState("자유게시판");
  const [boards, setBoards] = useState([]);
  const [boardsError, setBoardsError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // 추가 설명 State
  const [content, setContent] = useState("");
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [contentSource, setContentSource] = useState("MANUAL");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExistingModalOpen, setIsExistingModalOpen] = useState(false);

  const showEditorPlaceholder =
    !isEditorFocused && isQuillContentEmpty(content);

  useEffect(() => {
    let isMounted = true;

    const loadBoards = async () => {
      try {
        setBoardsError("");
        const rows = await getCommunityBoards();

        if (!isMounted) return;

        setBoards(rows);

        const hasCurrentBoard = rows.some(item => item.name === board);
        if (!hasCurrentBoard && rows.length > 0) {
          const defaultBoard =
            rows.find(item => item.name === "자유게시판")?.name ?? rows[0].name;
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

  // 폼 제출 함수: 목데이터 단계에서는 sessionStorage에 저장 후 미리보기 상세로 이동
  const handleSubmit = e => {
    e.preventDefault();

    const newPost = {
      id: "preview",
      board,
      title: title.trim(),
      description: description.trim(),
      content,
      tags,
      authorId: "user-1",
      author: "홍길동",
      authorRole: "정회원",
      authorAvatarUrl: "https://via.placeholder.com/40",
      createdAt: new Date().toISOString().slice(0, 10).replaceAll("-", "."),
      views: 0,
      likes: 0,
      commentsCount: 0,
      isAiGenerated: contentSource === "AI",
    };

    // TODO: Supabase 게시글 insert 연동 후 sessionStorage 미리보기 저장 및 /post/preview 이동 로직 제거
    sessionStorage.setItem("community-preview-post", JSON.stringify(newPost));
    router.push("/post/preview");
  };

  return (
    <div className="write-pageContent">
      <div className="write-container">
        {/* Header Area */}
        <div className="write-headerRow">
          <div className="write-titleGroup">
            <h1 className="write-pageTitle">커뮤니티 글 작성</h1>

            <p className="write-pageSubtitle">
              소중한 순간을 커뮤니티와 함께 나누어 보세요.
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
          <div className="write-actionRow">
            <Button type="submit" variant="primary" size="md">
              등록
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
