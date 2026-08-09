"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GameCardBack from "./GameCardBack";
import CardContentResult from "./CardContentResult";
import { supabase } from "@/lib/supabase";

const CARD_COUNT = 4;

// 카드 앞면이 나타날 때 살짝 뒤집히는 모션
const FLIP_DURATION = 200;
// 카드가 돌기 시작하자마자 모달이 따라 올라오도록
const RESULT_DELAY = 0;

const cardSx = {
  display: "flex",
  flexDirection: "column",
  width: 220,
  height: 300,
  flexShrink: 0,
  p: "25px",
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: "20px",
  "@keyframes flipIn": {
    from: { transform: "rotateY(-70deg)", opacity: 0 },
    to: { transform: "rotateY(0deg)", opacity: 1 },
  },
  animation: `flipIn ${FLIP_DURATION}ms cubic-bezier(0.2, 0.8, 0.3, 1)`,
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
};

export default function CardContentPlay() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState({}); // { 카드인덱스: 콘텐츠 }
  const [result, setResult] = useState(null);

  // TODO: 추후 Edge Function으로 AI 생성 콘텐츠를 받아오도록 변경 예정.
  // 현재는 default_contents 조회로 유지.
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("default_contents")
          .select("id, title, scripts, tips, format_code")
          .eq("format_code", "game")
          .limit(100);
        if (error) throw error;

        setItems(data);
      } catch (e) {
        setError(e.message ?? "콘텐츠를 불러오지 못했어요");
      }
    })();
  }, []);

  const handleFlip = index => {
    if (items.length === 0 || opened[index]) return;

    const usedIds = Object.values(opened).map(item => item.id);
    const candidates = items.filter(item => !usedIds.includes(item.id));
    const list = candidates.length > 0 ? candidates : items;
    const picked = list[Math.floor(Math.random() * list.length)];

    setOpened(prev => ({ ...prev, [index]: picked }));

    // 카드가 돌아가는 중에 모달이 올라오도록 합니다.
    setTimeout(() => setResult(picked), RESULT_DELAY);
  };

  const handleCloseResult = () => setResult(null);

  const isReady = !error && items.length > 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Typography component="h2" variant="h4" align="center">
        {error || "카드를 뒤집으면 질문이 나와요"}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          width: "100%",
          px: 4,
          perspective: "1200px",
        }}
      >
        {Array.from({ length: CARD_COUNT }).map((_, index) => {
          const content = opened[index];

          if (!content) {
            return (
              <GameCardBack key={index} onClick={() => handleFlip(index)} disabled={!isReady} />
            );
          }

          return (
            <Box key={index} sx={cardSx}>
              <Typography variant="body2" color="text.disabled" sx={{ lineHeight: "20px", pb: 2 }}>
                {content.title}
              </Typography>
              <Typography variant="subtitle1" sx={{ lineHeight: "29px", wordBreak: "keep-all" }}>
                {content.scripts?.[0]}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {result && (
        <CardContentResult
          content={result}
          onClose={handleCloseResult}
          onNext={handleCloseResult}
        />
      )}
    </Box>
  );
}
