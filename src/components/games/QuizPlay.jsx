"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@/components/ui/Button";
import { toChosung } from "@/lib/hangul";

export default function QuizPlay({ quiz, onReveal }) {
  const [shownCount, setShownCount] = useState(0);

  const chosung = toChosung(quiz.answer).join(" ");
  const hints = quiz.hints ?? [];
  const shownHints = hints.slice(0, shownCount);
  const hasMoreHints = shownCount < hints.length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          width: "100%",
          p: 4,
        }}
      >
        {shownHints.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
            {shownHints.map((hint, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 4,
                  py: 1,
                  bgcolor: "#eef0ff",
                  borderRadius: "9999px",
                }}
              >
                <Box component="img" src="/quiz-chip.svg" alt="" sx={{ width: 17, height: 15 }} />
                <Typography sx={{ fontSize: 16, lineHeight: "24px", color: "primary.main" }}>
                  {hint}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 896,
            px: "1px",
            py: "49px",
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            borderRadius: "20px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography
            sx={{
              fontSize: 120,
              lineHeight: "180px",
              fontWeight: 800,
              color: "primary.main",
              letterSpacing: "48px",
              textShadow: "0 10px 25px rgba(108, 99, 255, 0.15)",
              textAlign: "center",
              wordBreak: "keep-all",
            }}
          >
            {chosung}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            justifyContent: "center",
            width: "100%",
            maxWidth: 448,
            "& > *": { flex: "1 0 0", minWidth: 0 },
          }}
        >
          <Button
            variant="secondary"
            onClick={() => setShownCount(prev => prev + 1)}
            disabled={!hasMoreHints}
            leadingIcon={
              <Box component="img" src="/quiz-hint.svg" alt="" sx={{ width: 15, height: 20 }} />
            }
            sx={{ fontSize: 16, lineHeight: "24px", fontWeight: 400 }}
          >
            힌트 보기
          </Button>

          <Button
            onClick={onReveal}
            leadingIcon={
              <Box component="img" src="/quiz-reveal.svg" alt="" sx={{ width: 22, height: 15 }} />
            }
            sx={{ fontSize: 16, lineHeight: "24px", fontWeight: 400 }}
          >
            정답 공개
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
