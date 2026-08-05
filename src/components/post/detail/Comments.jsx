// [댓글 영역] (댓글 목록 및 입력창)
"use client";

import React, { useState } from "react";
import { currentCommunityUser } from "@/data/communityPosts";

export default function CommentSection({ initialComments = [] }) {
  const [comments, setComments] = useState(initialComments);
  const [commentInput, setCommentInput] = useState("");

  const handleSubmit = event => {
    event.preventDefault();

    const trimmedInput = commentInput.trim();

    if (!trimmedInput) return;

    const newComment = {
      id: Date.now(),
      authorId: currentCommunityUser.id,
      author: currentCommunityUser.name,
      avatarUrl: currentCommunityUser.avatarUrl,
      content: trimmedInput,
      createdAt: "방금 전",
    };

    setComments(current => [newComment, ...current]);
    setCommentInput("");
  };

  const handleDelete = commentId => {
    setComments(current => current.filter(item => item.id !== commentId));
  };

  return (
    <section className="comments-container">
      <div className="comments-header">
        <h3 className="comments-title">
          댓글 <span className="comments-count">{comments.length}</span>
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="comments-inputForm">
        <textarea
          value={commentInput}
          onChange={event => setCommentInput(event.target.value)}
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

                  {comment.authorId === currentCommunityUser.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="comments-deleteBtn"
                    >
                      삭제
                    </button>
                  )}
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
