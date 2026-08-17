"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Link from "next/link";
import { layout } from "@/lib/layout";

// 좁은 화면에서는 시안대로 라벨을 줄여 한 줄에 넣습니다.
const links = [
  { full: "About", short: "About" },
  { full: "Privacy Policy", short: "Privacy" },
  { full: "Terms of Service", short: "Terms" },
  { full: "Help Center", short: "Help" },
];

const linkSx = {
  display: "flex",
  alignItems: "center",
  height: 40,
  whiteSpace: "nowrap",
  textDecorationColor: "inherit",
};

const labelSx = breakpoint => ({
  display: breakpoint === "short" ? { xs: "inline", md: "none" } : { xs: "none", md: "inline" },
});

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        bgcolor: "momentalk.footer",
        borderTop: 1,
        borderColor: "divider",
        px: layout.pagePx,
        pt: { xs: 5, lg: "65px" },
        pb: { xs: 4, lg: 6 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          // 좁은 화면에서는 로고 블록과 링크를 세로로 쌓습니다.
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: { xs: 2, md: 0 },
          width: "100%",
          maxWidth: `${layout.maxWidth}px`,
          mx: "auto",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* 보이는 텍스트(Momentalk)를 aria-label 앞에 넣어야 label-content-name-mismatch 를 피합니다. */}
          <MuiLink
            component={Link}
            href="/"
            underline="none"
            aria-label="Momentalk 홈으로 이동"
            sx={{ width: "fit-content" }}
          >
            {/* 로고는 문서 제목이 아니라 홈 링크라 heading 태그를 쓰지 않습니다. */}
            <Typography
              component="span"
              variant="h5"
              color="primary.main"
              sx={{ display: "flex", alignItems: "center", height: 40, fontWeight: 700 }}
            >
              Momentalk
            </Typography>
          </MuiLink>
          <Typography variant="body2" color="text.secondary">
            © 2026 Momentalk AI. All rights reserved.
          </Typography>
        </Box>

        <Box
          component="nav"
          sx={{
            display: "flex",
            justifyContent: { xs: "space-between", md: "flex-end" },
            gap: { xs: 0, md: 4 },
            width: { xs: "100%", md: "auto" },
          }}
        >
          {links.map(item => (
            <MuiLink
              key={item.full}
              href="#"
              underline="always"
              variant="body2"
              color="text.secondary"
              sx={linkSx}
            >
              <Box component="span" sx={labelSx("short")}>
                {item.short}
              </Box>
              <Box component="span" sx={labelSx("full")}>
                {item.full}
              </Box>
            </MuiLink>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
