import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const cardSx = {
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
};

export default function TypeCard({ title, description, icon }) {
  return (
    <Box component="article" sx={cardSx}>
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
        <Typography component="h3" variant="h5">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Box>
  );
}
