// [글 작성 폼] (제목, 추가 설명 입력창)
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import ContentFetcher from "./ContentFetcher";

// React Quill SSR 이슈 방지를 위한 Dynamic Import
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "link",
  "image",
  "video",
];

const BOARDS = ["자유게시판", "Q&A", "정보공유"];

export default function WriteForm() {
  const [board, setBoard] = useState("자유게시판");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // 추가 설명 State
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

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

  // 폼 제출 함수
  const handleSubmit = e => {
    e.preventDefault();

    console.log({ board, title, description, content, tags });
  };

  return (
    <div className="write-form">
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
            <ContentFetcher />
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
              {BOARDS.map(boardName => (
                <option key={boardName} value={boardName}>
                  {boardName}
                </option>
              ))}
            </select>
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

            <div className="write-editorWrapper">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="함께 나누고 싶은 소중한 순간을 기록해 보세요."
                className="write-quillEditor"
              />
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
                    ✕
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
            <button type="submit" className="write-btnPrimary">
              등록
            </button>
          </div>

          {/* 커뮤니티 활동 안내 */}
          <div className="write-noticeCard">
            <div className="write-noticeTitle">
              <span className="write-infoIcon">ⓘ</span> 커뮤니티 활동 안내
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
    </div>
  );
}
