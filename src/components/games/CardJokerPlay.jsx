"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GameCardBack from "./GameCardBack";
import CardJokerResult from "./CardJokerResult";

const CARD_COUNT = 4;

// 카드 앞면이 나타날 때 살짝 뒤집히는 모션
const FLIP_DURATION = 200;
// 카드가 돌기 시작하자마자 모달이 따라 올라오도록
const RESULT_DELAY = 0;

const cardSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  width: 220,
  height: 300,
  flexShrink: 0,
  p: "18px",
  bgcolor: "background.paper",
  border: 2,
  borderRadius: "20px",
  filter: "drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.05))",
  "@keyframes flipIn": {
    from: { transform: "rotateY(-70deg)", opacity: 0 },
    to: { transform: "rotateY(0deg)", opacity: 1 },
  },
  animation: `flipIn ${FLIP_DURATION}ms cubic-bezier(0.2, 0.8, 0.3, 1)`,
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
};

function createDeck() {
  const jokerIndex = Math.floor(Math.random() * CARD_COUNT);
  return Array.from({ length: CARD_COUNT }, (_, i) => i === jokerIndex);
}

export default function CardJokerPlay() {
  const [deck, setDeck] = useState(createDeck);
  const [opened, setOpened] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const isFinished = opened.some(index => deck[index]);

  const handleFlip = index => {
    if (isFinished || opened.includes(index)) return;

    setOpened(prev => [...prev, index]);

    // 카드가 돌아가는 중에 모달이 올라오도록 합니다.
    if (deck[index]) setTimeout(() => setShowResult(true), RESULT_DELAY);
  };

  const handleRestart = () => {
    setDeck(createDeck());
    setOpened([]);
    setShowResult(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Typography component="h2" variant="h4" align="center">
        번갈아 뒤집어서 조커를 피하세요
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
        {deck.map((isJoker, index) => {
          if (!opened.includes(index)) {
            return (
              <GameCardBack key={index} onClick={() => handleFlip(index)} disabled={isFinished} />
            );
          }

          const stateColor = isJoker ? "error.main" : "success.main";

          return (
            <Box key={index} sx={{ ...cardSx, borderColor: stateColor }}>
              <Box
                sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}
              >
                <Box
                  component="img"
                  src={isJoker ? "/card-joker.svg" : "/card-safe.svg"}
                  alt=""
                  sx={{ width: 80, height: 80 }}
                />
              </Box>

              <Typography variant="h5" color={stateColor} sx={{ pb: 2 }}>
                {isJoker ? "조커! 벌칙" : "세이프"}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {showResult && <CardJokerResult onConfirm={handleRestart} />}
    </Box>
  );
}
