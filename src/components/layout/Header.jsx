"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import MuiButton from "@mui/material/Button";
import { layout } from "@/lib/layout";

const navItems = [
  { label: "Discover", href: "#", active: false },
  { label: "Topics", href: "#", active: false },
  { label: "Games", href: "#", active: false },
  { label: "Community", href: "/post", active: true },
];

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        px: `${layout.gutter}px`,
        pt: 2,
        pb: "17px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: `${layout.maxWidth}px`,
          height: 64,
          mx: "auto",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MuiLink
            component={NextLink}
            href="/"
            underline="none"
            sx={{
              display: "flex",
              alignItems: "center",
              height: 40,
              color: "primary.main",
              fontSize: 24,
              lineHeight: "32px",
              fontWeight: 700,
            }}
          >
            Momentalk
          </MuiLink>

          <Box
            component="nav"
            sx={{ display: "flex", alignItems: "center", gap: 3 }}
          >
            {navItems.map(item => (
              <MuiLink
                key={item.label}
                component={NextLink}
                href={item.href}
                underline="none"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  height: 40,
                  fontSize: 14,
                  lineHeight: "24px",
                  color: item.active ? "primary.main" : "text.secondary",
                  fontWeight: item.active ? 700 : 400,
                }}
              >
                {item.label}
              </MuiLink>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <MuiButton
            sx={{
              height: 40,
              px: 3,
              py: 1,
              borderRadius: "8px",
              color: "primary.main",
              fontSize: 14,
              lineHeight: "24px",
              fontWeight: 400,
            }}
          >
            로그인
          </MuiButton>
          <MuiButton
            variant="contained"
            disableElevation
            sx={{
              height: 40,
              px: 3,
              py: 1,
              borderRadius: "12px",
              fontSize: 14,
              lineHeight: "24px",
              fontWeight: 400,
            }}
          >
            회원가입
          </MuiButton>
        </Box>
      </Box>
    </Box>
  );
}
