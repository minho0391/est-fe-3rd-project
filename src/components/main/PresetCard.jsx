"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const cardSx = {
  position: "relative",
  display: "block",
  flex: "1 0 0",
  minWidth: 0,
  p: "1px",
  bgcolor: "momentalk.presetCard",
  border: 1,
  borderColor: "divider",
  borderRadius: "20px",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  overflow: "hidden",
  textDecoration: "none",
  color: "inherit",
  transition: "border-color 120ms ease, transform 120ms ease",
  "&:hover": {
    borderColor: "primary.main",
    transform: "translateY(-2px)",
  },
};

const thumbWrapSx = { position: "relative", width: "100%", height: 272, overflow: "hidden" };

const thumbSx = {
  position: "absolute",
  top: 0,
  left: "-41.76%",
  width: "183.51%",
  height: "100%",
  maxWidth: "none",
};

const overlaySx = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "flex-end",
  p: 3,
  background: "linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0))",
};

const labelSx = { color: "#fff", textShadow: "0 1px 4px rgba(0, 0, 0, 0.6)" };

export default function PresetCard({ label, image, href }) {
  return (
    <Box component={href ? Link : "article"} href={href} sx={cardSx}>
      <Box sx={thumbWrapSx}>
        {/* 장식이 아니라 상황을 나타내는 콘텐츠 이미지라 alt 를 채웁니다. */}
        <Box
          component="img"
          src={image}
          alt={`${label} 분위기의 모임 사진`}
          loading="lazy"
          decoding="async"
          sx={thumbSx}
        />
      </Box>

      <Box sx={overlaySx}>
        <Typography variant="h5" sx={labelSx}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}
