"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GameCardBack from "./GameCardBack";
import CardContentResult from "./CardContentResult";
import { supabase } from "@/lib/supabase";

const CARD_COUNT = 4;

export default function CardContentPlay() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState({}); // { 카드인덱스: 콘텐츠 }
  const [result, setResult] = useState(null);

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
    setResult(picked);
  };

  const handleCloseResult = () => setResult(null);

  const isReady = !error && items.length > 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Typography
        component="h2"
        sx={{ fontSize: 24, lineHeight: "32px", fontWeight: 600, textAlign: "center" }}
      >
        {error || "카드를 뒤집으면 질문이 나와요"}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          width: "100%",
          px: 4,
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
            <Box
              key={index}
              sx={{
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
              }}
            >
              <Typography sx={{ fontSize: 14, lineHeight: "20px", color: "text.disabled", pb: 2 }}>
                {content.title}
              </Typography>
              <Typography
                sx={{ fontSize: 18, lineHeight: "29px", fontWeight: 500, wordBreak: "keep-all" }}
              >
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
