"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Button from "@/components/ui/Button";
import { countHangul } from "@/lib/hangul";

const MAX_LENGTH = 3;

const fieldSx = {
  width: "100%",
  px: "25px",
  py: "17px",
  bgcolor: "background.default",
  border: 1,
  borderColor: "divider",
  borderRadius: "12px",
  fontSize: 16,
  "& input::placeholder": { color: "text.disabled", opacity: 1 },
};

function FieldLabel({ icon, iconWidth = 20, children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, height: 25 }}>
      <Box component="img" src={icon} alt="" sx={{ width: iconWidth, height: 20 }} />
      <Typography component="span" sx={{ fontSize: 18, lineHeight: "26px", fontWeight: 500 }}>
        {children}
      </Typography>
    </Box>
  );
}

export default function QuizSetup({ onSubmit }) {
  const [answer, setAnswer] = useState("");
  const [hint1, setHint1] = useState("");
  const [hint2, setHint2] = useState("");

  const canSubmit = countHangul(answer) > 0;

  const handleAnswerChange = e => {
    setAnswer([...e.target.value].slice(0, MAX_LENGTH).join(""));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      answer: answer.trim(),
      hints: [hint1.trim(), hint2.trim()].filter(Boolean),
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, p: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <Box component="img" src="/quiz-title.svg" alt="" sx={{ width: 64, height: 53 }} />

        <Typography
          component="h2"
          sx={{
            pt: 2,
            fontSize: 32,
            lineHeight: "39px",
            fontWeight: 700,
            letterSpacing: "-0.8px",
            textAlign: "center",
          }}
        >
          초성 퀴즈 - 출제
        </Typography>

        <Typography
          sx={{ fontSize: 16, lineHeight: "24px", color: "text.secondary", textAlign: "center" }}
        >
          맞힐 단어와 힌트를 입력해 주세요.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          width: "100%",
          p: "49px",
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: "20px",
          boxShadow: "0 1px 1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
          <FieldLabel icon="/quiz-answer.svg">정답 단어</FieldLabel>
          <InputBase
            value={answer}
            onChange={handleAnswerChange}
            placeholder={`맞힐 단어를 입력하세요 (최대 ${MAX_LENGTH}글자)`}
            inputProps={{ "aria-label": "정답 단어" }}
            sx={fieldSx}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 3, width: "100%" }}>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 1, flex: "1 0 0", minWidth: 0 }}
          >
            <FieldLabel icon="/quiz-hint.svg" iconWidth={15}>
              힌트 1
            </FieldLabel>
            <InputBase
              value={hint1}
              onChange={e => setHint1(e.target.value)}
              placeholder="예: 동물"
              inputProps={{ "aria-label": "힌트 1" }}
              sx={fieldSx}
            />
          </Box>

          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 1, flex: "1 0 0", minWidth: 0 }}
          >
            <FieldLabel icon="/quiz-hint.svg" iconWidth={15}>
              힌트 2
            </FieldLabel>
            <InputBase
              value={hint2}
              onChange={e => setHint2(e.target.value)}
              placeholder="예: 야옹"
              inputProps={{ "aria-label": "힌트 2" }}
              sx={fieldSx}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            trailingIcon={
              <Box component="img" src="/arrow.svg" alt="" sx={{ width: 16, height: 16 }} />
            }
            sx={{ width: 510, fontSize: 20, lineHeight: "27px", fontWeight: 600 }}
          >
            문제 내기
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
