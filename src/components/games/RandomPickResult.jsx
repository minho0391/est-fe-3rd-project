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
  bgcolor: "momentalk.presetCard",
  borderRadius: "9999px",
  fontWeight: 500,
  letterSpacing: "0.6px",
};

const ballWrapSx = {
  position: "relative",
  width: { xs: 120, sm: 160 },
  height: { xs: 120, sm: 160 },
  flexShrink: 0,
};

const ballImageSx = {
  position: "absolute",
  top: "-12.5%",
  left: "-25%",
  width: "150%",
  height: "150%",
  maxWidth: "none",
};

const panelSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: { xs: 3, sm: 4 },
  width: "100%",
  p: { xs: "24px", sm: "49px" },
  bgcolor: "background.paper",
  border: 1,
  borderColor: "momentalk.modalBorder",
  borderRadius: "20px",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
};

const scriptGroupSx = { display: "flex", flexDirection: "column", gap: 1.5, width: "100%" };

// 좁은 화면에서는 본문 글자도 같이 줄입니다.
const scriptSx = {
  ...keepAllSx,
  fontSize: { xs: 20, sm: 28 },
  lineHeight: { xs: "28px", sm: "34px" },
};

const tipListSx = {
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
  width: "100%",
  p: 2,
  bgcolor: "momentalk.typeCard",
  borderRadius: "12px",
  listStyle: "none",
};

export default function RandomPickResult({ content, onClose, onRepick }) {
  // 퀴즈 형식은 정답이 extras 에 들어 있어 눌렀을 때만 보여줍니다.
  const [showAnswer, setShowAnswer] = useState(false);
  const label = FORMAT_LABELS[content.format_code] ?? "뽑힌 콘텐츠";
  const answer = content.extras?.answer;
  const lines = toContentLines(content);

  const handleRepick = () => {
    setShowAnswer(false);
    onRepick();
  };

  return (
    // aria-label 을 Dialog 에 직접 주면 role="presentation" 인 루트 div 에 붙어 웹 표준 위반입니다.
    // role="dialog" 가 붙는 paper 에 넘깁니다.
    <Dialog
      open
      onClose={onClose}
      slotProps={{
        backdrop: { sx: dialogBackdropSx },
        paper: { sx: transparentPaperSx, "aria-label": "뽑기 결과" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={ballWrapSx}>
          <Box component="img" src="/randompick-ball.svg" alt="" sx={ballImageSx} />
        </Box>

        <Box sx={panelSx}>
          <Typography component="span" variant="body2" color="primary.main" sx={badgeSx}>
            {label}
          </Typography>

          {needsContentTitle(content) && (
            <Typography variant="body2" color="text.disabled" align="center" sx={keepAllSx}>
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
                sx={keepAllSx}
              >
                정답: {answer}
              </Typography>
            ) : (
              <Button variant="secondary" onClick={() => setShowAnswer(true)}>
                정답 보기
              </Button>
            ))}

          {content.tips?.length > 0 && (
            <Box component="ul" sx={tipListSx}>
              {content.tips.map((tip, index) => (
                <Typography
                  key={index}
                  component="li"
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

          <Box sx={dialogActionRowSx}>
            <Button variant="secondary" onClick={onClose}>
              닫기
            </Button>
            <Button variant="primary" onClick={handleRepick}>
              다시 뽑기
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
