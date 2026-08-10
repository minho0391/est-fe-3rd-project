"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import MuiLink from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { games } from "@/lib/mainPageData";
import { layout } from "@/lib/layout";

// 프로필 사진이 없을 때 닉네임 첫 글자로 대체합니다.
const AVATAR_COLORS = ["#5B52E8", "#8B5CF6", "#FFB547", "#238059", "#FF5A5F"];
const avatarColorOf = nickname =>
  AVATAR_COLORS[(nickname?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

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
    gap: 2,
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
  signUpButton: { borderRadius: "12px" },
  // 로그인 상태 표시
  profileButton: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    p: 0,
    border: 0,
    background: "none",
    fontFamily: "inherit",
    cursor: "pointer",
    color: "text.primary",
  },
  avatar: { width: 32, height: 32, fontSize: 14, fontWeight: 700 },
  nickname: { fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" },
  // 세션 확인 전에도 헤더 높이가 흔들리지 않도록 자리를 잡아둡니다.
  authPlaceholder: { height: 40 },
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
  const router = useRouter();

  const [gameMenuAnchor, setGameMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  // null 이면 비로그인, undefined 면 아직 확인 중입니다.
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    const db = createClient();
    let isMounted = true;

    const loadProfile = async user => {
      if (!user) {
        if (isMounted) setProfile(null);
        return;
      }

      const { data } = await db
        .from("profiles")
        .select("nickname, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (isMounted) setProfile(data ?? null);
    };

    db.auth.getUser().then(({ data }) => loadProfile(data?.user));

    // 로그인·로그아웃 시 새로고침 없이 헤더가 바뀌도록 합니다.
    const { data: sub } = db.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const openGameMenu = event => setGameMenuAnchor(event.currentTarget);
  const closeGameMenu = () => setGameMenuAnchor(null);

  const openUserMenu = event => setUserMenuAnchor(event.currentTarget);
  const closeUserMenu = () => setUserMenuAnchor(null);

  const handleSignOut = async () => {
    closeUserMenu();
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

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
          {profile === undefined ? (
            <Box sx={styles.authPlaceholder} />
          ) : profile ? (
            <>
              <Box
                component="button"
                type="button"
                onClick={openUserMenu}
                aria-haspopup="true"
                aria-expanded={Boolean(userMenuAnchor)}
                aria-label="내 계정 메뉴"
                sx={styles.profileButton}
              >
                <Avatar
                  src={profile.avatar_url || undefined}
                  sx={{ ...styles.avatar, bgcolor: avatarColorOf(profile.nickname) }}
                >
                  {profile.nickname?.charAt(0)}
                </Avatar>
                <Box component="span" sx={styles.nickname}>
                  {profile.nickname}
                </Box>
              </Box>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={closeUserMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: styles.menuPaper } }}
              >
                <MenuItem
                  component={NextLink}
                  href="/post/mypage"
                  onClick={closeUserMenu}
                  sx={styles.menuItem}
                >
                  마이페이지
                </MenuItem>
                <MenuItem onClick={handleSignOut} sx={styles.menuItem}>
                  로그아웃
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button component={NextLink} href="/sign-in" variant="text" size="nav">
                로그인
              </Button>
              <Button component={NextLink} href="/sign-up" size="nav" sx={styles.signUpButton}>
                회원가입
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
