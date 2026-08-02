import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function PresetCard({ label, image }) {
  return (
    <Box
      component="article"
      sx={{
        position: "relative",
        flex: "1 0 0",
        minWidth: 0,
        p: "1px",
        bgcolor: "momentalk.presetCard",
        border: 1,
        borderColor: "divider",
        borderRadius: "20px",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative", width: "100%", height: 272, overflow: "hidden" }}>
        <Box
          component="img"
          src={image}
          alt=""
          sx={{
            position: "absolute",
            top: 0,
            left: "-41.76%",
            width: "183.51%",
            height: "100%",
            maxWidth: "none",
          }}
        />
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "flex-end",
          p: 3,
          background: "linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0))",
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontSize: 20,
            lineHeight: "28px",
            fontWeight: 600,
            textShadow: "0 1px 4px rgba(0, 0, 0, 0.6)",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}
