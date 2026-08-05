"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import GameHeader from "@/components/layout/GameHeader";
import Footer from "@/components/layout/Footer";
import RandomPickResult from "./RandomPickResult";
import { supabase } from "@/lib/supabase";
import { balls, RANDOM_PICK_FORMATS } from "@/lib/randomPickData";
import { layout } from "@/lib/layout";

const BALL_SIZE = 80;
const SHUFFLE_STEPS = 4;
const STEP_DURATION = 600;

const cardSx = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: "20px",
};

const ballSx = {
  position: "relative",
  width: BALL_SIZE,
  height: BALL_SIZE,
  bgcolor: "primary.main",
  borderBottom: "4px solid",
  borderBottomColor: "momentalk.ballEdge",
  borderRadius: "9999px",
  boxShadow: "0 10px 15px -3px rgba(91, 82, 232, 0.3)",
  overflow: "hidden",
  transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
};

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function RandomPick() {
  const [order, setOrder] = useState(() => balls.map((_, i) => i));
  const [isShuffling, setIsShuffling] = useState(true);
  const [pool, setPool] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [result, setResult] = useState(null);
  const [gap, setGap] = useState(0);
  const timers = useRef([]);
  const rowRef = useRef(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // 공이 놓이는 줄의 실제 폭을 재서 칸 간격을 계산
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const measure = () => {
      const width = row.getBoundingClientRect().width;
      const slots = balls.length - 1;
      setGap(slots > 0 ? (width - BALL_SIZE) / slots : 0);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    for (let step = 1; step <= SHUFFLE_STEPS; step += 1) {
      timers.current.push(setTimeout(() => setOrder(prev => shuffle(prev)), step * STEP_DURATION));
    }
    timers.current.push(setTimeout(() => setIsShuffling(false), SHUFFLE_STEPS * STEP_DURATION));
    return clearTimers;
  }, []);

  // TODO: 추후 Edge Function으로 AI 생성 콘텐츠를 받아오도록 변경 예정.
  // 현재는 default_contents 조회로 유지.
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data, error } = await supabase
        .from("default_contents")
        .select("id, title, scripts, tips, format_code")
        .in("format_code", RANDOM_PICK_FORMATS)
        .limit(300);

      if (!alive) return;
      if (error || !data || data.length === 0) {
        setLoadError(true);
        return;
      }
      setPool(data);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const pickRandom = previousId => {
    const candidates = pool.filter(item => item.id !== previousId);
    const list = candidates.length > 0 ? candidates : pool;
    return list[Math.floor(Math.random() * list.length)];
  };

  const skipShuffle = () => {
    if (!isShuffling) return;
    clearTimers();
    setOrder(prev => shuffle(prev));
    setIsShuffling(false);
  };

  const handlePick = () => setResult(pickRandom(null));
  const handleRepick = () => setResult(prev => pickRandom(prev?.id));
  const handleClose = () => setResult(null);

  const isReady = !isShuffling && pool.length > 0;

  let titleText = "마음에 드는 공을 하나 고르세요";
  if (isShuffling) titleText = "공을 섞는 중이에요";
  else if (loadError) titleText = "콘텐츠를 불러오지 못했어요";
  else if (pool.length === 0) titleText = "콘텐츠를 불러오는 중이에요";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", flex: 1 }}>
      <GameHeader title="랜덤 픽" />

      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          minHeight: 779,
          px: `${layout.gutter}px`,
          pt: 8,
          pb: 10,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            width: "100%",
            maxWidth: `${layout.maxWidth}px`,
          }}
        >
          <Typography component="h2" variant="h2" align="center" sx={{ letterSpacing: "-0.64px" }}>
            {titleText}
          </Typography>

          <Box
            sx={{
              ...cardSx,
              position: "relative",
              width: "100%",
              height: 178,
              p: "49px",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: "linear-gradient(to right, #4d41df 0%, #ffb547 50%, #32c48d 100%)",
              }}
            />

            <Box
              ref={rowRef}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              {balls.map((ball, index) => (
                <ButtonBase
                  key={ball.id}
                  onClick={handlePick}
                  disabled={!isReady}
                  aria-label={`${index + 1}번 공 선택`}
                  sx={{
                    ...ballSx,
                    transform: `translateX(${(order[index] - index) * gap}px)`,
                  }}
                >
                  <Box
                    aria-hidden="true"
                    sx={{
                      position: "absolute",
                      top: "10%",
                      left: "15%",
                      right: "50%",
                      bottom: "66.25%",
                      bgcolor: "rgba(255, 255, 255, 0.4)",
                      borderRadius: "12px",
                      filter: "blur(1px)",
                    }}
                  />
                </ButtonBase>
              ))}
            </Box>
          </Box>

          {isShuffling && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <ButtonBase
                onClick={skipShuffle}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: "9999px",
                  color: "text.secondary",
                  typography: "body2",
                  "&:hover": { color: "text.primary" },
                }}
              >
                건너뛰기
              </ButtonBase>
            </Box>
          )}
          {loadError && (
            <Typography variant="body2" color="text.secondary" align="center">
              잠시 후 새로고침해 주세요.
            </Typography>
          )}
        </Box>
      </Box>

      <Footer />

      {result && (
        <RandomPickResult content={result} onClose={handleClose} onRepick={handleRepick} />
      )}
    </Box>
  );
}
