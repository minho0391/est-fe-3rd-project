"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GameCardBack from "./GameCardBack";
import CardContentResult from "./CardContentResult";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { cardFaceSx, cardRowSx, gameButtonSx, playAreaSx } from "./styles";

const CARD_COUNT = 4;

// 카드가 돌기 시작하자마자 모달이 따라 올라오도록
const RESULT_DELAY = 0;

const contentCardSx = {
  ...cardFaceSx,
  p: "25px",
  border: 1,
  borderColor: "divider",
};

const cardTitleSx = { lineHeight: "20px", pb: 2 };
const cardScriptSx = { lineHeight: "29px", wordBreak: "keep-all" };

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
        const { data, error } = await createClient()
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

  // 뒤집은 카드를 모두 덮고 처음 상태로 되돌립니다.
  const handleRestart = () => {
    setOpened({});
    setResult(null);
  };

  const isReady = !error && items.length > 0;
  const openedCount = Object.keys(opened).length;
  const isFinished = openedCount === CARD_COUNT;

  return (
    <Box sx={playAreaSx}>
      <Typography component="h2" variant="h4" align="center">
        {error || (isFinished ? "카드를 모두 뒤집었어요" : "카드를 뒤집으면 질문이 나와요")}
      </Typography>

      <Box sx={cardRowSx}>
        {Array.from({ length: CARD_COUNT }).map((_, index) => {
          const content = opened[index];

          if (!content) {
            return (
              <GameCardBack key={index} onClick={() => handleFlip(index)} disabled={!isReady} />
            );
          }

          return (
            <Box key={index} sx={contentCardSx}>
              <Typography variant="body2" color="text.disabled" sx={cardTitleSx}>
                {content.title}
              </Typography>
              <Typography variant="subtitle1" sx={cardScriptSx}>
                {content.scripts?.[0]}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {openedCount > 0 && (
        <Button variant="secondary" onClick={handleRestart} sx={gameButtonSx}>
          다시 시작
        </Button>
      )}

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
