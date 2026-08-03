"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import Button from "@/components/ui/Button";

export default function CardJokerResult({ onConfirm }) {
  return (
    <Dialog
      open
      onClose={onConfirm}
      aria-label="조커 당첨"
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(0, 0, 0, 0.7)" } },
        paper: {
          sx: {
            width: 448,
            maxWidth: "100%",
            m: 3,
            p: 3,
            borderRadius: "32px",
            boxShadow: "0 4px 20px rgba(31, 41, 55, 0.12)",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, py: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            bgcolor: "rgba(255, 90, 95, 0.1)",
            borderRadius: "9999px",
          }}
        >
          <Box component="img" src="/card-joker-big.svg" alt="" sx={{ width: 60, height: 60 }} />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, textAlign: "center" }}>
          <Typography
            sx={{ fontSize: 28, lineHeight: "36.4px", fontWeight: 700, color: "error.main" }}
          >
            조커! 벌칙 당첨
          </Typography>
          <Typography sx={{ fontSize: 16, lineHeight: "24px", color: "text.secondary" }}>
            아쉽지만 벌칙을 수행해 주세요
          </Typography>
        </Box>

        <Button onClick={onConfirm} sx={{ width: 240 }}>
          확인
        </Button>
      </Box>
    </Dialog>
  );
}
