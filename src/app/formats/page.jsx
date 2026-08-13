// [형식 전체 보기] 페이지 (localhost:3000/formats)
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchOptions } from "@/lib/generateOptions";
import { layout } from "@/lib/layout";

/**
 * 형식별 아이콘·설명.
 *
 * 형식 목록 자체는 DB(options.category = 'format')에서 가져오고,
 * 여기서는 화면 표현만 라벨 기준으로 붙입니다.
 * 매칭되는 항목이 없으면 설명 없이 라벨만 나옵니다.
 */
const FORMAT_PRESENTATION = {
  질문: { icon: "/type-question.svg", description: "가벼운 아이스브레이킹용" },
  밸런스: { icon: "/type-balance.svg", description: "호불호가 확실한 선택지" },
  대화주제: { icon: "/type-topic.svg", description: "깊이 있는 대화를 위한" },
  미션: {
    icon: "/type-mission.svg",
    description: "함께 수행하는 재미있는 행동",
  },
  유머: {
    icon: "/type-humor.svg",
    description: "분위기를 풀어주는 가벼운 웃음",
  },
  퀴즈: {
    icon: "/type-quiz.svg",
    description: "맞히면서 자연스럽게 이어지는 대화",
  },
  게임: { icon: "/type-game.svg", description: "다 같이 참여하는 짧은 놀이" },
  벌칙: {
    icon: "/type-penalty.svg",
    description: "지는 사람이 수행하는 유쾌한 벌칙",
  },
};

// 메인 페이지 형식 카드와 같은 규격입니다.
const cardSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: { xs: 2, lg: 3 },
  p: { xs: 2, lg: "33px" },
  height: "100%",
  bgcolor: "momentalk.typeCard",
  border: 1,
  borderColor: "divider",
  borderRadius: "20px",
  textDecoration: "none",
  color: "inherit",
  transition: "border-color 120ms ease, transform 120ms ease",
  "&:hover": {
    borderColor: "primary.main",
    transform: "translateY(-2px)",
  },
};

const iconSx = {
  width: { xs: 36, lg: 48 },
  height: { xs: 36, lg: 48 },
  flexShrink: 0,
};

// 아이콘이 없는 형식은 라벨 첫 글자로 대신합니다.
const fallbackIconSx = {
  ...iconSx,
  display: "grid",
  placeItems: "center",
  borderRadius: "14px",
  bgcolor: "primary.main",
  color: "#fff",
  fontSize: { xs: 16, lg: 20 },
  fontWeight: 700,
};

// 형식 카드: PC 4열 / 태블릿·모바일 2열
const gridSx = {
  display: "grid",
  gap: { xs: 2, lg: 3 },
  width: "100%",
  gridTemplateColumns: { xs: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
};

function FormatCard({ code, label }) {
  const presentation = FORMAT_PRESENTATION[label] ?? {};

  return (
    <Box component={Link} href={`/generate?format=${encodeURIComponent(code)}`} sx={cardSx}>
      {presentation.icon ? (
        <Box component="img" src={presentation.icon} alt="" sx={iconSx} />
      ) : (
        <Box aria-hidden="true" sx={fallbackIconSx}>
          {label.slice(0, 1)}
        </Box>
      )}

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
          {label}
        </Typography>
        {presentation.description && (
          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "keep-all" }}>
            {presentation.description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function FormatListPage() {
  const [formats, setFormats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoadError("");
        const grouped = await fetchOptions();

        if (!isMounted) return;
        setFormats(grouped.format ?? []);
      } catch (error) {
        console.error("형식 목록을 불러오지 못했습니다.", error);
        if (isMounted) {
          setFormats([]);
          setLoadError("형식 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", flex: 1 }}>
      <Header />

      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 4, lg: 6 },
          width: "100%",
          minHeight: 600,
          px: layout.pagePx,
          py: { xs: 5, lg: 8 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            width: "100%",
            maxWidth: `${layout.maxWidth}px`,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 1 }}>
            <Typography component="h1" variant="h2" sx={{ fontSize: { xs: 24, lg: 32 } }}>
              형식 전체 보기
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ wordBreak: "keep-all" }}>
              원하는 형식을 고르면 해당 형식이 선택된 상태로 대화 생성 화면이 열려요.
            </Typography>
          </Box>

          {isLoading && (
            <Typography variant="body2" color="text.secondary">
              불러오는 중입니다...
            </Typography>
          )}

          {!isLoading && loadError && (
            <Typography variant="body2" color="error" role="alert">
              {loadError}
            </Typography>
          )}

          {!isLoading && !loadError && formats.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              등록된 형식이 없습니다.
            </Typography>
          )}

          {!isLoading && !loadError && formats.length > 0 && (
            <Box sx={gridSx}>
              {formats.map(format => (
                <FormatCard key={format.code} code={format.code} label={format.label} />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
