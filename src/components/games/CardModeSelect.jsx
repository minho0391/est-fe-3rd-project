"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";

const modes = [
  {
    id: "content",
    icon: "/card-mode-content.svg",
    title: "콘텐츠 카드",
    description: "질문·미션 뽑기",
  },
  {
    id: "joker",
    icon: "/card-mode-joker.svg",
    title: "조커 찾기",
    description: "조커를 피해라, 걸리면 벌칙",
  },
];

// 피그마: PC·태블릿 300x400 2열 / 모바일은 폭을 채우는 세로 1열
const modeCardSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: { xs: "100%", sm: 300 },
  height: { xs: 278, sm: 400 },
  p: "24px",
  bgcolor: "background.paper",
  borderRadius: "20px",
  filter: "drop-shadow(0px 4px 6px rgba(31, 41, 55, 0.08))",
  transition: "border-color 0.15s ease",
};

const modeRowSx = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: 3,
  alignItems: "center",
  justifyContent: "center",
};

const badgeSx = { mt: { xs: 2, sm: 3 }, px: 2, py: 1, borderRadius: "9999px" };

export default function CardModeSelect({ onSelect }) {
  const [focused, setFocused] = useState("content");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 4, lg: 6 }, width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, textAlign: "center" }}>
        <Typography component="h2" variant="h4">
          어떤 방식으로 즐길까요?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: "24px" }}>
          원하시는 게임 모드를 선택해 주세요.
        </Typography>
      </Box>

      <Box sx={modeRowSx}>
        {modes.map(mode => {
          const isFocused = focused === mode.id;

          return (
            // ButtonBase 는 button 으로 렌더되므로 안쪽에는 span 만 둡니다.
            // (button 의 콘텐츠 모델은 phrasing content 라 h*·p·div 를 넣을 수 없습니다.)
            <ButtonBase
              key={mode.id}
              onClick={() => onSelect(mode.id)}
              onMouseEnter={() => setFocused(mode.id)}
              onFocus={() => setFocused(mode.id)}
              sx={{
                ...modeCardSx,
                border: isFocused ? 2 : 1,
                borderColor: isFocused ? "primary.main" : "divider",
              }}
            >
              <Box
                component="img"
                src={mode.icon}
                alt=""
                sx={{ width: 80, height: 80, mb: { xs: 2, sm: 3 } }}
              />

              <Typography component="span" variant="h5">
                {mode.title}
              </Typography>

              <Typography component="span" variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {mode.description}
              </Typography>

              <Box
                component="span"
                sx={{
                  ...badgeSx,
                  bgcolor: isFocused ? "primary.main" : "momentalk.presetCard",
                }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    lineHeight: "20px",
                    letterSpacing: "0.6px",
                    color: isFocused ? "#fff" : "text.secondary",
                  }}
                >
                  시작하기
                </Typography>
              </Box>

              <Box
                component="img"
                src="/card-check.svg"
                alt=""
                sx={{
                  width: 20,
                  height: 20,
                  mt: { xs: 1.5, sm: 2.5 },
                  opacity: isFocused ? 1 : 0,
                }}
              />
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
