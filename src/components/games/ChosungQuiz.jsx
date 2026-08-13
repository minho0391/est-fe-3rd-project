"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import GameHeader from "@/components/layout/GameHeader";
import Footer from "@/components/layout/Footer";
import QuizSetup from "./QuizSetup";
import QuizPlay from "./QuizPlay";
import QuizAnswer from "./QuizAnswer";
import { gameContentSx, gamePageSx } from "./styles";

export default function ChosungQuiz() {
  const router = useRouter();
  const [step, setStep] = useState("setup"); // setup | play | answer
  const [quiz, setQuiz] = useState(null);

  const handleSubmit = data => {
    setQuiz(data);
    setStep("play");
  };

  const handleReveal = () => setStep("answer");

  const handleNext = () => {
    setQuiz(null);
    setStep("setup");
  };

  // 출제 화면에서는 이전 페이지로, 그 뒤 단계에서는 한 단계씩 되돌아감
  const handleBack = () => {
    if (step === "play") setStep("setup");
    else if (step === "answer") setStep("play");
    else router.back();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", flex: 1 }}>
      <GameHeader title="초성 퀴즈" onBack={handleBack} />

      <Box component="main" sx={{ ...gamePageSx, py: { xs: 4, lg: 6 } }}>
        <Box sx={gameContentSx}>
          {step === "setup" && <QuizSetup onSubmit={handleSubmit} />}
          {step === "play" && <QuizPlay quiz={quiz} onReveal={handleReveal} />}
          {step === "answer" && <QuizAnswer quiz={quiz} onNext={handleNext} />}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
