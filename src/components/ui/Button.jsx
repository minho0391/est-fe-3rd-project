"use client";

import MuiButton from "@mui/material/Button";

const variantMap = {
  primary: "contained",
  secondary: "outlined",
  tertiary: "outlined",
  text: "text",
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
    "&:hover": {
      borderWidth: 2,
      borderColor: "primary.main",
      bgcolor: "background.paper",
    },
  },
  tertiary: {
    bgcolor: "background.paper",
    color: "text.primary",
    borderWidth: 1,
    borderColor: "divider",
    "&:hover": { borderColor: "divider", bgcolor: "background.paper" },
  },
  text: {
    color: "primary.main",
    "&:hover": { bgcolor: "transparent" },
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
      size={size}
      startIcon={leadingIcon}
      endIcon={trailingIcon}
      sx={{ ...variantStyles[variant], ...sx }}
      {...rest}
    >
      {children}
    </MuiButton>
  );
}
