import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { alpha } from "@mui/material/styles";
import Button from "@/components/ui/Button";
import { styles } from "./styles";
import InfoCard from "./InfoCard";

export default function ErrorView({ theme, onRetry, onBack }) {
  return (
    <>
      <Box
        sx={{
          ...styles.errorIconWrap,
          borderColor: alpha(theme.palette.error.main, 0.35),
          boxShadow: `0 0 60px 24px ${alpha(theme.palette.error.main, 0.1)}`,
        }}
      >
        <Box component="img" src="/assets/icons/error.svg" alt="" sx={styles.icon44} />
      </Box>

      <Typography variant="h3" color="text.primary" mb={5}>
        대화 가이드를 생성하지 못했습니다
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ ...styles.bodyText, mb: 5 }}>
        일시적인 오류가 발생했거나 입력하신 내용이 불충분할 수 있습니다. 다시 시도해 주세요.
      </Typography>

      <Box sx={{ ...styles.cardRow, mb: 5 }}>
        <InfoCard
          variant="plain"
          icon="/assets/icons/error1.svg"
          title="입력값 확인"
          desc="대화 주제나 상황 설명이 충분한지 확인해 주세요."
          theme={theme}
        />
        <InfoCard
          variant="plain"
          icon="/assets/icons/error2.svg"
          title="네트워크 상태"
          desc="인터넷 연결이 안정적인지 다시 한 번 체크해 보세요."
          theme={theme}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mb: 5, flexWrap: "wrap" }}>
        <Button
          variant="primary"
          size="md"
          onClick={onRetry}
          leadingIcon={<Box component="img" src="/assets/icons/reload.svg" alt="" sx={styles.icon18} />}
          sx={styles.actionBtn}
        >
          다시 시도하기
        </Button>
        <Button
          variant="tertiary"
          size="md"
          onClick={onBack}
          leadingIcon={<Box component="img" src="/assets/icons/arrowback.svg" alt="" sx={styles.icon18} />}
          sx={styles.actionBtn}
        >
          이전 단계로 돌아가기
        </Button>
      </Box>

      <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 4 }}>
        <Typography variant="body2" color="text.secondary" mb={1.5}>
          도움이 필요하신가요?
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
          <Link href="#" underline="always" color="primary.main" sx={styles.helpLink}>
            고객 센터 문의
          </Link>
          <Link href="#" underline="always" color="primary.main" sx={styles.helpLink}>
            자주 묻는 질문
          </Link>
        </Box>
      </Box>
    </>
  );
}
