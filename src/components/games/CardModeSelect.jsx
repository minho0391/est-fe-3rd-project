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

export default function CardModeSelect({ onSelect }) {
  const [focused, setFocused] = useState("content");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, textAlign: "center" }}>
        <Typography component="h2" sx={{ fontSize: 24, lineHeight: "32px", fontWeight: 600 }}>
          어떤 방식으로 즐길까요?
        </Typography>
        <Typography sx={{ fontSize: 16, lineHeight: "24px", color: "text.secondary" }}>
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
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 300,
                height: 400,
                p: "24px",
                bgcolor: "background.paper",
                border: isFocused ? 2 : 1,
                borderColor: isFocused ? "primary.main" : "divider",
                borderRadius: "20px",
                filter: "drop-shadow(0px 4px 6px rgba(31, 41, 55, 0.08))",
                transition: "border-color 0.15s ease",
              }}
            >
              <Box component="img" src={mode.icon} alt="" sx={{ width: 80, height: 80, mb: 3 }} />

              <Typography sx={{ fontSize: 20, lineHeight: "28px", fontWeight: 600 }}>
                {mode.title}
              </Typography>

              <Typography
                sx={{ fontSize: 14, lineHeight: "21px", color: "text.secondary", mt: 0.5 }}
              >
                {mode.description}
              </Typography>

              <Box
                sx={{
                  mt: 3,
                  px: 2,
                  py: 1,
                  bgcolor: isFocused ? "primary.main" : "momentalk.presetCard",
                  borderRadius: "9999px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
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
