// [댓글 영역] (댓글 목록 및 입력창)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import {
  AccountCircleIcon,
  FavoriteBorderIcon,
  FavoriteIcon,
} from "@/images/icons";
import {
  createComment,
  deleteComment,
  submitCommunityReport,
  toggleCommentLike,
  updateComment,
} from "@/lib/communityMutations";

const buildLoginUrl = returnUrl =>
  `/sign-in?returnUrl=${encodeURIComponent(returnUrl || "/post")}`;

const MAX_REPLY_DEPTH = 1;

export default function CommentSection({
  postId,
  initialComments = [],
  currentUser = null,
  postAuthorId = null,
  returnUrl = "/post",
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [commentInput, setCommentInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyInput, setReplyInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  useEffect(() => setComments(initialComments), [initialComments]);
  const redirect = () => router.push(buildLoginUrl(returnUrl));
  // 댓글 수는 최상위 댓글 + 답글을 모두 포함한 active 댓글 수로 통일합니다.
  const totalCommentCount = comments.length;
  const roots = useMemo(() => comments.filter(c => !c.parentId), [comments]);
  const children = id =>
    comments.filter(c => String(c.parentId) === String(id));

  const submit = async (e, parentId = null) => {
    e.preventDefault();
    if (!currentUser) {
      redirect();
      return;
    }
    const value = (parentId ? replyInput : commentInput).trim();
    if (!value || isSubmitting) return;
    try {
      setIsSubmitting(true);
      setActionError("");
      const row = await createComment(postId, value, parentId);
      // 조회 기준이 최신순(created_at DESC)이므로 새 댓글/답글도 같은 위치 규칙으로 반영합니다.
      setComments(v => [row, ...v]);
      if (parentId) {
        setReplyInput("");
        setReplyTo(null);
      } else setCommentInput("");
    } catch (err) {
      setActionError(err?.message || "댓글 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const remove = async id => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      const ids = await deleteComment(id);
      const set = new Set((ids ?? []).map(String));
      setComments(v => v.filter(c => !set.has(String(c.id))));
      setOpenMenu(null);
    } catch (err) {
      setActionError(err?.message || "삭제에 실패했습니다.");
    }
  };
  const saveEdit = async id => {
    try {
      await updateComment(id, editInput);
      setComments(v =>
        v.map(c =>
          String(c.id) === String(id) ? { ...c, content: editInput.trim() } : c,
        ),
      );
      setEditingId(null);
      setOpenMenu(null);
    } catch (err) {
      setActionError(err?.message || "수정에 실패했습니다.");
    }
  };
  const like = async c => {
    if (!currentUser) {
      redirect();
      return;
    }
    try {
      const liked = await toggleCommentLike(c.id);
      setComments(v =>
        v.map(x =>
          String(x.id) === String(c.id)
            ? {
                ...x,
                likedByCurrentUser: liked,
                likes: Math.max(0, (x.likes || 0) + (liked ? 1 : -1)),
              }
            : x,
        ),
      );
    } catch (err) {
      setActionError(err?.message || "좋아요 처리에 실패했습니다.");
    }
  };

  const renderItem = (c, depth = 0) => {
    const own = c.authorId === currentUser?.id;
    const postOwner = currentUser?.id === postAuthorId;
    const canDelete = own || postOwner;
    const canReply = depth < MAX_REPLY_DEPTH;

    return (
      <div
        key={c.id}
        className={`comments-commentItem ${depth ? "comments-replyItem" : ""}`}
      >
        <div className="comments-avatarWrapper">
          {c.avatarUrl ? (
            <img
              src={c.avatarUrl}
              alt={`${c.author} 프로필`}
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
              <span className="comments-authorName">{c.author}</span>
              <span className="comments-date">{c.createdAt}</span>
            </div>
            <div className="community-moreWrap">
              <button
                type="button"
                className="community-moreButton community-moreButtonSmall"
                aria-label="댓글 더보기"
                onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
              >
                ⋮
              </button>
              {openMenu === c.id && (
                <div className="community-moreMenu comments-moreMenu">
                  {own && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditInput(c.content);
                        setOpenMenu(null);
                      }}
                    >
                      수정하기
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      className="community-dangerMenuItem"
                      onClick={() => remove(c.id)}
                    >
                      삭제하기
                    </button>
                  )}
                  {!own && !postOwner && (
                    <button
                      type="button"
                      onClick={async () => {
                        setOpenMenu(null);
                        if (!currentUser) {
                          redirect();
                          return;
                        }

                        const reason = window.prompt(
                          "신고 사유를 입력해 주세요. (2~300자)",
                        );
                        if (reason == null) return;

                        try {
                          await submitCommunityReport({
                            targetType: "comment",
                            targetId: c.id,
                            reason,
                          });
                          window.alert(
                            "신고가 접수되었습니다. 운영진 검토 후 필요한 조치를 진행합니다.",
                          );
                        } catch (error) {
                          setActionError(
                            error?.message || "신고 접수에 실패했습니다.",
                          );
                        }
                      }}
                    >
                      신고하기
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {editingId === c.id ? (
            <div className="comments-inlineEditor">
              <textarea
                value={editInput}
                onChange={e => setEditInput(e.target.value)}
              />
              <div>
                <button type="button" onClick={() => setEditingId(null)}>
                  취소
                </button>
                <button type="button" onClick={() => saveEdit(c.id)}>
                  저장
                </button>
              </div>
            </div>
          ) : (
            <p className="comments-commentText">{c.content}</p>
          )}
          <div className="comments-commentActions">
            <button
              type="button"
              onClick={() => like(c)}
              className={c.likedByCurrentUser ? "comments-liked" : ""}
            >
              {c.likedByCurrentUser ? (
                <FavoriteIcon fontSize="small" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}{" "}
              좋아요 {c.likes || 0}
            </button>
            {canReply && (
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    redirect();
                    return;
                  }
                  setReplyTo(replyTo === c.id ? null : c.id);
                  setReplyInput("");
                }}
              >
                답글
              </button>
            )}
          </div>
          {canReply && replyTo === c.id && (
            <form
              className="comments-replyForm"
              onSubmit={e => submit(e, c.id)}
            >
              <textarea
                value={replyInput}
                onChange={e => setReplyInput(e.target.value)}
                placeholder="답글을 입력해주세요."
              />
              <button
                type="submit"
                disabled={!replyInput.trim() || isSubmitting}
              >
                등록
              </button>
            </form>
          )}
          {depth < MAX_REPLY_DEPTH &&
            children(c.id).map(child => renderItem(child, depth + 1))}
        </div>
      </div>
    );
  };

  return (
    <section className="comments-container">
      <div className="comments-header">
        <h3 className="comments-title">
          댓글 <span className="comments-count">{totalCommentCount}</span>
        </h3>
      </div>
      <form onSubmit={e => submit(e)} className="comments-inputForm">
        <textarea
          value={commentInput}
          onChange={e => setCommentInput(e.target.value)}
          onFocus={e => {
            if (!currentUser) {
              e.currentTarget.blur();
              redirect();
            }
          }}
          placeholder="내용을 입력해주세요."
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
            disabled={isSubmitting || !commentInput.trim()}
          >
            {isSubmitting ? "등록 중..." : "등록"}
          </Button>
        </div>
      </form>
      <div className="comments-commentList">
        {roots.length === 0 ? (
          <p className="comments-emptyMessage">첫 번째 댓글을 남겨보세요!</p>
        ) : (
          roots.map(c => renderItem(c))
        )}
      </div>
    </section>
  );
}
