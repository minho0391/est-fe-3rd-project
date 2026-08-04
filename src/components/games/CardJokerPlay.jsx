"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GameCardBack from "./GameCardBack";
import CardJokerResult from "./CardJokerResult";

const CARD_COUNT = 4;

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
    if (deck[index]) setShowResult(true);
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
