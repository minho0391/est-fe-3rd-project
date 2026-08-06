import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { styles } from "./styles";
import InfoCard from "./InfoCard";

// 진행 구간 안내 문구
const PROGRESS_STEPS = [
  { until: 30, label: "상황 정보 분석 중..." },
  { until: 65, label: "스크립트 구성 요소 생성 중..." },
  { until: 90, label: "대화 톤 다듬는 중..." },
  { until: 100, label: "마무리 검수 중..." },
];

export function getCurrentStepLabel(progress) {
  return PROGRESS_STEPS.find(step => progress <= step.until)?.label ?? PROGRESS_STEPS[PROGRESS_STEPS.length - 1].label;
}

export default function LoadingView({ progress, theme }) {
  const stepLabel = getCurrentStepLabel(progress);

  return (
    <>
      <Box sx={styles.badge}>AI 분석 진행중입니다.</Box>

      <Typography variant="h4" color="text.primary" mb={2}>
        AI가 최적의 대화 가이드를 분석하고 있습니다
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ ...styles.bodyText, mb: 6 }}>
        상황을 분석하여 당신만을 위한 맞춤형 스크립트를 생성 중입니다. 잠시만 기다려 주세요.
        <br />
        대화의 성공 확률을 높이기 위해 수천 개의 패턴을 대조하고 있습니다.
      </Typography>

      <Box sx={styles.progressWrap}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            ...styles.progressBar,
            bgcolor: theme.palette.momentalk.presetCard,
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        />
        <Box sx={styles.progressRow}>
          <Typography variant="body2" color="text.secondary">
            {stepLabel}
          </Typography>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {Math.min(Math.round(progress), 100)}%
          </Typography>
        </Box>
      </Box>

      <Box sx={styles.cardRow}>
        <InfoCard
          variant="tinted"
          icon="/assets/icons/loading1.svg"
          title="심리 엔진 분석"
          desc="상대방의 의도를 파악"
          theme={theme}
        />
        <InfoCard
          variant="tinted"
          icon="/assets/icons/loading2.svg"
          title="맞춤형 스크립트"
          desc="자연스러운 문장 생성"
          theme={theme}
        />
      </Box>
    </>
  );
}
