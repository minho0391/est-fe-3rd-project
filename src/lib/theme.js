"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#5b52e8" },
    success: { main: "#238059" },
    error: { main: "#ff5a5f" },
    warning: { main: "#ffb547" },
    text: {
      primary: "#1f2937",
      secondary: "#4b5563",
      disabled: "#6b7280",
    },
    divider: "#e5e7eb",
    background: {
      default: "#f8f9ff",
      paper: "#ffffff",
    },
    // 시안 전용 색 (palette.momentalk.xxx 로 접근)
    momentalk: {
      presetCard: "#e6eeff",
      typeCard: "#eff4ff",
      footer: "#eff4ff",
      accentLine: "#d9e3f6",
      modalBorder: "#c7c4d8",
      ballEdge: "#3a31c0",
    },
  },
  typography: {
    fontFamily: [
      '"Pretendard Variable"',
      "Pretendard",
      "-apple-system",
      "BlinkMacSystemFont",
      "system-ui",
      '"Apple SD Gothic Neo"',
      '"Noto Sans KR"',
      "sans-serif",
    ].join(","),
    h1: { fontSize: 48, lineHeight: "58px", fontWeight: 700 },
    h2: { fontSize: 32, lineHeight: "39px", fontWeight: 700 },
    h3: { fontSize: 28, lineHeight: "34px", fontWeight: 700 },
    h4: { fontSize: 24, lineHeight: "32px", fontWeight: 600 },
    h5: { fontSize: 20, lineHeight: "28px", fontWeight: 600 },
    body1: { fontSize: 16, lineHeight: "21px", fontWeight: 400 },
    body2: { fontSize: 14, lineHeight: "21px", fontWeight: 400 },
    button: { textTransform: "none", fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: "100%" },
        body: {
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          maxWidth: "100vw",
          overflowX: "hidden",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        a: { color: "inherit", textDecoration: "none" },
        img: { display: "block" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
});

// 레이아웃 상수 (시안 기준 PC 1440, 좌우 여백 120)
export const layout = {
  maxWidth: 1200,
  gutter: 120,
};

export default theme;
