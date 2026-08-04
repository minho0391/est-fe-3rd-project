"use client";

import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

export default function GameCardBack({ onClick, disabled }) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: 220,
        height: 300,
        flexShrink: 0,
        bgcolor: "primary.main",
        borderRadius: "12px",
        transition: "transform 0.15s ease",
        "&:not(:disabled):hover": { transform: "translateY(-6px)" },
      }}
    >
      <Typography sx={{ color: "#fff", fontSize: 120, fontWeight: 700, lineHeight: 1 }}>
        M
      </Typography>
    </ButtonBase>
  );
}
