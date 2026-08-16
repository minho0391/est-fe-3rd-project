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

// 피그마 기준 카드 높이: PC 272 / 모바일 154
const thumbWrapSx = {
  position: "relative",
  width: "100%",
  height: { xs: 154, lg: 272 },
  overflow: "hidden",
};

// 원본 비율을 유지한 채 넘치는 부분만 잘라냅니다.
// 이전에는 left/width 를 퍼센트로 밀어 크롭했는데, 반응형으로 컨테이너
// 비율이 달라지면서 이미지가 가로로 늘어났습니다(Lighthouse image-aspect-ratio).
const thumbSx = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const overlaySx = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "flex-end",
  p: { xs: 2, lg: 3 },
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
        {/* 섹션(h2) 아래 카드 제목이라 h3. variant 는 그대로라 크기는 안 바뀝니다. */}
        <Typography component="h3" variant="h5" sx={labelSx}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}
