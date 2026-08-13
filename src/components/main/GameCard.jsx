"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const cardSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: { xs: 2, lg: 3 },
  flex: "1 0 0",
  minWidth: 0,
  p: { xs: 3, lg: "33px" },
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: "20px",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  "&:hover": {
    borderColor: "primary.main",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },
};

export default function GameCard({ title, description, icon, href }) {
  return (
    <Box component={NextLink} href={href} sx={cardSx}>
      <Box
        component="img"
        src={icon}
        alt=""
        sx={{ width: { xs: 48, lg: 64 }, height: { xs: 48, lg: 64 }, flexShrink: 0 }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography component="h3" variant="h4">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "keep-all" }}>
          {description}
        </Typography>
      </Box>

      <Box
        aria-hidden="true"
        sx={{ width: "100%", height: 4, bgcolor: "momentalk.accentLine", borderRadius: "9999px" }}
      />
    </Box>
  );
}
