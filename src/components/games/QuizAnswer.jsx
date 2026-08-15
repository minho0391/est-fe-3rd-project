"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@/components/ui/Button";

// 정답도 글자 사이가 넓어서 화면 폭에 맞춰 같이 줄입니다.
const answerSx = {
  fontSize: { xs: 44, sm: 64, lg: 80 },
  lineHeight: { xs: "66px", sm: "96px", lg: "120px" },
  fontWeight: 700,
  letterSpacing: { xs: "8px", sm: "12px", lg: "16px" },
  wordBreak: "keep-all",
};

// 종료 / 다음 문제 — 좁은 화면에서는 세로로 쌓습니다.
const actionRowSx = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: 2,
  justifyContent: "center",
  width: { xs: "100%", sm: 368 },
  maxWidth: "100%",
  "& > *": { flex: "1 0 0", minWidth: 0 },
};

export default function QuizAnswer({ quiz, onNext }) {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        p: { xs: 0, lg: 4 },
      }}
    >
      <Box sx={{ pb: { xs: 2, lg: 4 } }}>
        <Box
          component="img"
          src="/quiz-celebration.svg"
          alt=""
          sx={{ width: { xs: 120, lg: 180 }, height: { xs: 120, lg: 180 } }}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        {/* subtitle1 은 MUI 기본 매핑이 h6 이라 안내 문구는 p 로 둡니다. */}
        <Typography
          component="p"
          variant="subtitle1"
          color="text.disabled"
          sx={{ lineHeight: "27px" }}
        >
          정답은
        </Typography>
      </Box>

      <Box sx={{ pb: { xs: 4, lg: 8 } }}>
        <Typography color="success.main" align="center" sx={answerSx}>
          {[...quiz.answer].join(" ")}
        </Typography>
      </Box>

      <Box sx={actionRowSx}>
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
