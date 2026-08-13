"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import GameHeader from "@/components/layout/GameHeader";
import Footer from "@/components/layout/Footer";
import CardModeSelect from "./CardModeSelect";
import CardContentPlay from "./CardContentPlay";
import CardJokerPlay from "./CardJokerPlay";
import { gameContentSx, gamePageSx } from "./styles";

export default function CardGame() {
  const router = useRouter();
  const [mode, setMode] = useState(null); // null | content | joker

  const handleBack = () => {
    if (mode) setMode(null);
    else router.back();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", flex: 1 }}>
      <GameHeader title="카드 뒤집기" onBack={handleBack} />

      <Box component="main" sx={{ ...gamePageSx, justifyContent: "center", py: { xs: 5, lg: 8 } }}>
        <Box sx={gameContentSx}>
          {mode === null && <CardModeSelect onSelect={setMode} />}
          {mode === "content" && <CardContentPlay />}
          {mode === "joker" && <CardJokerPlay />}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
