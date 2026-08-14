"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import Button from "@/components/ui/Button";
import { FORMAT_LABELS, needsContentTitle, toContentLines } from "@/lib/contentFormats";
import { dialogActionRowSx, dialogBackdropSx, keepAllSx, transparentPaperSx } from "./styles";

const badgeSx = {
  px: 2,
  py: 1,
  bgcolor: "background.paper",
  border: 1,
  borderColor: "primary.main",
  borderRadius: "999px",
};

const cardSx = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  height: 440,
  p: 3,
  bgcolor: "background.paper",
  borderRadius: "20px",
  boxShadow: "0 12px 32px 0 rgba(31, 41, 55, 0.12)",
  overflow: "hidden",
};

const cardGradientSx = {
  position: "absolute",
  inset: 0,
  opacity: 0.4,
  background: "linear-gradient(135deg, #ffffff 0%, #eff4ff 50%, #dee9fc 100%)",
};

const bodySx = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  width: "100%",
  overflow: "auto",
};

const titleSx = { ...keepAllSx, mb: 2 };
const scriptGroupSx = { display: "flex", flexDirection: "column", gap: 1.5, width: "100%" };
const scriptSx = { ...keepAllSx, width: 340, maxWidth: "100%", lineHeight: "39px" };

export default function CardContentResult({ content, onClose, onNext, hasNext = false }) {
  // 퀴즈 형식은 정답이 extras 에 들어 있어 눌렀을 때만 보여줍니다.
  const [showAnswer, setShowAnswer] = useState(false);
  const label = FORMAT_LABELS[content.format_code] ?? "뽑힌 콘텐츠";
  const answer = content.extras?.answer;
  const lines = toContentLines(content);

  // 모달이 닫히지 않고 내용만 바뀌므로 정답 노출 상태를 직접 되돌립니다.
  const handleNext = () => {
    setShowAnswer(false);
    onNext?.();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      aria-label="뽑힌 카드"
      transitionDuration={80}
      slotProps={{
        backdrop: { sx: dialogBackdropSx },
        paper: { sx: transparentPaperSx },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <Box sx={cardSx}>
          <Box aria-hidden="true" sx={cardGradientSx} />

          <Box sx={{ position: "relative", pb: 8, pt: 1 }}>
            <Typography component="span" variant="body2" color="primary.main" sx={badgeSx}>
              {label}
            </Typography>
          </Box>

          <Box sx={bodySx}>
            {needsContentTitle(content) && (
              <Typography variant="body2" color="text.disabled" align="center" sx={titleSx}>
                {content.title}
              </Typography>
            )}

            <Box sx={scriptGroupSx}>
              {lines.map((line, index) => (
                <Typography key={index} component="p" variant="h3" align="center" sx={scriptSx}>
                  {line}
                </Typography>
              ))}
            </Box>

            {answer &&
              (showAnswer ? (
                <Typography
                  component="p"
                  variant="h5"
                  color="primary.main"
                  align="center"
                  sx={{ ...keepAllSx, mt: 3 }}
                >
                  정답: {answer}
                </Typography>
              ) : (
                <Box sx={{ mt: 3 }}>
                  <Button variant="secondary" onClick={() => setShowAnswer(true)}>
                    정답 보기
                  </Button>
                </Box>
              ))}

            {content.tips?.length > 0 && (
              <Box sx={{ mt: 3, px: 2 }}>
                {content.tips.map((tip, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={keepAllSx}
                  >
                    {tip}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={dialogActionRowSx}>
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
          {hasNext && (
            <Button
              onClick={handleNext}
              trailingIcon={
                <Box component="img" src="/arrow.svg" alt="" sx={{ width: 16, height: 16 }} />
              }
            >
              다음 카드
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
