"use client";

import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

export default function GameCardBack({ onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: 220,
        height: 300,
        bgcolor: "primary.main",
        borderRadius: "12px",
        transition: "transform 0.15s ease",
        "&:hover": { transform: "translateY(-4px)" },
      }}
    >
      <Typography sx={{ color: "#fff", fontSize: 120, fontWeight: 700, lineHeight: 1 }}>
        M
      </Typography>
    </ButtonBase>
  );
}
