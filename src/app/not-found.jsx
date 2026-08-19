"use client";

import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { layout } from "@/lib/layout";

export default function NotFound() {
  return (
    <>
      <Header />

      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          minHeight: { xs: "60vh", lg: "70vh" },
          px: layout.pagePx,
          py: { xs: 6, lg: 10 },
        }}
      >
        <Typography
          component="p"
          sx={{
            fontSize: { xs: 64, sm: 88, lg: 120 },
            fontWeight: 700,
            lineHeight: 1,
            color: "primary.main",
          }}
        >
          404
        </Typography>

        <Typography component="h1" sx={{ mt: 3, fontSize: { xs: 20, lg: 28 }, fontWeight: 700 }}>
          페이지를 찾을 수 없습니다
        </Typography>

        <Typography
          sx={{
            mt: 1.5,
            fontSize: { xs: 14, lg: 16 },
            color: "text.secondary",
            wordBreak: "keep-all",
          }}
        >
          주소가 잘못되었거나, 삭제된 페이지일 수 있습니다.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 4, width: { xs: "100%", sm: "auto" } }}
        >
          <Button component={Link} href="/" variant="contained" size="large">
            메인으로 가기
          </Button>
          <Button component={Link} href="/post" variant="outlined" size="large">
            커뮤니티 둘러보기
          </Button>
        </Stack>
      </Box>

      <Footer />
    </>
  );
}
