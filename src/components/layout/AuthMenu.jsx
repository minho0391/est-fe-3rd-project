"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";

// 프로필 사진이 없을 때 닉네임 첫 글자로 대체합니다.
const AVATAR_COLORS = ["#5B52E8", "#8B5CF6", "#FFB547", "#238059", "#FF5A5F"];
const avatarColorOf = nickname =>
  AVATAR_COLORS[(nickname?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

const styles = {
  root: { display: "flex", alignItems: "center", gap: 2, minWidth: 0 },
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
  placeholder: { height: 40 },
};

// 헤더 우측 인증 블록입니다. Header 와 GameHeader 가 함께 씁니다.
export default function AuthMenu() {
  const router = useRouter();
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

  const openUserMenu = event => setUserMenuAnchor(event.currentTarget);
  const closeUserMenu = () => setUserMenuAnchor(null);

  const handleSignOut = async () => {
    closeUserMenu();
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (profile === undefined) {
    return <Box sx={{ ...styles.root, ...styles.placeholder }} />;
  }

  if (!profile) {
    return (
      <Box sx={styles.root}>
        <Button component={NextLink} href="/sign-in" variant="text" size="nav">
          로그인
        </Button>
        <Button component={NextLink} href="/sign-up" size="nav" sx={styles.signUpButton}>
          회원가입
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={styles.root}>
      <Box
        component="button"
        type="button"
        onClick={openUserMenu}
        aria-haspopup="true"
        aria-expanded={Boolean(userMenuAnchor)}
        aria-label="내 계정 메뉴"
        sx={styles.profileButton}
      >
        {/* button 안이라 Avatar 기본 태그(div) 대신 span 으로 둡니다. */}
        {/* src 가 있으면 MUI 가 내부에 img 를 만드는데, alt 를 주지 않으면 비어 있어 axe 에 걸립니다. */}
        <Avatar
          component="span"
          src={profile.avatar_url || undefined}
          slotProps={{ img: { alt: `${profile.nickname} 프로필 사진` } }}
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
    </Box>
  );
}
