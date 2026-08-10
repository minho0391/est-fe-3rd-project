// 로딩 성공 사이트 주소 : http://localhost:3000/generate/loading
// 로딩 실패 테스트용 사이트 주소 : http://localhost:3000/generate/loading?forceError=true
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

import { styles } from "./_components/styles";
import { generateGuide } from "@/lib/generateApi";
import LoadingView from "./_components/LoadingView";
import ErrorView from "./_components/ErrorView";

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();

  const [status, setStatus] = useState("loading"); // 'loading' | 'error'
  const [progress, setProgress] = useState(0);

  const runGeneration = useCallback(() => {
    setStatus("loading");
    setProgress(0);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        // 실제 응답은 10~20초(최대 60초) 걸리므로 95%까지 천천히 채운다.
        if (prev >= 95) return prev;
        return prev + (Math.random() * 1.5 + 0.5);
      });
    }, 300);

    // ?forceError=true 로 접속하면 에러 화면 확인용으로 바로 실패 처리
    const raw = sessionStorage.getItem("generate-payload");
    const payload = raw ? JSON.parse(raw) : null;

    const run =
      searchParams.get("forceError") === "true" || !payload
        ? Promise.reject(new Error(payload ? "강제 에러 테스트" : "생성 조건이 없습니다. 다시 시도해주세요."))
        : generateGuide(payload);

    run
      .then(data => {
        clearInterval(progressTimer);
        setProgress(100);
        setTimeout(() => {
          // "다른 주제 생성하기"(재생성)가 같은 조건으로 다시 호출할 수 있도록 보관
          if (payload) sessionStorage.setItem("generate-last-payload", JSON.stringify(payload));

          if (data.generationId) {
            // 로그인 사용자: DB에 저장됨 → id로 결과 페이지 진입 (새로고침해도 안전)
            sessionStorage.removeItem("generate-payload");
            router.push(`/generate/result?id=${data.generationId}`);
          } else {
            // 비로그인 사용자: 저장 안 됨 → 세션에 결과를 그대로 담아 전달
            sessionStorage.setItem("generate-result", JSON.stringify(data));
            sessionStorage.removeItem("generate-payload");
            router.push("/generate/result");
          }
        }, 1000);
      })
      .catch(err => {
        console.error("generate 실패:", err);
        clearInterval(progressTimer);
        setStatus("error");
      });

    return () => clearInterval(progressTimer);
  }, [router, searchParams]);

  useEffect(() => {
    const cleanup = runGeneration();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <Box sx={styles.page}>
          <Box sx={styles.container}>
            {status === "loading" ? (
              <LoadingView progress={progress} theme={theme} />
            ) : (
              <ErrorView theme={theme} onRetry={runGeneration} onBack={() => router.push("/generate")} />
            )}
          </Box>
        </Box>
        <Footer />
      </Box>
    </>
  );
}

export default function GenerateLoadingPage() {
  return (
    <Suspense fallback={null}>
      <LoadingContent />
    </Suspense>
  );
}
