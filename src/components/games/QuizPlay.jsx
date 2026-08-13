"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@/components/ui/Button";
import { toChosung } from "@/lib/hangul";

const cardSx = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: "20px",
};

const hintChipSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  px: { xs: 2, lg: 4 },
  py: 1,
  bgcolor: "momentalk.hintChip",
  borderRadius: "9999px",
};

// 초성은 글자 사이가 넓어서 화면 폭에 맞춰 같이 줄여야 넘치지 않습니다.
const chosungSx = {
  fontSize: { xs: 56, sm: 88, lg: 120 },
  lineHeight: { xs: "90px", sm: "140px", lg: "180px" },
  fontWeight: 800,
  letterSpacing: { xs: "16px", sm: "32px", lg: "48px" },
  textShadow: "0 10px 25px rgba(108, 99, 255, 0.15)",
  wordBreak: "keep-all",
};

// 힌트 보기 / 정답 공개 — 좁은 화면에서는 세로로 쌓습니다.
const actionRowSx = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 2, sm: 3 },
  justifyContent: "center",
  width: "100%",
  maxWidth: 448,
  "& > *": { flex: "1 0 0", minWidth: 0 },
};

export default function QuizPlay({ quiz, onReveal }) {
  const [shownCount, setShownCount] = useState(0);

  const chosung = toChosung(quiz.answer).join(" ");
  const hints = quiz.hints ?? [];
  const shownHints = hints.slice(0, shownCount);
  const hasMoreHints = shownCount < hints.length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: { xs: 0, lg: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          width: "100%",
          p: { xs: 0, lg: 4 },
        }}
      >
        {shownHints.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
            {shownHints.map((hint, index) => (
              <Box key={index} sx={hintChipSx}>
                <Box component="img" src="/quiz-chip.svg" alt="" sx={{ width: 17, height: 15 }} />
                <Typography variant="body1" color="primary.main" sx={{ lineHeight: "24px" }}>
                  {hint}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Box
          sx={{
            ...cardSx,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 896,
            px: "1px",
            py: { xs: "28px", lg: "49px" },
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
          }}
        >
          <Typography align="center" color="primary.main" sx={chosungSx}>
            {chosung}
          </Typography>
        </Box>

        <Box sx={actionRowSx}>
          <Button
            variant="secondary"
            size="game"
            onClick={() => setShownCount(prev => prev + 1)}
            disabled={!hasMoreHints}
            leadingIcon={
              <Box component="img" src="/quiz-hint.svg" alt="" sx={{ width: 15, height: 20 }} />
            }
          >
            힌트 보기
          </Button>

          <Button
            size="game"
            onClick={onReveal}
            leadingIcon={
              <Box component="img" src="/quiz-reveal.svg" alt="" sx={{ width: 22, height: 15 }} />
            }
          >
            정답 공개
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
