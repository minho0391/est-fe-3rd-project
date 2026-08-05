"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import Button from "@/components/ui/Button";
import { layout } from "@/lib/layout";

const navItems = [
  { label: "Discover", href: "#", active: false },
  { label: "Topics", href: "#", active: false },
  { label: "Games", href: "#", active: false },
  { label: "Community", href: "/post", active: true },
];

const navLinkSx = {
  display: "flex",
  alignItems: "center",
  height: 40,
  fontSize: 14,
  lineHeight: "24px",
};

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
            variant="h4"
            sx={{
              display: "flex",
              alignItems: "center",
              height: 40,
              color: "primary.main",
            }}
          >
            Momentalk
          </MuiLink>

          <Box component="nav" sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            {navItems.map(item => (
              <MuiLink
                key={item.label}
                component={NextLink}
                href={item.href}
                underline="none"
                sx={{
                  ...navLinkSx,
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
          <Button variant="text" size="nav">
            로그인
          </Button>
          <Button size="nav" sx={{ borderRadius: "12px" }}>
            회원가입
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
