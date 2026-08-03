// [댓글 영역] (댓글 목록 및 입력창)
"use client";

import React, { useState } from "react";

export default function CommentSection({ initialComments = [] }) {
  // 샘플 댓글 데이터
  const sampleComments = [
    {
      id: 1,
      author: "이영희",
      avatarUrl: "https://via.placeholder.com/36",
      content:
        "유익한 정보 감사합니다! AI 생성 콘텐츠도 품질이 아주 훌륭하네요.",
      createdAt: "10분 전",
    },
    {
      id: 2,
      author: "박민수",
      avatarUrl: "https://via.placeholder.com/36",
      content: "혹시 사용하신 프롬프트 공유도 가능한가요?",
      createdAt: "30분 전",
    },
  ];

  const [comments, setComments] = useState(
    initialComments.length > 0 ? initialComments : sampleComments,
  );

  const [commentInput, setCommentInput] = useState("");

  // 댓글 등록 처리
  const handleSubmit = e => {
    e.preventDefault();

    const trimmedInput = commentInput.trim();

    if (!trimmedInput) return;

    const newComment = {
      id: Date.now(),
      author: "현재 사용자", // 실제 구현 시 로그인한 사용자 정보 적용
      avatarUrl: "https://via.placeholder.com/36",
      content: trimmedInput,
      createdAt: "방금 전",
    };

    setComments([newComment, ...comments]);
    setCommentInput("");
  };

  // 댓글 삭제 처리
  const handleDelete = commentId => {
    setComments(comments.filter(item => item.id !== commentId));
  };

  return (
    <section className="comments-container">
      {/* 댓글 헤더 */}
      <div className="comments-header">
        <h3 className="comments-title">
          댓글 <span className="comments-count">{comments.length}</span>
        </h3>
      </div>

      {/* 1. 댓글 입력창 */}
      <form onSubmit={handleSubmit} className="comments-inputForm">
        <textarea
          value={commentInput}
          onChange={e => setCommentInput(e.target.value)}
          placeholder="따뜻한 댓글을 남겨주세요."
          className="comments-textarea"
          rows={3}
        />

        <div className="comments-inputActionRow">
          <button
            type="submit"
            disabled={!commentInput.trim()}
            className="comments-submitBtn"
          >
            댓글 등록
          </button>
        </div>
      </form>

      {/* 2. 댓글 목록 */}
      <div className="comments-commentList">
        {comments.length === 0 ? (
          <p className="comments-emptyMessage">첫 번째 댓글을 남겨보세요!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comments-commentItem">
              <div className="comments-avatarWrapper">
                {comment.avatarUrl ? (
                  <img
                    src={comment.avatarUrl}
                    alt={`${comment.author} 프로필`}
                    className="comments-avatar"
                  />
                ) : (
                  <div className="comments-avatarPlaceholder">👤</div>
                )}
              </div>

              <div className="comments-commentContentGroup">
                <div className="comments-commentHeader">
                  <div className="comments-authorMeta">
                    <span className="comments-authorName">
                      {comment.author}
                    </span>

                    <span className="comments-date">{comment.createdAt}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="comments-deleteBtn"
                  >
                    삭제
                  </button>
                </div>

                <p className="comments-commentText">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
