"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import PresetCard from "@/components/main/PresetCard";
import TypeCard from "@/components/main/TypeCard";
import GameCard from "@/components/main/GameCard";
import { presets, types, games } from "@/lib/mainPageData";
import { layout } from "@/lib/layout";

function SectionHeading({ title, subtitle, moreLabel, moreHref }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 34,
      }}
    >
      <Box component="h2" sx={{ display: "flex", alignItems: "flex-end", m: 0 }}>
        <Typography component="span" variant="h3">
          {title}
        </Typography>
        {subtitle && (
          <Typography component="span" variant="subtitle1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>

      {moreLabel && (
        <Button variant="text" component={Link} href={moreHref}>
          {moreLabel}
        </Button>
      )}
    </Box>
  );
}

const cardRowSx = { display: "flex", alignItems: "stretch", gap: 3, width: "100%" };
const sectionSx = { display: "flex", flexDirection: "column", gap: 4, width: "100%" };

export default function MainPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", flex: 1 }}>
      <Header />

      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          width: "100%",
          minHeight: 800,
          px: `${layout.gutter}px`,
          py: 4,
        }}
      >
        <Box
          component="section"
          sx={{
            width: "100%",
            maxWidth: `${layout.maxWidth}px`,
            bgcolor: "background.paper",
            py: 15,
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Typography component="h1" variant="h1" align="center">
              할 말 없어서
              <br />또 폰만 봤죠?
            </Typography>

            <Typography variant="body1" color="text.secondary" align="center">
              어떤 모임에 어떤 분위기든,
              <br />
              고르기만 하면 AI가 대화 소재를 뽑아 드려요.
            </Typography>

            <Button
              size="cta"
              component={Link}
              href="/generate"
              trailingIcon={
                <Box component="img" src="/arrow.svg" alt="" sx={{ width: 16, height: 16 }} />
              }
            >
              대화 소재 받기
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
            maxWidth: `${layout.maxWidth}px`,
          }}
        >
          <Box component="section" sx={sectionSx}>
            <SectionHeading title="프리셋 " subtitle="(상황별)" />
            <Box sx={cardRowSx}>
              {presets.map(preset => (
                <PresetCard
                  key={preset.id}
                  href={`/generate?preset=${preset.code}`}
                  label={preset.label}
                  image={preset.image}
                />
              ))}
            </Box>
          </Box>

          <Box component="section" sx={sectionSx}>
            <SectionHeading
              title="형식 "
              subtitle="(종류별)"
              moreLabel="더보기"
              moreHref="/formats"
            />
            <Box sx={cardRowSx}>
              {types.map(type => (
                <TypeCard
                  key={type.id}
                  href={`/generate?format=${type.id}`}
                  title={type.title}
                  description={type.description}
                  icon={type.icon}
                />
              ))}
            </Box>
          </Box>

          <Box component="section" sx={sectionSx}>
            <SectionHeading title="게임" />
            <Box sx={cardRowSx}>
              {games.map(game => (
                <GameCard
                  key={game.id}
                  href={game.href}
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
