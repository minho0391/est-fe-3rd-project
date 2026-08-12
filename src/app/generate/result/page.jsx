// 저장 위치: src/app/generate/result/page.jsx
// loading/page.jsx 에서 생성 성공 시 넘어오게 됨.
// - 로그인 사용자: /generate/result?id=xxx  (DB에서 다시 조회, 새로고침해도 안전)
// - 비로그인 사용자: /generate/result       (sessionStorage("generate-result")에서 읽음, 1회성)

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";
import { useTheme, alpha } from "@mui/material/styles";

import { createClient } from "@/utils/supabase/client";
import { getGenerationById, saveGenerationItem } from "@/lib/generateQueries";
import { styles } from "./_components/styles";

function ResultContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const id = searchParams.get("id");

  const [state, setState] = useState("loading"); // 'loading' | 'ready' | 'notfound'
  const [data, setData] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // 'idle' | 'saving' | 'saved' | 'error'
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // 로그인 여부는 auth 상태로 직접 판별
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState("loading");

      if (id) {
        const generation = await getGenerationById(id);
        if (cancelled) return;
        if (!generation) {
          setState("notfound");
          return;
        }
        setData(generation);
        setState("ready");
        return;
      }

      const raw = sessionStorage.getItem("generate-result");
      if (!raw) {
        setState("notfound");
        return;
      }
      setData(JSON.parse(raw));
      setState("ready");
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const goToSignIn = () => {
    const query = searchParams.toString();
    const redirectTarget = query ? `${pathname}?${query}` : pathname;
    router.push(`/sign-in?redirect=${encodeURIComponent(redirectTarget)}`);
  };

  const handleRegenerate = () => {
    router.push("/generate");
  };

  const handleSaveAll = async () => {
    if (!user) {
      goToSignIn();
      return;
    }

    if (saveState === "saving" || saveState === "saved") return;

    const items = data?.results ?? [];
    if (items.length === 0) return;

    setSaveState("saving");
    try {
      await Promise.all(items.map(item => saveGenerationItem(item.id)));
      setSaveState("saved");
      setIsSaveModalOpen(true);
    } catch (e) {
      setSaveState("error");
      if (String(e.message).includes("로그인")) {
        goToSignIn();
      } else {
        alert("저장에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  if (state === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (state === "notfound" || !data || (data.results ?? []).length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 12 }}>
        <Typography variant="h4" mb={2}>
          결과를 찾을 수 없습니다.
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          링크가 만료되었거나 접근 권한이 없는 결과입니다.
        </Typography>
        <Button variant="primary" size="md" onClick={() => router.push("/generate")}>
          새로 생성하러 가기
        </Button>
      </Box>
    );
  }

  const { meta, results } = data;
  const isLoggedIn = !!user;
  const topics = results.slice(0, 2);
  const highlight = results[2] ?? null;

  // [수정 포인트] meta.situation이 없을 경우 meta.conditions?.situation 또는 기본값 탐색
  const situationText = meta?.situation || meta?.conditions?.situation || "맞춤 대화";

  const formatText = meta?.format || "맞춤";
  const levelText = meta?.level ? `Level ${meta.level}` : "";

  // 최종 타이틀 조립 (상황 - 형식 가이드 (Level N))
  const title = meta
    ? `${situationText} - ${formatText} 가이드 ${levelText ? `(${levelText})` : ""}`.trim()
    : "대화 가이드";

  return (
    <Box sx={styles.page}>
      {/* 상단 배지 */}
      <Box sx={{ ...styles.topBadge, bgcolor: theme.palette.momentalk.presetCard }}>
        <Box component="img" src="/assets/icons/twinkle_icon.svg" alt="" sx={styles.icon16} />
        AI 분석 결과
      </Box>

      <Typography variant="h2" color="text.primary" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
        AI가 당신의 상황에 맞춰 만든 대화 가이드예요.
      </Typography>

      {/* Topic 1 / Topic 2 */}
      {topics.length > 0 && (
        <Box sx={styles.topicRow}>
          {topics.map((item, i) => (
            <TopicCard key={item.id ?? i} index={i} item={item} theme={theme} />
          ))}
        </Box>
      )}

      {/* Topic 3 (강조 카드) */}
      {highlight && <HighlightTopicCard item={highlight} theme={theme} />}

      {/* 하단 CTA */}
      <Paper elevation={0} sx={{ ...styles.ctaPaper, bgcolor: theme.palette.momentalk.typeCard }}>
        <Box>
          <Typography variant="h5" color="text.primary" mb={0.5}>
            이 가이드가 마음에 드시나요?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isLoggedIn
              ? "가이드를 저장하고 실제 상황에서 바로 꺼내보세요."
              : "로그인하면 가이드를 저장하고 나중에 다시 볼 수 있어요."}
          </Typography>
        </Box>
        <Box sx={styles.ctaActions}>
          <Button
            variant="tertiary"
            size="md"
            onClick={handleRegenerate}
            leadingIcon={<Box component="img" src="/assets/icons/result_re_icon.svg" alt="" sx={styles.icon16} />}
            sx={styles.ctaButton}
          >
            다른 주제 생성하기
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveAll}
            disabled={saveState === "saving" || saveState === "saved"}
            leadingIcon={<Box component="img" src="/assets/icons/bookmark.svg" alt="" sx={styles.icon16} />}
            sx={styles.ctaButton}
          >
            {saveState === "saved" ? "저장 완료" : saveState === "saving" ? "저장 중..." : "가이드 저장하기"}
          </Button>
        </Box>
      </Paper>

      {/* 저장 완료 모달 */}
      <Modal open={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)}>
        <Box sx={styles.modalBox}>
          <Box
            sx={{
              ...styles.modalBanner,
              background: `radial-gradient(circle at 30% 25%, ${alpha(theme.palette.secondary.main, 0.9)}, ${theme.palette.primary.main})`,
            }}
          >
            <Box sx={styles.modalIconOuter}>
              <Avatar sx={{ bgcolor: "#fff", width: 64, height: 64 }}>
                <Box component="img" src="/assets/icons/account_icon.svg" alt="" sx={{ width: 48, height: 48 }} />
              </Avatar>
            </Box>
          </Box>
          <Box sx={styles.modalBody}>
            <Typography variant="h4" color="text.primary" mb={2}>
              대화 가이드 저장 완료!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, mt: 2.5, lineHeight: "24px" }}>
              생성된 대화 가이드를 내 보관함에 저장하거나 친구에게 공유할 수 있습니다. 저장된 내용은 마이페이지에서
              언제든지 다시 확인할 수 있어요.
            </Typography>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => router.push("/post/mypage")}
              leadingIcon={<Box component="img" src="/assets/icons/mypage_icon.svg" alt="" sx={styles.icon16} />}
              sx={styles.modalPrimaryBtn}
            >
              마이페이지로 이동하기
            </Button>
            <Button
              variant="tertiary"
              size="md"
              fullWidth
              onClick={() => router.push("/post")}
              leadingIcon={<Box component="img" src="/assets/icons/community_icon.svg" alt="" sx={styles.icon16} />}
              sx={styles.modalSecondaryBtn}
            >
              커뮤니티에 공유하기
            </Button>
            <Typography
              variant="body2"
              color="text.secondary"
              onClick={() => setIsSaveModalOpen(false)}
              sx={styles.modalDismiss}
            >
              현재 페이지 유지
            </Typography>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

