"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GameCardBack from "./GameCardBack";
import CardJokerResult from "./CardJokerResult";
import Button from "@/components/ui/Button";
import { cardFaceSx, cardRowSx, gameButtonSx, playAreaSx } from "./styles";

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

  // 조커 위치를 새로 뽑고 카드를 전부 덮습니다.
  const handleRestart = () => {
    setDeck(createDeck());
    setOpened([]);
    setShowResult(false);
  };

  return (
    <Box sx={playAreaSx}>
      <Typography component="h2" variant="h4" align="center">
        번갈아 뒤집어서 조커를 피하세요
      </Typography>

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

      {showResult && <CardJokerResult onConfirm={handleRestart} />}
    </Box>
  );
}
