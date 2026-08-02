"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@/components/ui/Button";

export default function QuizAnswer({ quiz, onNext }) {
  const router = useRouter();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, p: 4 }}>
      <Box sx={{ pb: 4 }}>
        <Box component="img" src="/quiz-celebration.svg" alt="" sx={{ width: 180, height: 180 }} />
      </Box>

      <Box sx={{ pb: 2 }}>
        <Typography
          sx={{ fontSize: 18, lineHeight: "27px", fontWeight: 500, color: "text.disabled" }}
        >
          정답은
        </Typography>
      </Box>

      <Box sx={{ pb: 8 }}>
        <Typography
          sx={{
            fontSize: 80,
            lineHeight: "120px",
            fontWeight: 700,
            color: "success.main",
            letterSpacing: "16px",
            textAlign: "center",
            wordBreak: "keep-all",
          }}
        >
          {[...quiz.answer].join(" ")}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          width: 368,
          maxWidth: "100%",
          "& > *": { flex: "1 0 0", minWidth: 0 },
        }}
      >
        <Button variant="tertiary" onClick={() => router.push("/")}>
          종료
        </Button>

        <Button
          onClick={onNext}
          trailingIcon={
            <Box component="img" src="/arrow.svg" alt="" sx={{ width: 16, height: 16 }} />
          }
        >
          다음 문제
        </Button>
      </Box>
    </Box>
  );
}
