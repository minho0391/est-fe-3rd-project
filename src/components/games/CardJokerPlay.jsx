"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GameCardBack from "./GameCardBack";
import CardJokerResult from "./CardJokerResult";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { cardFaceSx, cardRowSx, gameButtonSx, keepAllSx, playAreaSx } from "./styles";

const CARD_COUNT = 4;

// 카드가 돌기 시작하자마자 모달이 따라 올라오도록
const RESULT_DELAY = 0;

const jokerCardSx = {
  ...cardFaceSx,
  alignItems: "center",
  justifyContent: "space-between",
  p: "18px",
  border: 2,
  filter: "drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.05))",
};

const cardIconWrapSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
};

const cardIconSx = { width: 80, height: 80 };

const headGroupSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  width: "100%",
};

const penaltyBoxSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 0.5,
  maxWidth: 480,
  px: 3,
  py: 2,
  bgcolor: "momentalk.presetCard",
  borderRadius: "16px",
};

function createDeck() {
  const jokerIndex = Math.floor(Math.random() * CARD_COUNT);
  return Array.from({ length: CARD_COUNT }, (_, i) => i === jokerIndex);
}

// scripts 가 비어 있는 행은 title 이 곧 본문입니다.
function toLines(content) {
  const scripts = content?.scripts ?? [];
  return scripts.length > 0 ? scripts : [content?.title].filter(Boolean);
}

export default function CardJokerPlay() {
  const [deck, setDeck] = useState(createDeck);
  const [opened, setOpened] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [penalties, setPenalties] = useState([]);
  const [penalty, setPenalty] = useState(null);

  // TODO: 추후 Edge Function으로 AI 생성 콘텐츠를 받아오도록 변경 예정.
  // 현재는 default_contents 조회로 유지.
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data, error } = await createClient()
        .from("default_contents")
        .select("id, title, scripts, tips, format_code")
        .eq("format_code", "penalty")
        .eq("is_active", true)
        .limit(100);

      if (!alive || error || !data || data.length === 0) return;

      setPenalties(data);
      setPenalty(data[Math.floor(Math.random() * data.length)]);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const isFinished = opened.some(index => deck[index]);

  const handleFlip = index => {
    if (isFinished || opened.includes(index)) return;

    setOpened(prev => [...prev, index]);

    // 카드가 돌아가는 중에 모달이 올라오도록 합니다.
    if (deck[index]) setTimeout(() => setShowResult(true), RESULT_DELAY);
  };

  // 조커 위치와 벌칙을 새로 뽑고 카드를 전부 덮습니다.
  const handleRestart = () => {
    setDeck(createDeck());
    setOpened([]);
    setShowResult(false);

    if (penalties.length === 0) return;
    const candidates = penalties.filter(item => item.id !== penalty?.id);
    const list = candidates.length > 0 ? candidates : penalties;
    setPenalty(list[Math.floor(Math.random() * list.length)]);
  };

  return (
    <Box sx={playAreaSx}>
      <Box sx={headGroupSx}>
        <Typography component="h2" variant="h4" align="center">
          번갈아 뒤집어서 조커를 피하세요
        </Typography>

        {penalty && (
          <Box sx={penaltyBoxSx}>
            <Typography variant="body2" color="text.disabled">
              이번 판 벌칙
            </Typography>
            {toLines(penalty).map((line, index) => (
              <Typography
                key={index}
                variant="subtitle1"
                color="primary.main"
                align="center"
                sx={keepAllSx}
              >
                {line}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={cardRowSx}>
        {deck.map((isJoker, index) => {
          if (!opened.includes(index)) {
            return (
              <GameCardBack key={index} onClick={() => handleFlip(index)} disabled={isFinished} />
            );
          }

          const stateColor = isJoker ? "error.main" : "success.main";

          return (
            <Box key={index} sx={{ ...jokerCardSx, borderColor: stateColor }}>
              <Box sx={cardIconWrapSx}>
                <Box
                  component="img"
                  src={isJoker ? "/card-joker.svg" : "/card-safe.svg"}
                  alt=""
                  sx={cardIconSx}
                />
              </Box>

              <Typography variant="h5" color={stateColor} sx={{ pb: 2 }}>
                {isJoker ? "조커! 벌칙" : "세이프"}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {opened.length > 0 && (
        <Button variant="secondary" onClick={handleRestart} sx={gameButtonSx}>
          다시 시작
        </Button>
      )}

      {showResult && <CardJokerResult penalty={penalty} onConfirm={handleRestart} />}
    </Box>
  );
}
