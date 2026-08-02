import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function TypeCard({ title, description, icon }) {
  return (
    <Box
      component="article"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        flex: "1 0 0",
        minWidth: 0,
        p: "33px",
        bgcolor: "momentalk.typeCard",
        border: 1,
        borderColor: "divider",
        borderRadius: "20px",
      }}
    >
      <Box component="img" src={icon} alt="" sx={{ width: 48, height: 48, flexShrink: 0 }} />

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
        <Typography component="h3" sx={{ fontSize: 20, lineHeight: "28px", fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 14, lineHeight: "21px", color: "text.secondary" }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
}
