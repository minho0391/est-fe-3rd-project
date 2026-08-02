"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { layout } from "@/lib/layout";

export default function GameHeader({ title, onHelp, onSettings }) {
  const router = useRouter();

  const iconButtonSx = {
    width: 40,
    height: 40,
    p: 0,
    borderRadius: "9999px",
    "&:hover": { bgcolor: "momentalk.typeCard" },
  };

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        px: `${layout.gutter}px`,
        py: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.back()} aria-label="뒤로 가기" sx={iconButtonSx}>
            <Box component="img" src="/header-back.svg" alt="" sx={{ width: 16, height: 16 }} />
          </IconButton>

          <Typography
            component="h1"
            sx={{ color: "primary.main", fontSize: 24, lineHeight: "32px", fontWeight: 600 }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={onHelp} aria-label="도움말" sx={iconButtonSx}>
            <Box component="img" src="/header-help.svg" alt="" sx={{ width: 20, height: 20 }} />
          </IconButton>
          <IconButton onClick={onSettings} aria-label="설정" sx={iconButtonSx}>
            <Box component="img" src="/header-settings.svg" alt="" sx={{ width: 20, height: 20 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
