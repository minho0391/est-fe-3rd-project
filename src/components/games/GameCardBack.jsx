"use client";

import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { CARD_HEIGHT, CARD_WIDTH } from "./styles";

const cardBackSx = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  flexShrink: 0,
  bgcolor: "primary.main",
  borderRadius: "12px",
  transition: "transform 0.15s ease",
  "&:not(:disabled):hover": { transform: "translateY(-6px)" },
};

// 카드가 작아지면 로고도 같이 줄입니다.
const logoSx = {
  color: "#fff",
  fontSize: { xs: 72, lg: 120 },
  fontWeight: 700,
  lineHeight: 1,
};

export default function GameCardBack({ onClick, disabled }) {
  return (
    <ButtonBase onClick={onClick} disabled={disabled} sx={cardBackSx}>
      <Typography sx={logoSx}>M</Typography>
    </ButtonBase>
  );
}
