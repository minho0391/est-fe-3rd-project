"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// 스타일 가이드
import { layout } from "@/lib/layout";
import Button from "@/components/ui/Button";
import { fetchOptions } from "@/lib/generateOptions";

// MUI Core Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Avatar from "@mui/material/Avatar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useTheme, alpha } from "@mui/material/styles";
import { TextField } from "@mui/material";

import { styles } from "./_components/styles";

// 템플릿 카드 — id는 presets 테이블의 preset_code와 일치해야 합니다.
const TEMPLATES = [
  {
    id: "blind_date",
    title: "소개팅",
    desc: "설레는 첫 만남, 어색함을 깨줄 센스 있는 질문 리스트",
    icon: "/assets/icons/favorite_icon.svg",
    iconColor: "primary.main",
  },
  {
    id: "mt",
    title: "MT (엠티)",
    desc: "다함께 즐기는 단체 분위기를 위한 고텐션 대화 주제",
    icon: "/assets/icons/group_icon.svg",
    iconColor: "secondary.main",
  },
  {
    id: "dinner",
    title: "회식",
    desc: "상사, 동료와 자연스럽게 어울릴 수 있는 사회생활 팁",
    icon: "/assets/icons/restaurant_icon.svg",
    iconColor: "warning.main",
  },
  {
    id: "ot",
    title: "대학교 신입 OT",
    desc: "새로운 친구들과 빠르게 친해지는 마법 같은 첫 마디",
    icon: "/assets/icons/school_icon.svg",
    iconColor: "success.main",
  },
];

// 대화 깊이 레벨
const LEVEL_OPTIONS = [
  { value: 1, label: "Lv.1 가볍게" },
  { value: 2, label: "Lv.2 적당히" },
  { value: 3, label: "Lv.3 깊게" },
];

// 탭 순서: 0 분위기, 1 관계, 2 대상
const TABS = [
  { key: "mood", label: "원하는 대화 분위기" },
  { key: "relation", label: "관계" },
  { key: "target", label: "대화 상대" },
];

const EMPTY_OPTIONS = { situation: [], relation: [], target: [], mood: [], format: [] };

