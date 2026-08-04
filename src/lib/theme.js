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
      hintChip: "#eef0ff",
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
    subtitle1: { fontSize: 18, lineHeight: "27px", fontWeight: 500 },
    body1: { fontSize: 16, lineHeight: "21px", fontWeight: 400 },
    body2: { fontSize: 14, lineHeight: "21px", fontWeight: 400 },
    button: { textTransform: "none", fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 16,
          whiteSpace: "nowrap",
          transition: "filter 0.15s ease",
          gap: 8,
          "& .MuiButton-startIcon, & .MuiButton-endIcon": {
            marginLeft: 0,
            marginRight: 0,
          },
        },
      },
      variants: [
        {
          props: { size: "md" },
          style: {
            height: 56,
            paddingLeft: 24,
            paddingRight: 24,
            fontSize: 18,
            lineHeight: "26px",
          },
        },
        {
          props: { size: "cta" },
          style: {
            width: 255,
            height: 75,
            padding: "16px 24px",
            fontSize: 18,
            lineHeight: "27px",
          },
        },
        {
          props: { size: "game" },
          style: {
            height: 56,
            paddingLeft: 24,
            paddingRight: 24,
            fontSize: 16,
            lineHeight: "24px",
            fontWeight: 400,
          },
        },
        {
          props: { size: "modal" },
          style: {
            height: 48,
            paddingLeft: 24,
            paddingRight: 24,
            fontSize: 15,
            lineHeight: "22px",
            fontWeight: 500,
          },
        },
        {
          props: { size: "nav" },
          style: {
            height: 40,
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 8,
            paddingBottom: 8,
            borderRadius: 8,
            fontSize: 14,
            lineHeight: "24px",
            fontWeight: 400,
          },
        },
        {
          props: { variant: "text" },
          style: {
            padding: 0,
            minWidth: 0,
            width: "auto",
            height: "auto",
            fontSize: 14,
            lineHeight: "21px",
            fontWeight: 400,
            borderRadius: 0,
          },
        },
      ],
    },
  },
});

export default theme;
