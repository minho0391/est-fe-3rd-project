/* 
  커뮤니티 운영진 신고 관리 페이지
  - 관리자 권한 확인 및 신고 목록 조회
  - 신고 상태별 필터링 및 건수 집계
  - 신고 내용 검토 및 조치 이력 기록
  - 신고 대상 게시글/댓글 실제 삭제
 */
"use client";

import "@/community/common.css";
import "@/community/post.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCommunityReportsForAdmin,
  getCurrentCommunityUser,
} from "@/lib/communityQueries";
import {
  deleteReportedCommunityContent,
  reviewCommunityReport,
} from "@/lib/communityMutations";

/* ---------- 신고 상태 및 조치 옵션 ---------- */
const STATUS_OPTIONS = [
  ["all", "전체"],
  ["pending", "접수"],
  ["reviewing", "검토 중"],
  ["resolved", "처리 완료"],
  ["dismissed", "기각"],
];

const STATUS_LABELS = {
  pending: "접수",
  reviewing: "검토 중",
  resolved: "처리 완료",
  dismissed: "기각",
};

const ACTION_LABELS = {
  none: "조치 없음",
  warning: "경고 기록",
  content_deleted: "콘텐츠 삭제",
};

// 실제 삭제 없이 "콘텐츠 삭제" 이력만 남는 상황을 막기 위해
// 일반 검토 select에서는 삭제 조치를 선택하지 않습니다.
const REVIEW_ACTION_OPTIONS = [
  ["none", "조치 없음"],
  ["warning", "경고 기록"],
];

