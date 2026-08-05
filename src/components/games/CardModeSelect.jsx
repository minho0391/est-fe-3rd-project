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

const modeCardSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: 300,
  height: 400,
  p: "24px",
  bgcolor: "background.paper",
  borderRadius: "20px",
  filter: "drop-shadow(0px 4px 6px rgba(31, 41, 55, 0.08))",
  transition: "border-color 0.15s ease",
};

const badgeSx = { mt: 3, px: 2, py: 1, borderRadius: "9999px" };

export default function CardModeSelect({ onSelect }) {
  const [focused, setFocused] = useState("content");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, textAlign: "center" }}>
        <Typography component="h2" variant="h4">
          어떤 방식으로 즐길까요?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: "24px" }}>
          원하시는 게임 모드를 선택해 주세요.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 3, alignItems: "center", justifyContent: "center" }}>
        {modes.map(mode => {
          const isFocused = focused === mode.id;

          return (
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
              <Box component="img" src={mode.icon} alt="" sx={{ width: 80, height: 80, mb: 3 }} />

              <Typography variant="h5">{mode.title}</Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {mode.description}
              </Typography>

              <Box
                sx={{
                  ...badgeSx,
                  bgcolor: isFocused ? "primary.main" : "momentalk.presetCard",
                }}
              >
                <Typography
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
                sx={{ width: 20, height: 20, mt: 2.5, opacity: isFocused ? 1 : 0 }}
              />
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
