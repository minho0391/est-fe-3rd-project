"use client";

import MuiButton from "@mui/material/Button";

const variantMap = {
  primary: "contained",
  secondary: "outlined",
  tertiary: "outlined",
};

const sizeStyles = {
  md: { height: 56, px: 3, fontSize: 18, lineHeight: "26px" },
  cta: { width: 255, height: 75, px: 3, py: 2, fontSize: 18, lineHeight: "27px" },
};

const variantStyles = {
  primary: {
    bgcolor: "primary.main",
    color: "#fff",
    "&:hover": { bgcolor: "primary.main", filter: "brightness(0.96)" },
  },
  secondary: {
    bgcolor: "background.paper",
    color: "primary.main",
    borderWidth: 2,
    borderColor: "primary.main",
    "&:hover": { borderWidth: 2, borderColor: "primary.main", bgcolor: "background.paper" },
  },
  tertiary: {
    bgcolor: "background.paper",
    color: "text.primary",
    borderWidth: 1,
    borderColor: "divider",
    "&:hover": { borderColor: "divider", bgcolor: "background.paper" },
  },
};

export default function Button({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  children,
  sx,
  ...rest
}) {
  return (
    <MuiButton
      variant={variantMap[variant]}
      startIcon={leadingIcon}
      endIcon={trailingIcon}
      sx={{
        borderRadius: "16px",
        fontWeight: 500,
        whiteSpace: "nowrap",
        transition: "filter 0.15s ease",
        gap: 1,
        "& .MuiButton-startIcon, & .MuiButton-endIcon": { mx: 0 },
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...sx,
      }}
      {...rest}
    >
      {children}
    </MuiButton>
  );
}
