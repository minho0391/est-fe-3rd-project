"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import GameCardBack from "./GameCardBack";
import CardContentResult from "./CardContentResult";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { CONTENT_FORMATS, FORMAT_LABELS } from "@/lib/contentFormats";
import {
  cardFaceSx,
  cardRowSx,
  formatChipSx,
  formatFilterRowSx,
  gameButtonSx,
  playAreaSx,
} from "./styles";

const CARD_COUNT = 4;

// 카드가 돌기 시작하자마자 모달이 따라 올라오도록
const RESULT_DELAY = 0;

// 형식 필터에서 "전체"를 나타내는 값
const ALL_FORMATS = "";

const contentCardSx = {
  ...cardFaceSx,
  p: "25px",
  border: 1,
  borderColor: "divider",
  overflow: "hidden",
};

const headGroupSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  width: "100%",
};

const cardLabelSx = { lineHeight: "20px", pb: 2 };
const cardScriptGroupSx = { display: "flex", flexDirection: "column", gap: 1 };
const cardScriptSx = { lineHeight: "29px", wordBreak: "keep-all" };

export default function CardContentPlay() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState({}); // { 카드인덱스: 콘텐츠 }
  const [result, setResult] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(ALL_FORMATS);

  // TODO: 추후 Edge Function으로 AI 생성 콘텐츠를 받아오도록 변경 예정.
  // 현재는 default_contents 조회로 유지.
  // 형식 필터는 매번 다시 조회하지 않고 받아온 목록에서 걸러 씁니다.
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data, error: queryError } = await createClient()
          .from("default_contents")
          .select("id, title, scripts, tips, extras, format_code")
          .in("format_code", CONTENT_FORMATS)
          .eq("is_active", true)
          .limit(500);
        if (queryError) throw queryError;
        if (!alive) return;

        setItems(data ?? []);
      } catch (e) {
        if (!alive) return;
        setError(e.message ?? "콘텐츠를 불러오지 못했어요");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // 실제로 콘텐츠가 있는 형식만 칩으로 보여줍니다.
  const availableFormats = useMemo(() => {
    const codes = new Set(items.map(item => item.format_code));
    return CONTENT_FORMATS.filter(code => codes.has(code));
  }, [items]);

  const filteredItems = useMemo(
    () =>
      selectedFormat === ALL_FORMATS
        ? items
        : items.filter(item => item.format_code === selectedFormat),
    [items, selectedFormat],
  );

  // 형식을 바꾸면 덱이 달라지므로 뒤집은 카드를 모두 덮습니다.
  const handleSelectFormat = code => {
    setSelectedFormat(code);
    setOpened({});
    setResult(null);
  };

  // 이미 뽑힌 콘텐츠는 빼고 하나를 고릅니다.
  const pickOne = () => {
    if (filteredItems.length === 0) return null;
    const usedIds = Object.values(opened).map(item => item.id);
    const candidates = filteredItems.filter(item => !usedIds.includes(item.id));
    const list = candidates.length > 0 ? candidates : filteredItems;
    return list[Math.floor(Math.random() * list.length)];
  };

  const handleFlip = index => {
    if (opened[index]) return;
    const picked = pickOne();
    if (!picked) return;

    setOpened(prev => ({ ...prev, [index]: picked }));

    // 카드가 돌아가는 중에 모달이 올라오도록 합니다.
    setTimeout(() => setResult(picked), RESULT_DELAY);
  };

  // 아직 덮여 있는 카드 중 가장 왼쪽 자리. 없으면 -1.
  const nextIndex = Array.from({ length: CARD_COUNT }).findIndex((_, index) => !opened[index]);

  // 모달의 "다음 카드" — 모달을 닫지 않고 다음 카드를 대신 뒤집습니다.
  const handleNext = () => {
    if (nextIndex === -1) {
      setResult(null);
      return;
    }
    const picked = pickOne();
    if (!picked) return;

    setOpened(prev => ({ ...prev, [nextIndex]: picked }));
    setResult(picked);
  };

  const handleCloseResult = () => setResult(null);

  // 뒤집은 카드를 모두 덮고 처음 상태로 되돌립니다.
  const handleRestart = () => {
    setOpened({});
    setResult(null);
  };

  const isReady = !error && filteredItems.length > 0;
  const openedCount = Object.keys(opened).length;
  const isFinished = openedCount === CARD_COUNT;

  let titleText = "카드를 뒤집으면 질문이 나와요";
  if (error) titleText = error;
  else if (items.length === 0) titleText = "콘텐츠를 불러오는 중이에요";
  else if (filteredItems.length === 0) titleText = "이 형식에는 콘텐츠가 없어요";
  else if (isFinished) titleText = "카드를 모두 뒤집었어요";

  return (
    <Box sx={playAreaSx}>
      <Box sx={headGroupSx}>
        <Typography component="h2" variant="h4" align="center">
          {titleText}
        </Typography>

        {availableFormats.length > 0 && (
          <Box sx={formatFilterRowSx}>
            <Chip
              label="전체"
              onClick={() => handleSelectFormat(ALL_FORMATS)}
              variant={selectedFormat === ALL_FORMATS ? "filled" : "outlined"}
              color={selectedFormat === ALL_FORMATS ? "primary" : "default"}
              sx={formatChipSx}
            />
            {availableFormats.map(code => (
              <Chip
                key={code}
                label={FORMAT_LABELS[code] ?? code}
                onClick={() => handleSelectFormat(code)}
                variant={selectedFormat === code ? "filled" : "outlined"}
                color={selectedFormat === code ? "primary" : "default"}
                sx={formatChipSx}
              />
            ))}
          </Box>
        )}
      </Box>

      <Box sx={cardRowSx}>
        {Array.from({ length: CARD_COUNT }).map((_, index) => {
          const content = opened[index];

          if (!content) {
            return (
              <GameCardBack key={index} onClick={() => handleFlip(index)} disabled={!isReady} />
            );
          }

          // scripts 가 비어 있는 행은 title 이 곧 본문입니다.
          const scripts = content.scripts ?? [];
          const lines = scripts.length > 0 ? scripts : [content.title];

          return (
            <Box key={index} sx={contentCardSx}>
              <Typography variant="body2" color="text.disabled" sx={cardLabelSx}>
                {scripts.length > 0 ? content.title : FORMAT_LABELS[content.format_code]}
              </Typography>
              <Box sx={cardScriptGroupSx}>
                {lines.map((line, lineIndex) => (
                  <Typography key={lineIndex} variant="subtitle1" sx={cardScriptSx}>
                    {line}
                  </Typography>
                ))}
              </Box>
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
          onNext={handleNext}
          hasNext={nextIndex !== -1}
        />
      )}
    </Box>
  );
}