function ScriptsAndTips({ item, theme, tipsColumns = false }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const tips = item.tips ?? [];
  const answer = item.extras?.answer;

  return (
    <>
      <Box sx={{ ...styles.scriptBox, bgcolor: theme.palette.momentalk.typeCard }}>
        <Box sx={styles.scriptLabel}>
          <Box component="img" src="/assets/icons/desc_icon.svg" alt="" sx={styles.icon16} />
          실제 추천 대화문
        </Box>
        {(item.scripts ?? []).map((script, i) => (
          <Typography key={i} variant="body2" color="text.primary" sx={{ lineHeight: "24px" }}>
            &ldquo;{script}&rdquo;
          </Typography>
        ))}

        {answer && (
          <Box sx={{ mt: 1.5 }}>
            {showAnswer ? (
              <Typography variant="body2" fontWeight={700} color="primary.main">
                정답: {answer}
              </Typography>
            ) : (
              <Button variant="text" size="small" onClick={() => setShowAnswer(true)} sx={{ px: 0 }}>
                정답 보기
              </Button>
            )}
          </Box>
        )}
      </Box>

      {tips.length > 0 && (
        <>
          <Box sx={styles.tipLabel}>
            <Box component="img" src="/assets/icons/tip_icon.svg" alt="" sx={styles.icon16} />
            상황별 팁
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: tipsColumns ? 2.5 : 1,
              flexWrap: "wrap",
              flexDirection: tipsColumns ? "row" : "column",
            }}
          >
            {tips.map((tip, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1, flex: tipsColumns ? "1 1 160px" : "initial" }}>
                <Box sx={styles.tipDot} />
                <Typography variant="body2" color="text.secondary">
                  {tip}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </>
  );
}

function TopicCard({ index, item, theme }) {
  return (
    <Paper elevation={0} sx={styles.topicCard}>
      <Box sx={styles.topicCardHeader}>
        <Avatar
          variant="rounded"
          sx={{
            ...styles.topicAvatar,
            bgcolor: theme.palette.momentalk.presetCard,
            color: "primary.main",
          }}
        >
          <Box component="img" src="/assets/icons/chat_icon.svg" alt="" sx={styles.icon16} />
        </Avatar>
        <Box>
          <Typography
            variant="overline"
            fontWeight={700}
            color="primary.main"
            sx={{ display: "block", letterSpacing: 0.5 }}
          >
            {`TOPIC ${index + 1}`}
          </Typography>
          <Typography variant="h5" color="text.primary">
            {item.title}
          </Typography>
        </Box>
      </Box>

      <ScriptsAndTips item={item} theme={theme} tipsColumns />
    </Paper>
  );
}

function HighlightTopicCard({ item, theme }) {
  const tips = item.tips ?? [];

  return (
    <Paper elevation={0} sx={styles.highlightCard}>
      <Box sx={{ ...styles.highlightLeft, bgcolor: "primary.main" }}>
        <Avatar variant="rounded" sx={styles.highlightAvatar}>
          <Box component="img" src="/assets/icons/topic3_icon.svg" alt="" sx={styles.icon16} />
        </Avatar>
        <Typography variant="overline" fontWeight={700} sx={{ opacity: 0.85, letterSpacing: 0.5 }}>
          TOPIC 3
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5 }}>
          {item.title}
        </Typography>
      </Box>

      <Box sx={styles.highlightRight}>
        <Box sx={styles.highlightColumn}>
          <Box sx={styles.highlightSectionLabel}>
            <Box component="img" src="/assets/icons/desc_icon.svg" alt="" sx={styles.icon16} />
            실제 추천 대화문
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {(item.scripts ?? []).map((script, i) => (
              <Box key={i} sx={{ ...styles.highlightScriptBox, bgcolor: theme.palette.momentalk.typeCard }}>
                <Typography variant="body2" color="text.primary" sx={{ lineHeight: "23px" }}>
                  &ldquo;{script}&rdquo;
                </Typography>
              </Box>
            ))}
            {item.extras?.answer && (
              <Typography variant="body2" fontWeight={700} color="primary.main">
                정답: {item.extras.answer}
              </Typography>
            )}
          </Box>
        </Box>

        {tips.length > 0 && (
          <Box sx={styles.highlightColumn}>
            <Box sx={styles.highlightSectionLabel}>
              <Box component="img" src="/assets/icons/tip_icon.svg" alt="" sx={styles.icon16} />
              상황별 팁
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {tips.map((tip, i) => (
                <Box key={i} sx={styles.highlightTipRow}>
                  <Avatar
                    sx={{
                      ...styles.highlightTipNumber,
                      bgcolor: theme.palette.momentalk.presetCard,
                      color: "primary.main",
                    }}
                  >
                    {i + 1}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: "22px" }}>
                    {tip}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default function GenerateResultPage() {
  return (
    <>
      <Header />
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 8, px: 2 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Suspense fallback={null}>
            <ResultContent />
          </Suspense>
        </Box>
      </Box>
      <Footer />
    </>
  );
}
