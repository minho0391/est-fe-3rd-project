"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import GameHeader from "@/components/layout/GameHeader";
import Footer from "@/components/layout/Footer";
import RandomPickResult from "./RandomPickResult";
import { createClient } from "@/utils/supabase/client";
import { balls } from "@/lib/randomPickData";
import { CONTENT_FORMATS, FORMAT_LABELS } from "@/lib/contentFormats";
import { formatChipSx, formatFilterRowSx, gameContentSx, gamePageSx } from "./styles";

// 좁은 화면에서는 공 5개가 한 줄에 들어가도록 줄입니다.
// 섞기 애니메이션이 한 줄 기준 x축 이동이라 줄 수는 그대로 둡니다.
const BALL_SIZE = { xs: 40, sm: 80 };
const BALL_SIZE_FALLBACK = 80;

const SHUFFLE_STEPS = 4;
const STEP_DURATION = 600;

// 형식 필터에서 "전체"를 나타내는 값
const ALL_FORMATS = "";

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
  flexShrink: 0,
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
  const [selectedFormat, setSelectedFormat] = useState(ALL_FORMATS);
  const [gap, setGap] = useState(0);
  const timers = useRef([]);
  const rowRef = useRef(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // 공이 놓이는 줄의 실제 폭을 재서 칸 간격을 계산합니다.
  // 공 크기가 화면 폭에 따라 달라지므로 상수 대신 실제 공 폭을 측정합니다.
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const measure = () => {
      const width = row.getBoundingClientRect().width;
      const ballWidth = row.firstElementChild?.getBoundingClientRect().width ?? BALL_SIZE_FALLBACK;
      const slots = balls.length - 1;
      setGap(slots > 0 ? (width - ballWidth) / slots : 0);
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
  // 형식 필터는 매번 다시 조회하지 않고 받아온 목록에서 걸러 씁니다.
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data, error } = await createClient()
        .from("default_contents")
        .select("id, title, scripts, tips, extras, format_code")
        .in("format_code", CONTENT_FORMATS)
        .eq("is_active", true)
        .limit(500);

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

  // 실제로 콘텐츠가 있는 형식만 칩으로 보여줍니다.
  const availableFormats = useMemo(() => {
    const codes = new Set(pool.map(item => item.format_code));
    return CONTENT_FORMATS.filter(code => codes.has(code));
  }, [pool]);

  const filteredPool = useMemo(
    () =>
      selectedFormat === ALL_FORMATS
        ? pool
        : pool.filter(item => item.format_code === selectedFormat),
    [pool, selectedFormat],
  );

  const pickRandom = previousId => {
    const candidates = filteredPool.filter(item => item.id !== previousId);
    const list = candidates.length > 0 ? candidates : filteredPool;
    return list.length > 0 ? list[Math.floor(Math.random() * list.length)] : null;
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

  const isReady = !isShuffling && filteredPool.length > 0;

  let titleText = "마음에 드는 공을 하나 고르세요";
  if (isShuffling) titleText = "공을 섞는 중이에요";
  else if (loadError) titleText = "콘텐츠를 불러오지 못했어요";
  else if (pool.length === 0) titleText = "콘텐츠를 불러오는 중이에요";
  else if (filteredPool.length === 0) titleText = "이 형식에는 콘텐츠가 없어요";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", flex: 1 }}>
      <GameHeader title="랜덤 픽" />

      <Box
        component="main"
        sx={{
          ...gamePageSx,
          justifyContent: "center",
          minHeight: { xs: 480, lg: 779 },
          pt: { xs: 5, lg: 8 },
          pb: { xs: 6, lg: 10 },
          overflow: "hidden",
        }}
      >
        <Box sx={{ ...gameContentSx, display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography
            component="h2"
            variant="h2"
            align="center"
            sx={{ fontSize: { xs: 24, lg: 32 }, letterSpacing: "-0.64px" }}
          >
            {titleText}
          </Typography>

          {availableFormats.length > 0 && (
            <Box sx={formatFilterRowSx}>
              <Chip
                label="전체"
                onClick={() => setSelectedFormat(ALL_FORMATS)}
                variant={selectedFormat === ALL_FORMATS ? "filled" : "outlined"}
                color={selectedFormat === ALL_FORMATS ? "primary" : "default"}
                sx={formatChipSx}
              />
              {availableFormats.map(code => (
                <Chip
                  key={code}
                  label={FORMAT_LABELS[code] ?? code}
                  onClick={() => setSelectedFormat(code)}
                  variant={selectedFormat === code ? "filled" : "outlined"}
                  color={selectedFormat === code ? "primary" : "default"}
                  sx={formatChipSx}
                />
              ))}
            </Box>
          )}

          <Box
            sx={{
              ...cardSx,
              position: "relative",
              width: "100%",
              // 공 크기 + 위아래 여백에 맞춘 높이입니다.
              height: { xs: 80, lg: 178 },
              p: { xs: "20px", lg: "49px" },
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
                  {/* button 안이라 div 대신 span 으로 둡니다. */}
                  <Box
                    component="span"
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
