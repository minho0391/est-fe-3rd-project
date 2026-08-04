"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import { layout } from "@/lib/layout";

const links = ["About", "Privacy Policy", "Terms of Service", "Help Center"];

const linkSx = {
  display: "flex",
  alignItems: "center",
  height: 40,
  textDecorationColor: "inherit",
};

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
            variant="h5"
            color="primary.main"
            sx={{ display: "flex", alignItems: "center", height: 40, fontWeight: 700 }}
          >
            Momentalk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            © 2026 Momentalk AI. All rights reserved.
          </Typography>
        </Box>

        <Box component="nav" sx={{ display: "flex", gap: 4 }}>
          {links.map(label => (
            <MuiLink
              key={label}
              href="#"
              underline="always"
              variant="body2"
              color="text.secondary"
              sx={linkSx}
            >
              {label}
            </MuiLink>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
