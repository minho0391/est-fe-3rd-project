// [댓글 영역] (댓글 목록 및 입력창)
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { AccountCircleIcon, DeleteOutlined } from "@/images/icons";
import { createComment, deleteComment } from "@/lib/communityMutations";

const buildLoginUrl = returnUrl =>
  `/sign-in?returnUrl=${encodeURIComponent(returnUrl || "/post")}`;

export default function CommentSection({
  postId,
  initialComments = [],
  currentUser = null,
  returnUrl = "/post",
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const redirectToLogin = () => {
    router.push(buildLoginUrl(returnUrl));
  };

  const handleInputFocus = event => {
    if (currentUser) return;
    event.currentTarget.blur();
    redirectToLogin();
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!currentUser) {
      redirectToLogin();
      return;
    }

    const trimmedInput = commentInput.trim();
    if (!trimmedInput || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setActionError("");
      const newComment = await createComment(postId, trimmedInput);
      setComments(current => [newComment, ...current]);
      setCommentInput("");
    } catch (error) {
      console.error("댓글 등록 실패", error);
      setActionError(error?.message || "댓글 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async commentId => {
    try {
      setActionError("");
      const deletedIds = await deleteComment(commentId);
      const deletedIdSet = new Set((deletedIds ?? []).map(String));
      setComments(current =>
        current.filter(item => !deletedIdSet.has(String(item.id))),
      );
    } catch (error) {
      console.error("댓글 삭제 실패", error);
      setActionError(error?.message || "댓글 삭제에 실패했습니다.");
    }
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
          onFocus={handleInputFocus}
          onClick={() => {
            if (!currentUser) redirectToLogin();
          }}
          placeholder="따뜻한 댓글을 남겨주세요."
          className="comments-textarea"
          rows={3}
          readOnly={!currentUser}
        />

        {actionError && (
          <p className="comments-actionError" role="alert">
            {actionError}
          </p>
        )}

        <div className="comments-inputActionRow">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={
              isSubmitting || (Boolean(currentUser) && !commentInput.trim())
            }
          >
            {isSubmitting ? "등록 중..." : "댓글 등록"}
          </Button>
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
                  <div className="comments-avatarPlaceholder">
                    <AccountCircleIcon aria-hidden="true" />
                  </div>
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

                  {comment.authorId === currentUser?.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="comments-deleteBtn"
                      aria-label="댓글 삭제"
                    >
                      <DeleteOutlined aria-hidden="true" fontSize="small" />
                      <span>삭제</span>
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
