import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import { alpha } from "@mui/material/styles";
import { styles } from "./styles";

// 로딩/에러 화면 공용 정보 카드
// variant="tinted": 로딩 화면용 (은은한 톤 배경 + 흰색 원형 아바타)
// variant="plain": 에러 화면용 (흰 배경 + 테두리 + 사각 아바타)
export default function InfoCard({ variant, icon, title, desc, theme }) {
  const isTinted = variant === "tinted";

  return (
    <Paper
      elevation={0}
      sx={{
        ...styles.card,
        bgcolor: isTinted ? theme.palette.momentalk.typeCard : "background.paper",
        borderColor: isTinted ? theme.palette.momentalk.accentLine : "divider",
      }}
    >
      <Avatar
        variant={isTinted ? "circular" : "rounded"}
        sx={{
          ...styles.avatar,
          bgcolor: isTinted ? "background.paper" : alpha(theme.palette.primary.main, 0.12),
          color: "primary.main",
          borderRadius: isTinted ? "50%" : 2,
        }}
      >
        <Box component="img" src={icon} alt="" sx={styles.icon20} />
      </Avatar>
      <Typography variant="body1" fontWeight={700} color="text.primary" mb={0.5}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {desc}
      </Typography>
    </Paper>
  );
}
