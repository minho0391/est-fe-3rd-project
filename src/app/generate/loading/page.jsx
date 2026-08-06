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
import { mockGenerateGuide } from "@/lib/mockGenerateGuide";
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
      setProgress(prev => (prev >= 96 ? prev : prev + Math.random() * 8));
    }, 500);

    mockGenerateGuide(searchParams)
      .then(() => {
        clearInterval(progressTimer);
        setProgress(100);
        setTimeout(() => {
          router.push(`/generate/result?${searchParams.toString()}`);
        }, 2000);
      })
      .catch(() => {
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
