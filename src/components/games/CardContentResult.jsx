"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import Button from "@/components/ui/Button";
import { dialogActionRowSx, dialogBackdropSx, keepAllSx, transparentPaperSx } from "./styles";

const badgeSx = {
  px: 2,
  py: 1,
  bgcolor: "background.paper",
  border: 1,
  borderColor: "primary.main",
  borderRadius: "999px",
};

const cardSx = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  height: 440,
  p: 3,
  bgcolor: "background.paper",
  borderRadius: "20px",
  boxShadow: "0 12px 32px 0 rgba(31, 41, 55, 0.12)",
  overflow: "hidden",
};

const cardGradientSx = {
  position: "absolute",
  inset: 0,
  opacity: 0.4,
  background: "linear-gradient(135deg, #ffffff 0%, #eff4ff 50%, #dee9fc 100%)",
};

const bodySx = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  width: "100%",
};

const scriptSx = { ...keepAllSx, width: 340, lineHeight: "39px" };

export default function CardContentResult({ content, onClose, onNext }) {
  return (
    <Dialog
      open
      onClose={onClose}
      aria-label="뽑힌 카드"
      transitionDuration={80}
      slotProps={{
        backdrop: { sx: dialogBackdropSx },
        paper: { sx: transparentPaperSx },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <Box sx={cardSx}>
          <Box aria-hidden="true" sx={cardGradientSx} />

          <Box sx={{ position: "relative", pb: 8, pt: 1 }}>
            <Typography component="span" variant="body2" color="primary.main" sx={badgeSx}>
              {content.title || "뽑힌 콘텐츠"}
            </Typography>
          </Box>

          <Box sx={bodySx}>
            <Typography variant="h3" align="center" sx={scriptSx}>
              {content.scripts?.[0]}
            </Typography>

            {content.tips?.length > 0 && (
              <Box sx={{ mt: 3, px: 2 }}>
                {content.tips.map((tip, index) => (
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
        </Box>

        <Box sx={dialogActionRowSx}>
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
          <Button
            onClick={onNext}
            trailingIcon={
              <Box component="img" src="/arrow.svg" alt="" sx={{ width: 16, height: 16 }} />
            }
          >
            다음 카드
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
