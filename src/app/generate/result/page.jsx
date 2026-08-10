// 저장 위치: src/app/generate/result/page.jsx
// loading/page.jsx 에서 생성 성공 시 넘어오게 됨.
// - 로그인 사용자: /generate/result?id=xxx  (DB에서 다시 조회, 새로고침해도 안전)
// - 비로그인 사용자: /generate/result       (sessionStorage("generate-result")에서 읽음, 1회성)

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme, alpha } from "@mui/material/styles";

import { getGenerationById, saveGenerationItem } from "@/lib/generateQueries";

/** 실제 응답엔 카드별 아이콘 정보가 없어서, 디자인대로 전 카드 동일 아이콘을 씁니다. */
const TOPIC_ICON = "/assets/icons/refresh_icon.svg";

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const id = searchParams.get("id");

  const [state, setState] = useState("loading"); // 'loading' | 'ready' | 'notfound'
  const [data, setData] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // 'idle' | 'saving' | 'saved' | 'error'

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

  const handleRegenerate = () => {
    router.push("/generate");
  };

  // 결과 카드 전체(최대 3개)를 순회하며 저장. results[].id 가 없으면
  // (비로그인 생성) 저장할 수 없으므로 로그인 페이지로 보낸다.
  const handleSaveAll = async () => {
    const items = data?.results ?? [];
    const savable = items.filter(item => item.id);

    if (savable.length === 0) {
      router.push("/sign-in");
      return;
    }

    setSaveState("saving");
    try {
      await Promise.all(savable.map(item => saveGenerationItem(item.id)));
      setSaveState("saved");
    } catch (e) {
      setSaveState("error");
      if (String(e.message).includes("로그인")) {
        router.push("/sign-in");
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
          결과를 찾을 수 없습니다
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
  const isLoggedIn = results.some(r => r.id);
  const topics = results.slice(0, 2);
  const highlight = results[2] ?? null;

  const title = meta ? `${meta.situation} - ${meta.format} 가이드 (Level ${meta.level})` : "대화 가이드";

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      {/* 상단 배지 */}
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          bgcolor: theme.palette.momentalk.presetCard,
          color: "primary.main",
          fontWeight: 700,
          fontSize: "0.8rem",
          borderRadius: 5,
          px: 1.75,
          py: 0.6,
          mb: 1.5,
        }}
      >
        <Box component="img" src="/assets/icons/twinkle_icon.svg" alt="" sx={{ width: 16, height: 16 }} />
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
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
          {topics.map((item, i) => (
            <TopicCard key={item.id ?? i} index={i} item={item} theme={theme} />
          ))}
        </Box>
      )}

      {/* Topic 3 (강조 카드) — 폴백 등으로 결과가 2개 이하면 표시하지 않음 */}
      {highlight && <HighlightTopicCard item={highlight} theme={theme} />}

      {/* 하단 CTA */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          bgcolor: theme.palette.momentalk.typeCard,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2.5,
        }}
      >
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
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="tertiary"
            size="md"
            onClick={handleRegenerate}
            leadingIcon={
              <Box component="img" src="/assets/icons/result_re_icon.svg" alt="" sx={{ width: 16, height: 16 }} />
            }
            sx={{ height: 48, fontSize: "0.9rem" }}
          >
            다른 주제 생성하기
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveAll}
            disabled={saveState === "saving" || saveState === "saved"}
            leadingIcon={
              saveState === "saved" ? (
                <Box component="img" src="/assets/icons/bookmark.svg" alt="" sx={{ width: 16, height: 16 }} />
              ) : (
                <Box component="img" src="/assets/icons/bookmark.svg" alt="" sx={{ width: 16, height: 16 }} />
              )
            }
            sx={{ height: 48, fontSize: "0.9rem" }}
          >
            {saveState === "saved" ? "저장 완료" : saveState === "saving" ? "저장 중..." : "가이드 저장하기"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

function ScriptsAndTips({ item, theme, tipsColumns = false }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const tips = item.tips ?? [];
  const answer = item.extras?.answer;

  return (
    <>
      <Box sx={{ bgcolor: theme.palette.momentalk.typeCard, borderRadius: 2.5, p: 2.5, mb: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            color: "primary.main",
            fontWeight: 700,
            fontSize: "0.85rem",
            mb: 1,
          }}
        >
          <Box component="img" src="/assets/icons/desc_icon.svg" alt="" sx={{ width: 16, height: 16 }} />
          실제 추천 대화문
        </Box>
        {(item.scripts ?? []).map((script, i) => (
          <Typography key={i} variant="body2" color="text.primary" sx={{ lineHeight: "24px" }}>
            &ldquo;{script}&rdquo;
          </Typography>
        ))}

        {/* 퀴즈 형식(extras.answer)일 때만 정답 표시 */}
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

      {/* tips는 형식에 따라 빈 배열([])로 올 수 있음(예: 벌칙) — 그때는 섹션 자체를 숨김 */}
      {tips.length > 0 && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              color: "text.secondary",
              fontWeight: 600,
              fontSize: "0.85rem",
              mb: 1.5,
            }}
          >
            <Box component="img" src="/assets/icons/tip_icon.svg" alt="" sx={{ width: 16, height: 16 }} />
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
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "warning.main",
                    mt: 1,
                    flexShrink: 0,
                  }}
                />
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
  const Icon = TOPIC_ICON;

  return (
    <Paper
      elevation={0}
      sx={{
        flex: "1 1 400px",
        p: 3.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: theme.palette.momentalk.presetCard,
            color: "primary.main",
            borderRadius: 2,
            width: 40,
            height: 40,
          }}
        >
          <Box component="img" src="/assets/icons/chat_icon.svg" alt="" sx={{ width: 16, height: 16 }} />
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
  const Icon = TOPIC_ICON;
  const tips = item.tips ?? [];

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* 좌측 강조 패널 */}
      <Box
        sx={{
          flex: "1 1 300px",
          bgcolor: "primary.main",
          color: "#fff",
          p: { xs: 3, sm: 4 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Avatar
          variant="rounded"
          sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 2, width: 44, height: 44, mb: 2 }}
        >
          <Box component="img" src="/assets/icons/topic3_icon.svg" alt="" sx={{ width: 16, height: 16 }} />
        </Avatar>
        <Typography variant="overline" fontWeight={700} sx={{ opacity: 0.85, letterSpacing: 0.5 }}>
          TOPIC 3
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5 }}>
          {item.title}
        </Typography>
      </Box>

      {/* 우측 콘텐츠 */}
      <Box sx={{ flex: "2 1 500px", p: { xs: 3, sm: 4 }, display: "flex", gap: 4, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 260px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              color: "primary.main",
              fontWeight: 700,
              fontSize: "0.85rem",
              mb: 1.5,
            }}
          >
            <Box component="img" src="/assets/icons/desc_icon.svg" alt="" sx={{ width: 16, height: 16 }} />
            실제 추천 대화문
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {(item.scripts ?? []).map((script, i) => (
              <Box key={i} sx={{ bgcolor: theme.palette.momentalk.typeCard, borderRadius: 2, p: 2 }}>
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
          <Box sx={{ flex: "1 1 260px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                color: "primary.main",
                fontWeight: 700,
                fontSize: "0.85rem",
                mb: 1.5,
              }}
            >
              <Box component="img" src="/assets/icons/tip_icon.svg" alt="" sx={{ width: 16, height: 16 }} />
              상황별 팁
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {tips.map((tip, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1.25 }}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.momentalk.presetCard,
                      color: "primary.main",
                      width: 22,
                      height: 22,
                      fontSize: "0.75rem",
                      fontWeight: 700,
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
