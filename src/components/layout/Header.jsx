"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AuthMenu from "@/components/layout/AuthMenu";
import { games } from "@/lib/mainPageData";
import { layout } from "@/lib/layout";

const styles = {
  header: {
    width: "100%",
    bgcolor: "background.paper",
    borderBottom: 1,
    borderColor: "divider",
    px: `${layout.gutter}px`,
    pt: 2,
    pb: "17px",
  },
  inner: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    maxWidth: `${layout.maxWidth}px`,
    height: 64,
    mx: "auto",
  },
  // 양옆에 같은 flex 값을 줘서 가운데 nav 가 헤더 정중앙에 오도록 합니다.
  side: { display: "flex", alignItems: "center", flex: 1, minWidth: 0 },
  sideRight: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    minWidth: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    height: 40,
    color: "primary.main",
  },
  nav: { display: "flex", alignItems: "center", gap: 4, flexShrink: 0 },
  navLink: {
    display: "flex",
    alignItems: "center",
    height: 40,
    fontSize: 14,
    lineHeight: "24px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    "&:hover": { color: "primary.main" },
  },
  // 드롭다운 트리거는 button 이라 기본 스타일을 지웁니다.
  navButtonReset: { p: 0, border: 0, background: "none", fontFamily: "inherit" },
  menuPaper: {
    mt: 1,
    minWidth: 200,
    borderRadius: "16px",
    border: 1,
    borderColor: "divider",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  },
  menuItem: { py: 1.5, fontSize: 14 },
};

// 현재 경로에 해당하는 메뉴를 강조합니다.
const activeSx = { color: "primary.main", fontWeight: 700 };
const inactiveSx = { color: "text.secondary", fontWeight: 400 };

const navLinkStateSx = isActive => ({
  ...styles.navLink,
  ...(isActive ? activeSx : inactiveSx),
});

export default function Header() {
  const pathname = usePathname();

  const [gameMenuAnchor, setGameMenuAnchor] = useState(null);

  const openGameMenu = event => setGameMenuAnchor(event.currentTarget);
  const closeGameMenu = () => setGameMenuAnchor(null);

  const isGenerate = pathname.startsWith("/generate");
  const isGame = pathname.startsWith("/game");
  const isCommunity = pathname.startsWith("/post");

  return (
    <Box component="header" sx={styles.header}>
      <Box sx={styles.inner}>
        <Box sx={styles.side}>
          <MuiLink component={NextLink} href="/" underline="none" variant="h4" sx={styles.logo}>
            Momentalk
          </MuiLink>
        </Box>

        <Box component="nav" sx={styles.nav}>
          <MuiLink
            component={NextLink}
            href="/generate"
            underline="none"
            sx={navLinkStateSx(isGenerate)}
          >
            대화 생성
          </MuiLink>

          {/* 게임은 3종이라 드롭다운으로 묶습니다. */}
          <MuiLink
            component="button"
            type="button"
            underline="none"
            onClick={openGameMenu}
            aria-haspopup="true"
            aria-expanded={Boolean(gameMenuAnchor)}
            sx={{ ...navLinkStateSx(isGame), ...styles.navButtonReset }}
          >
            게임
          </MuiLink>

          <Menu
            anchorEl={gameMenuAnchor}
            open={Boolean(gameMenuAnchor)}
            onClose={closeGameMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{ paper: { sx: styles.menuPaper } }}
          >
            {games.map(game => (
              <MenuItem
                key={game.id}
                component={NextLink}
                href={game.href}
                onClick={closeGameMenu}
                selected={pathname === game.href}
                sx={styles.menuItem}
              >
                {game.title}
              </MenuItem>
            ))}
          </Menu>

          <MuiLink
            component={NextLink}
            href="/post"
            underline="none"
            sx={navLinkStateSx(isCommunity)}
          >
            커뮤니티
          </MuiLink>
        </Box>

        <Box sx={styles.sideRight}>
          <AuthMenu />
        </Box>
      </Box>
    </Box>
  );
}
