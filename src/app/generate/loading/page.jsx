//로딩 진행 중 화면 + 생성 실패 화면 같은 라우트, 상태로 전환
// 로딩 실패 시 result/page.jsx로 넘어가지 않고 실패 시 화면
"use client";

//import 요소 정리
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState } from "react";

import Box from "@mui/material/Box";
import { useTheme } from "@emotion/react";
import { Typography } from "@mui/material";

// 진행률 구간별 안내 문구
const PROGRESS_STEPS = [
  { until: 30, label: "상황 정보 분석 중..." },
  { until: 65, label: "스크립트 구성 요소 생성 중..." },
  { until: 90, label: "대화 톤 다듬는 중..." },
  { until: 100, label: "마무리 검수 중..." },
];

export default function GenerateLoadingPage() {
  const [status, setStatus] = useState("loading");
  const [progress, setProgress] = useState(0);
  const theme = useTheme();

  const currentStepLabel =
    PROGRESS_STEPS.find(step => progress <= step.until)?.label ?? PROGRESS_STEPS[PROGRESS_STEPS.length - 1].label;

  return (
    <>
      <Header />
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 10, px: 2 }}>
        <Box sx={{ maxWidth: 900, mx: "auto", textAlign: "center" }}>
          {status === "loading" ? (
            <LoadingView progress={progress} stepLabel={currentStepLabel} theme={theme} />
          ) : (
            <ErrorView theme={theme} onRetry={runGeneration} onBack={() => router.push("/generate")} />
          )}
        </Box>
      </Box>
      <Footer />
    </>
  );
}

//로딩 진행 화면
function LoadingView() {
  return (
    <>
      <Box
        sx={{
          display: "inline-block",
          bgcolor: "primary.main",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.9rem",
          borderRadius: 5,
          px: 2.5,
          py: 1,
          mb: 3,
        }}
      >
        AI 분석 진행중입니다.
      </Box>
      <Typography>AI가 최적의 대화 가이드를 분석하고 있습니다.</Typography>
      <Typography>
        상황을 분석하여 당신만을 위한 맞춤형 스크립트를 생성 중입니다. 잠시만 기다려 주세요.
        <br />
        대화의 성공 확률을 높이기 위해 수천 개의 패턴을 대조하고 있습니다.
      </Typography>
      <Typography>- progress bar 자리 -</Typography>
      <Box>
        <InfoCard>심리 엔진 분석</InfoCard>
        <InfoCard>맞춤형 스크립트</InfoCard>
      </Box>
    </>
  );
}

//로딩 실패 시 화면
function ErrorView() {
  return <></>;
}

//정보 안내 카드
function InfoCard() {
  return <></>;
}
