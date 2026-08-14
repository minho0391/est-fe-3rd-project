"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import Button from "@/components/ui/Button";
import { toContentLines } from "@/lib/contentFormats";
import { dialogBackdropSx, dialogPaperBaseSx, gameButtonSx, keepAllSx } from "./styles";

const paperSx = {
  ...dialogPaperBaseSx,
  p: 3,
  borderRadius: "32px",
  boxShadow: "0 4px 20px rgba(31, 41, 55, 0.12)",
};

const bodySx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 5,
  py: 3,
};

const iconCircleSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 120,
  height: 120,
  bgcolor: "rgba(255, 90, 95, 0.1)",
  borderRadius: "9999px",
};

const textGroupSx = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  textAlign: "center",
};

const penaltyBoxSx = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
  width: "100%",
  px: 3,
  py: 2.5,
  bgcolor: "momentalk.typeCard",
  borderRadius: "16px",
};

export default function CardJokerResult({ penalty = null, onConfirm }) {
  const lines = toContentLines(penalty);

  return (
    // aria-label 을 Dialog 에 직접 주면 role="presentation" 인 루트 div 에 붙어 웹 표준 위반입니다.
    // role="dialog" 가 붙는 paper 에 넘깁니다.
    <Dialog
      open
      onClose={onConfirm}
      transitionDuration={80}
      slotProps={{
        backdrop: { sx: dialogBackdropSx },
        paper: { sx: paperSx, "aria-label": "조커 당첨" },
      }}
    >
      <Box sx={bodySx}>
        <Box sx={iconCircleSx}>
          <Box component="img" src="/card-joker-big.svg" alt="" sx={{ width: 60, height: 60 }} />
        </Box>

        <Box sx={textGroupSx}>
          <Typography variant="h3" color="error.main" sx={{ lineHeight: "36.4px" }}>
            조커! 벌칙 당첨
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: "24px" }}>
            아쉽지만 벌칙을 수행해 주세요
          </Typography>
        </Box>

        {lines.length > 0 && (
          <Box sx={penaltyBoxSx}>
            {lines.map((line, index) => (
              <Typography key={index} component="p" variant="h5" align="center" sx={keepAllSx}>
                {line}
              </Typography>
            ))}

            {penalty?.tips?.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {penalty.tips.map((tip, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={keepAllSx}
                  >
                    {tip}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        )}

        <Button onClick={onConfirm} sx={gameButtonSx}>
          확인
        </Button>
      </Box>
    </Dialog>
  );
}
