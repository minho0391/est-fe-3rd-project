"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import { layout } from "@/lib/layout";

const links = ["About", "Privacy Policy", "Terms of Service", "Help Center"];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        bgcolor: "momentalk.footer",
        borderTop: 1,
        borderColor: "divider",
        px: `${layout.gutter}px`,
        pt: "65px",
        pb: 6,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: `${layout.maxWidth}px`,
          mx: "auto",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              height: 40,
              color: "primary.main",
              fontSize: 20,
              lineHeight: "28px",
              fontWeight: 700,
            }}
          >
            Momentalk
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: "21px", color: "text.secondary" }}>
            © 2026 Momentalk AI. All rights reserved.
          </Typography>
        </Box>

        <Box component="nav" sx={{ display: "flex", gap: 4 }}>
          {links.map(label => (
            <MuiLink
              key={label}
              href="#"
              underline="always"
              sx={{
                display: "flex",
                alignItems: "center",
                height: 40,
                color: "text.secondary",
                fontSize: 14,
                lineHeight: "21px",
                textDecorationColor: "inherit",
              }}
            >
              {label}
            </MuiLink>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