/* ---------- 신고 일시 표시 ---------- */
const formatDateTime = value => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function CommunityReportsAdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  /* ---------- 관리자 권한 확인 및 신고 목록 조회 ---------- */
  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const me = await getCurrentCommunityUser();
      setCurrentUser(me);

      if (!me) {
        router.replace(
          `/sign-in?returnUrl=${encodeURIComponent("/post/admin/reports")}`,
        );
        return;
      }

      if (me.role !== "관리자") {
        setReports([]);
        setLoadError("관리자만 접근할 수 있습니다.");

        // URL 직접 접근을 포함해 권한이 없는 사용자는 안내 후 마이페이지로 돌려보냅니다.
        window.alert("관리자만 접근할 수 있습니다.");
        router.replace("/post/mypage");
        return;
      }

      const rows = await getCommunityReportsForAdmin();
      setReports(rows);
      setDrafts(
        Object.fromEntries(
          rows.map(report => [
            String(report.id),
            {
              action:
                report.moderationAction === "warning" ? "warning" : "none",
              note: report.reviewNote ?? "",
            },
          ]),
        ),
      );
    } catch (error) {
      console.error("신고 목록 조회 실패", error);
      setLoadError(
        error?.message ||
          "신고 목록을 불러오지 못했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  /* ---------- 신고 상태별 필터 및 건수 집계 ---------- */
  const filteredReports = useMemo(
    () =>
      statusFilter === "all"
        ? reports
        : reports.filter(report => report.status === statusFilter),
    [reports, statusFilter],
  );

  const counts = useMemo(
    () =>
      reports.reduce(
        (acc, report) => {
          acc.all += 1;
          acc[report.status] = (acc[report.status] ?? 0) + 1;
          return acc;
        },
        {
          all: 0,
          pending: 0,
          reviewing: 0,
          resolved: 0,
          dismissed: 0,
        },
      ),
    [reports],
  );

  /* ---------- 신고별 검토 입력값 관리 ---------- */
  const updateDraft = (reportId, patch) => {
    const key = String(reportId);
    setDrafts(previous => ({
      ...previous,
      [key]: {
        action: "none",
        note: "",
        ...(previous[key] ?? {}),
        ...patch,
      },
    }));
  };

  /* ---------- 신고 검토 상태 및 조치 기록 ---------- */
  const handleReview = async (report, nextStatus) => {
    if (savingId) return;

    const draft = drafts[String(report.id)] ?? {
      action: report.moderationAction ?? "none",
      note: report.reviewNote ?? "",
    };

    try {
      setSavingId(report.id);
      await reviewCommunityReport({
        reportId: report.id,
        status: nextStatus,
        action: draft.action,
        note: draft.note,
      });
      await loadReports();
    } catch (error) {
      console.error("신고 검토 저장 실패", error);
      window.alert(error?.message || "신고 검토 결과를 저장하지 못했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  /* ---------- 신고 대상 콘텐츠 실제 삭제 ---------- */
  const handleDeleteReportedContent = async report => {
    if (savingId || !report.targetExists) return;

    const targetName = report.targetType === "post" ? "게시글" : "댓글";
    const confirmed = window.confirm(
      `신고 내용을 검토한 결과 이 ${targetName}을 실제로 삭제하시겠습니까?\n` +
        "삭제 후에는 원문을 복구할 수 없습니다.",
    );
    if (!confirmed) return;

    const draft = drafts[String(report.id)] ?? {
      note: report.reviewNote ?? "",
    };

    try {
      setSavingId(report.id);
      await deleteReportedCommunityContent({
        reportId: report.id,
        note: draft.note,
      });
      window.alert(
        `${targetName}이 삭제되었고 신고가 처리 완료 상태로 변경되었습니다.`,
      );
      await loadReports();
    } catch (error) {
      console.error("신고 대상 삭제 실패", error);
      window.alert(error?.message || "신고 대상 삭제에 실패했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  /* ---------- 신고 관리 화면 ---------- */
  return (
    <main className="community-scope community-page reports-adminPage">
      <div className="reports-adminContainer">
        <div className="reports-adminTopRow">
          <Link href="/post/mypage" className="detail-page-backBtn">
            ← 마이페이지로
          </Link>
          <button
            type="button"
            className="reports-refreshButton"
            onClick={loadReports}
            disabled={isLoading}
          >
            {isLoading ? "새로고침 중..." : "새로고침"}
          </button>
        </div>

        <header className="reports-adminHeader">
          <div>
            <p className="reports-adminEyebrow">COMMUNITY MODERATION</p>
            <h1 className="reports-adminTitle">신고 관리</h1>
            <p className="reports-adminDescription">
              신고 접수 내용을 확인하고 검토 상태와 조치 이력을 기록합니다.
              실시간 감시나 자동 제재는 수행하지 않습니다.
            </p>
          </div>
          {currentUser?.role === "관리자" && (
            <span className="reports-adminBadge">운영진</span>
          )}
        </header>

        {loadError ? (
          <section className="reports-adminState reports-adminStateError">
            <strong>신고 관리 페이지를 열 수 없습니다.</strong>
            <span>{loadError}</span>
          </section>
        ) : (
          <>
            <nav className="reports-filterTabs" aria-label="신고 상태 필터">
              {STATUS_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`reports-filterButton ${
                    statusFilter === value ? "reports-filterButtonActive" : ""
                  }`}
                  onClick={() => setStatusFilter(value)}
                >
                  {label}
                  <span>{counts[value]}</span>
                </button>
              ))}
            </nav>

            {isLoading ? (
              <section className="reports-adminState">
                신고 목록을 불러오는 중입니다.
              </section>
            ) : filteredReports.length === 0 ? (
              <section className="reports-adminState">
                해당 상태의 신고가 없습니다.
              </section>
            ) : (
              <div className="reports-list">
                {filteredReports.map(report => {
                  const draft = drafts[String(report.id)] ?? {
                    action:
                      report.moderationAction === "warning"
                        ? "warning"
                        : "none",
                    note: report.reviewNote ?? "",
                  };
                  const targetHref =
                    report.targetExists && report.targetPostId
                      ? `/post/${report.targetPostId}`
                      : null;
                  const isSaving = savingId === report.id;

                  return (
                    <article key={report.id} className="reports-card">
                      <div className="reports-cardHeader">
                        <div className="reports-cardMeta">
                          <span
                            className={`reports-status reports-status-${report.status}`}
                          >
                            {STATUS_LABELS[report.status] ?? report.status}
                          </span>
                          <span>
                            {report.targetType === "post" ? "게시글" : "댓글"}
                          </span>
                          <span>신고 #{report.id}</span>
                        </div>
                        <time>{formatDateTime(report.createdAt)}</time>
                      </div>

                      <div className="reports-targetRow">
                        <div>
                          <span className="reports-fieldLabel">신고 대상</span>
                          <strong className="reports-targetTitle">
                            {report.targetLabel}
                          </strong>
                        </div>
                        {targetHref && (
                          <Link
                            href={targetHref}
                            className="reports-targetLink"
                            target="_blank"
                          >
                            원문 보기
                          </Link>
                        )}
                      </div>

                      <dl className="reports-infoGrid">
                        <div>
                          <dt>신고자</dt>
                          <dd>{report.reporterName}</dd>
                        </div>
                        <div>
                          <dt>대상 ID</dt>
                          <dd>{String(report.targetId)}</dd>
                        </div>
                        <div className="reports-infoReason">
                          <dt>신고 사유</dt>
                          <dd>{report.reason}</dd>
                        </div>
                      </dl>

                      <div className="reports-reviewForm">
                        <label>
                          <span>조치 기록</span>
                          <select
                            value={draft.action}
                            onChange={event =>
                              updateDraft(report.id, {
                                action: event.target.value,
                              })
                            }
                          >
                            {REVIEW_ACTION_OPTIONS.map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="reports-noteField">
                          <span>검토 메모</span>
                          <textarea
                            value={draft.note}
                            rows={3}
                            maxLength={500}
                            placeholder="검토 내용이나 조치 근거를 기록해 주세요."
                            onChange={event =>
                              updateDraft(report.id, {
                                note: event.target.value,
                              })
                            }
                          />
                        </label>
                      </div>

                      <div className="reports-cardFooter">
                        <div className="reports-currentAction">
                          <span>현재 조치</span>
                          <strong>
                            {ACTION_LABELS[report.moderationAction] ??
                              report.moderationAction}
                          </strong>
                          {report.reviewedAt && (
                            <small>
                              검토 완료 {formatDateTime(report.reviewedAt)}
                            </small>
                          )}
                        </div>

                        <div className="reports-actionButtons">
                          <button
                            type="button"
                            className="reports-secondaryButton"
                            disabled={isSaving}
                            onClick={() => handleReview(report, "reviewing")}
                          >
                            검토 중
                          </button>
                          <button
                            type="button"
                            className="reports-dismissButton"
                            disabled={isSaving}
                            onClick={() => handleReview(report, "dismissed")}
                          >
                            기각
                          </button>
                          <button
                            type="button"
                            className="reports-deleteButton"
                            disabled={
                              isSaving ||
                              !report.targetExists ||
                              report.moderationAction === "content_deleted"
                            }
                            onClick={() => handleDeleteReportedContent(report)}
                          >
                            {!report.targetExists ||
                            report.moderationAction === "content_deleted"
                              ? "삭제 완료"
                              : "콘텐츠 삭제"}
                          </button>
                          <button
                            type="button"
                            className="reports-primaryButton"
                            disabled={isSaving}
                            onClick={() => handleReview(report, "resolved")}
                          >
                            {isSaving ? "저장 중..." : "처리 완료"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
