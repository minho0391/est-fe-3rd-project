"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import Button from "@/components/ui/Button";
import { FORMAT_LABELS } from "@/lib/randomPickData";

const badgeSx = {
  px: 2,
  py: 1,
  bgcolor: "momentalk.presetCard",
  borderRadius: "9999px",
  fontWeight: 500,
  letterSpacing: "0.6px",
};

const keepAllSx = { wordBreak: "keep-all" };

export default function RandomPickResult({ content, onClose, onRepick }) {
  const label = FORMAT_LABELS[content.format_code] ?? "뽑힌 콘텐츠";

  return (
    <Dialog
      open
      onClose={onClose}
      aria-label="뽑기 결과"
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(0, 0, 0, 0.7)" } },
        paper: {
          sx: {
            width: 448,
            maxWidth: "100%",
            m: 3,
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "visible",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <Box sx={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
          <Box
            component="img"
            src="/randompick-ball.svg"
            alt=""
            sx={{
              position: "absolute",
              top: "-12.5%",
              left: "-25%",
              width: "150%",
              height: "150%",
              maxWidth: "none",
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            width: "100%",
            p: "49px",
            bgcolor: "background.paper",
            border: 1,
            borderColor: "momentalk.modalBorder",
            borderRadius: "20px",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography component="span" variant="body2" color="primary.main" sx={badgeSx}>
            {label}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%" }}>
            {content.scripts?.map((script, index) => (
              <Typography key={index} variant="h3" align="center" sx={keepAllSx}>
                {script}
              </Typography>
            ))}
          </Box>

          {content.tips?.length > 0 && (
            <Box
              component="ul"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
                width: "100%",
                p: 2,
                bgcolor: "momentalk.typeCard",
                borderRadius: "12px",
                listStyle: "none",
              }}
            >
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

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              width: "100%",
              "& > *": { flex: "1 0 0", minWidth: 0 },
            }}
          >
            <Button variant="secondary" onClick={onClose}>
              닫기
            </Button>
            <Button variant="primary" onClick={onRepick}>
              다시 뽑기
            </Button>
          </Box>
        </Box>

        <Typography variant="body2" color="text.disabled" align="center">
          새로운 주제를 원하시면 다시 뽑기 버튼을 눌러주세요.
        </Typography>
      </Box>
    </Dialog>
  );
}
