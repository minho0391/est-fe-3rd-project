"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AuthMenu from "@/components/layout/AuthMenu";
import { layout } from "@/lib/layout";

const iconButtonSx = {
  width: 40,
  height: 40,
  p: 0,
  borderRadius: "9999px",
  "&:hover": { bgcolor: "momentalk.typeCard" },
};

export default function GameHeader({ title, onBack }) {
  const router = useRouter();

  const handleBack = onBack ?? (() => router.back());

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        px: layout.pagePx,
        py: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          width: "100%",
          maxWidth: `${layout.maxWidth}px`,
          mx: "auto",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
          <IconButton onClick={handleBack} aria-label="뒤로 가기" sx={iconButtonSx}>
            <Box component="img" src="/header-back.svg" alt="" sx={{ width: 16, height: 16 }} />
          </IconButton>

          <Typography component="h1" variant="h4" color="primary.main" noWrap>
            {title}
          </Typography>
        </Box>

        {/* 도움말·설정 아이콘은 동작이 없어 인증 블록으로 교체했습니다. */}
        <AuthMenu />
      </Box>
    </Box>
  );
}