function GeneratePageInner() {
  const router = useRouter();
  const theme = useTheme();
  const searchParams = useSearchParams();

  // DB에서 불러온 선택지 (situation / relation / target / mood / format)
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // 직접 입력 폼 상태 — 값은 DB 코드(code) 또는 사용자 자유 작성 텍스트입니다.
  const [selectedSituation, setSelectedSituation] = useState("");
  const [customInput, setCustomInput] = useState(""); // 추가: 자유 입력 상태
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedRelation, setSelectedRelation] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [level, setLevel] = useState(1);

  // 탭 상태 (0: 분위기, 1: 관계, 2: 대상)
  const [tabValue, setTabValue] = useState(0);

  // 모달 상태 및 형식/레벨 상태 (템플릿 카드 흐름)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [modalFormat, setModalFormat] = useState("");
  const [modalLevel, setModalLevel] = useState(1);

  // 옵션 데이터 로드
  useEffect(() => {
    let cancelled = false;
    fetchOptions()
      .then(grouped => {
        if (!cancelled) setOptions(grouped);
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 뒤로가기 또는 이전 생성 조건 복원 로직
  useEffect(() => {
    const rawPayload =
      sessionStorage.getItem("generate-payload") || sessionStorage.getItem("generate-last-payload");

    if (rawPayload) {
      try {
        const payload = JSON.parse(rawPayload);
        if (payload.format_code) setSelectedFormat(payload.format_code);
        if (payload.level) setLevel(payload.level);

        if (payload.conditions) {
          if (payload.conditions.situation) setSelectedSituation(payload.conditions.situation);
          if (payload.conditions.custom_input) setCustomInput(payload.conditions.custom_input); // 복원 추가
          if (payload.conditions.mood) setSelectedMood(payload.conditions.mood);
          if (payload.conditions.relation) setSelectedRelation(payload.conditions.relation);
          if (payload.conditions.target) setSelectedTarget(payload.conditions.target);
        }
      } catch (err) {
        console.error("저장된 폼 조건을 읽어오는 중 에러 발생:", err);
      }
    }
  }, []);

  const goToLoading = payload => {
    sessionStorage.setItem("generate-payload", JSON.stringify(payload));
    router.push("/generate/loading");
  };

  const handleCardClick = template => {
    setActiveTemplate(template);
    setModalFormat("");
    setModalLevel(1);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const preset = searchParams.get("preset");
    const format = searchParams.get("format");

    if (preset) {
      // 상황 칩도 함께 선택해 둡니다.
      // 모달을 닫아도 조건이 남아 있어야 이어서 고를 수 있습니다.
      setSelectedSituation(preset);

      const template = TEMPLATES.find(item => item.id === preset);
      if (template) handleCardClick(template);
    }

    if (format) setSelectedFormat(format);
  }, [searchParams]);

  const handleSendTemplate = () => {
    if (!modalFormat) {
      alert("형식을 선택해주세요.");
      return;
    }
    setIsModalOpen(false);
    goToLoading({
      preset_code: activeTemplate.id,
      format_code: modalFormat,
      level: modalLevel,
    });
  };

  const removeTag = type => {
    if (type === "mood") setSelectedMood("");
    if (type === "relation") setSelectedRelation("");
    if (type === "target") setSelectedTarget("");
  };

  const tabState = {
    mood: [selectedMood, setSelectedMood],
    relation: [selectedRelation, setSelectedRelation],
    target: [selectedTarget, setSelectedTarget],
  };

  // 현재 탭(분위기/관계/대상)에 해당하는 선택값/옵션을 계산
  const currentTabKey = TABS[tabValue].key;
  const [currentTabValue, setCurrentTabValue] = tabState[currentTabKey];
  const currentTabOptions = options[currentTabKey];

  const labelOf = (category, code) => options[category]?.find(o => o.code === code)?.label ?? code;

  const canGenerate = Boolean((selectedSituation || customInput.trim()) && selectedFormat);

  const handleGenerate = () => {
    const trimmedCustom = customInput.trim();

    // 1. 둘 다 있을 경우: "[선택상황] (상세 내용)" 형태로 통합
    // 2. 하나만 있을 경우: 해당 값 채택
    let finalSituation = "";
    if (selectedSituation && trimmedCustom) {
      const situationLabel = labelOf("situation", selectedSituation) || selectedSituation;
      finalSituation = `${situationLabel} (${trimmedCustom})`;
    } else {
      finalSituation = selectedSituation || trimmedCustom;
    }

    goToLoading({
      format_code: selectedFormat,
      level,
      conditions: {
        situation: finalSituation, // 통합된 situation 값 전달
        custom_input: trimmedCustom || undefined, // 원본 입력값 보존
        mood: selectedMood || undefined,
        relation: selectedRelation || undefined,
        target: selectedTarget || undefined,
      },
    });
  };
  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{ bgcolor: "background.default", minHeight: "100vh", py: 8, px: 2 }}
      >
        <Box
          sx={{ maxWidth: layout.maxWidth, mx: "auto", px: { xs: 2, md: `${layout.gutter}px` } }}
        >
          <Box sx={styles.page}>
            <Typography variant="h2" component="h1" color="text.primary" mb={1.5}>
              어떤 대화가 필요하신가요?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              상황에 맞는 템플릿을 선택하거나 직접 입력하여 AI와 함께 대화를 준비해 보세요.
            </Typography>
          </Box>

          {/* 템플릿 카드 그리드 */}
          <Box sx={styles.templateGrid}>
            {TEMPLATES.map(tpl => (
              <Box key={tpl.id} sx={styles.templateCardWrap}>
                <Card elevation={0} sx={styles.templateCard}>
                  <CardActionArea
                    onClick={() => handleCardClick(tpl)}
                    sx={styles.templateCardAction}
                  >
                    <Avatar
                      sx={{
                        ...styles.templateIcon,
                        bgcolor: alpha(theme.palette[tpl.iconColor.split(".")[0]].main, 0.12),
                        color: tpl.iconColor,
                      }}
                    >
                      <Box component="img" src={tpl.icon} alt="" sx={styles.icon24} />
                    </Avatar>
                    <Typography variant="h5" component="h2" mb={1}>
                      {tpl.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ wordBreak: "keep-all" }}
                    >
                      {tpl.desc}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Box>
            ))}
          </Box>

          {/* 직접 입력 Form 섹션 */}
          <Paper elevation={0} sx={styles.formPaper}>
            <Box sx={styles.formHeader}>
              <Box
                component="img"
                src="/assets/icons/editnote_icon.svg"
                alt=""
                sx={styles.icon24}
              />
              <Typography variant="h4" component="h2" color="primary.main">
                직접 입력하여 생성하기
              </Typography>
            </Box>

            {/* 1. 상황 선택 (필수) */}
            <Box sx={styles.fieldGroup}>
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.primary"
                mb={1}
                component="div"
              >
                어떤 상황인가요?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="예: 오랜만에 만난 초등학교 친구와 카페에서 어색하지 않게 대화하고 싶어요."
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                sx={styles.textField}
              />
              <Box sx={styles.chipRow}>
                {options.situation.map(item => {
                  const isSelected = selectedSituation === item.code;
                  return (
                    <Chip
                      key={item.code}
                      label={item.label}
                      onClick={() =>
                        setSelectedSituation(prev => (prev === item.code ? "" : item.code))
                      }
                      variant={isSelected ? "filled" : "outlined"}
                      color={isSelected ? "primary" : "default"}
                      sx={styles.chip}
                    />
                  );
                })}
                {!optionsLoading && options.situation.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    선택지를 불러오지 못했습니다.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* 2. 형식 선택 (필수) */}
            <Box sx={styles.fieldGroup}>
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.primary"
                mb={1}
                component="div"
              >
                어떤 형식으로 만들까요?
              </Typography>
              <Box sx={styles.chipRow}>
                {options.format.map(item => (
                  <Chip
                    key={item.code}
                    label={item.label}
                    onClick={() => setSelectedFormat(item.code)}
                    variant={selectedFormat === item.code ? "filled" : "outlined"}
                    color={selectedFormat === item.code ? "primary" : "default"}
                    sx={styles.chip}
                  />
                ))}
              </Box>
            </Box>

            {/* 3. 탭 선택 (선택사항: 분위기 / 관계 / 대상) */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2.5 }}>
              <Tabs
                value={tabValue}
                onChange={(_, v) => setTabValue(v)}
                textColor="primary"
                indicatorColor="primary"
              >
                {TABS.map(t => (
                  <Tab key={t.key} label={t.label} sx={{ fontWeight: 600 }} />
                ))}
              </Tabs>
            </Box>

            {/* 4. 옵션 선택 버튼 */}
            <Box sx={{ ...styles.chipRow, mb: 2.5 }}>
              {currentTabOptions.map(item => (
                <Chip
                  key={item.code}
                  label={item.label}
                  onClick={() => setCurrentTabValue(item.code)}
                  variant={currentTabValue === item.code ? "filled" : "outlined"}
                  color={currentTabValue === item.code ? "primary" : "default"}
                  sx={styles.chip}
                />
              ))}
            </Box>

            {/* 5. 선택된 태그 디스플레이 영역 */}
            {(selectedMood || selectedRelation || selectedTarget) && (
              <Box sx={{ ...styles.chipRow, mb: 3 }}>
                {selectedMood && (
                  <Chip
                    label={labelOf("mood", selectedMood)}
                    onDelete={() => removeTag("mood")}
                    color="primary"
                    variant="outlined"
                    sx={{ ...styles.selectedTag, bgcolor: theme.palette.momentalk.presetCard }}
                  />
                )}
                {selectedRelation && (
                  <Chip
                    label={labelOf("relation", selectedRelation)}
                    onDelete={() => removeTag("relation")}
                    color="primary"
                    variant="outlined"
                    sx={{ ...styles.selectedTag, bgcolor: theme.palette.momentalk.presetCard }}
                  />
                )}
                {selectedTarget && (
                  <Chip
                    label={labelOf("target", selectedTarget)}
                    onDelete={() => removeTag("target")}
                    color="primary"
                    variant="outlined"
                    sx={{ ...styles.selectedTag, bgcolor: theme.palette.momentalk.presetCard }}
                  />
                )}
              </Box>
            )}
            {/* 6. 레벨(대화 깊이) 선택 */}
            <Box sx={styles.fieldGroup}>
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.primary"
                mb={1}
                component="div"
              >
                대화 깊이
              </Typography>
              <Box sx={styles.chipRow}>
                {LEVEL_OPTIONS.map(lv => (
                  <Chip
                    key={lv.value}
                    label={lv.label}
                    onClick={() => setLevel(lv.value)}
                    variant={level === lv.value ? "filled" : "outlined"}
                    color={level === lv.value ? "primary" : "default"}
                    sx={styles.chip}
                  />
                ))}
              </Box>
            </Box>

            {/* 7. 안내 메시지 박스 */}
            <Paper
              elevation={0}
              sx={{ ...styles.infoBox, bgcolor: theme.palette.momentalk.typeCard }}
            >
              <Avatar sx={styles.infoAvatar}>
                <Box
                  component="img"
                  src="/assets/icons/smarttoy_icon.svg"
                  alt=""
                  sx={styles.icon24}
                />
              </Avatar>
              <Typography variant="body2" color="text.primary">
                AI가 당신의 상황을 분석하여 최적의 대화 가이드를 구성할 준비를 마쳤습니다.
              </Typography>
            </Paper>

            {/* 8. 생성 버튼 */}
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handleGenerate}
              disabled={!canGenerate}
              trailingIcon={
                <Box component="img" src="/assets/icons/bolt_icon.svg" alt="" sx={styles.icon24} />
              }
              sx={{ fontSize: "1rem" }}
            >
              AI 대화 생성하기
            </Button>
            {!canGenerate && (
              <Typography variant="caption" sx={{ mt: 1, display: "block", textAlign: "center" }}>
                상황을 선택하거나 직접 입력하고, 형식을 선택해주세요.
              </Typography>
            )}
          </Paper>

          {/* 템플릿 클릭 시 형식/레벨 선택 모달 */}
          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Box sx={{ ...styles.modalBox, borderColor: theme.palette.momentalk.modalBorder }}>
              {/* 헤더: 항상 고정 노출 */}
              <Box sx={styles.modalHeader}>
                <Typography variant="h5" component="h2">
                  [{activeTemplate?.title}] 형식 선택
                </Typography>
                <IconButton size="small" aria-label="닫기" onClick={() => setIsModalOpen(false)}>
                  <Box
                    component="img"
                    src="/assets/icons/close_icon.svg"
                    alt=""
                    sx={styles.icon24}
                  />
                </IconButton>
              </Box>

              {/* 본문: 내용이 길어지면 이 영역만 스크롤 */}
              <Box sx={styles.modalBody}>
                <Typography variant="body2" color="text.secondary" display="block" mb={2.5}>
                  원하시는 대화 형식을 선택해 주세요.
                </Typography>

                <List disablePadding sx={{ mb: 2.5 }}>
                  {options.format.map(item => {
                    const isSelected = modalFormat === item.code;
                    return (
                      <ListItem key={item.code} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                          onClick={() => setModalFormat(item.code)}
                          sx={{
                            ...styles.modalListItem,
                            borderColor: isSelected ? "primary.main" : "divider",
                            bgcolor: isSelected
                              ? theme.palette.momentalk.presetCard
                              : "transparent",
                            "&:hover": {
                              borderColor: "primary.main",
                              bgcolor: isSelected ? theme.palette.momentalk.presetCard : "grey.50",
                            },
                          }}
                        >
                          <ListItemText
                            primary={item.label}
                            slotProps={{
                              primary: {
                                fontSize: "0.95rem",
                                fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? "primary.main" : "text.primary",
                              },
                            }}
                          />
                          {isSelected && (
                            <Box
                              component="img"
                              src="/assets/icons/check_icon.svg"
                              alt=""
                              sx={styles.icon24}
                            />
                          )}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>

                {/* 레벨 선택 */}
                <Typography variant="body2" fontWeight={600} color="text.primary" mb={1}>
                  대화 깊이
                </Typography>
                <Box sx={{ ...styles.chipRow, mb: 1 }}>
                  {LEVEL_OPTIONS.map(lv => (
                    <Chip
                      key={lv.value}
                      label={lv.label}
                      onClick={() => setModalLevel(lv.value)}
                      variant={modalLevel === lv.value ? "filled" : "outlined"}
                      color={modalLevel === lv.value ? "primary" : "default"}
                      sx={styles.chip}
                    />
                  ))}
                </Box>
              </Box>

              {/* 하단 버튼 (이전 / 전송): 항상 고정 노출 */}
              <Box sx={styles.modalActions}>
                <Button
                  variant="tertiary"
                  size="modal"
                  fullWidth
                  onClick={() => setIsModalOpen(false)}
                >
                  이전
                </Button>
                <Button
                  variant="primary"
                  size="modal"
                  fullWidth
                  onClick={handleSendTemplate}
                  disabled={!modalFormat}
                >
                  전송
                </Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      </Box>
      <Footer />
    </>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={null}>
      <GeneratePageInner />
    </Suspense>
  );
}
