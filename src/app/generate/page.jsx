// 사이트 주소 : http://localhost:3000/generate

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// 스타일 가이드
import { layout } from "@/lib/layout";
import Button from "@/components/ui/Button";
import { fetchOptions } from "@/lib/generateOptions";

// MUI Core Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
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

// 탭 순서: 0 분위기, 1 관계, 2 대상 (DB에 없는 '나이' 축은 제거)
const TABS = [
  { key: "mood", label: "원하는 대화 분위기" },
  { key: "relation", label: "관계" },
  { key: "target", label: "대화 상대" },
];

const EMPTY_OPTIONS = { situation: [], relation: [], target: [], mood: [], format: [] };

export default function GeneratePage() {
  const router = useRouter();
  const theme = useTheme();

  // DB에서 불러온 선택지 (situation / relation / target / mood / format)
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // 직접 입력 폼 상태 — 값은 전부 DB 코드(code)를 저장합니다.
  const [selectedSituation, setSelectedSituation] = useState("");
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

  const handleGenerate = () => {
    if (!selectedSituation) {
      alert("상황을 선택해주세요.");
      return;
    }
    if (!selectedFormat) {
      alert("형식을 선택해주세요.");
      return;
    }
    goToLoading({
      format_code: selectedFormat,
      level,
      conditions: {
        situation: selectedSituation,
        mood: selectedMood || undefined,
        relation: selectedRelation || undefined,
        target: selectedTarget || undefined,
      },
    });
  };

  const labelOf = (category, code) => options[category]?.find(o => o.code === code)?.label ?? "";

  return (
    <>
      <Header />
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 8, px: 2 }}>
        <Box sx={{ maxWidth: layout.maxWidth, mx: "auto", px: { xs: 2, md: `${layout.gutter}px` } }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h2" color="text.primary" mb={1.5}>
              어떤 대화가 필요하신가요?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              상황에 맞는 템플릿을 선택하거나 직접 입력하여 AI와 함께 대화를 준비해 보세요.
            </Typography>
          </Box>

          {/* 템플릿 카드 그리드 */}
          <Grid container spacing={3} sx={{ mb: 6, justifyContent: "center", alignItems: "stretch" }}>
            {TEMPLATES.map(tpl => {
              return (
                <Box
                  key={tpl.id}
                  sx={{
                    width: { lg: "calc(25% - 72px)", sm: "calc(50% - 72px)", xs: "calc(100% - 72px)" },
                    m: 1.5,
                  }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                        transform: "translateY(-3px)",
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleCardClick(tpl)}
                      sx={{
                        height: "100%",
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette[tpl.iconColor.split(".")[0]].main, 0.12),
                          color: tpl.iconColor,
                          borderRadius: 2.5,
                          mb: 2,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Box component="img" src={tpl.icon} alt="" sx={{ width: 24, height: 24 }} />
                      </Avatar>
                      <Typography variant="h5" mb={1}>
                        {tpl.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "keep-all" }}>
                        {tpl.desc}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Box>
              );
            })}
          </Grid>

          {/* 직접 입력 Form 섹션 */}
          <Paper
            elevation={0}
            sx={{
              maxWidth: 800,
              mx: "auto",
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main", mb: 3 }}>
              <Box component="img" src="/assets/icons/editnote_icon.svg" alt="" sx={{ width: 24, height: 24 }} />
              <Typography variant="h4" color="primary.main">
                직접 입력하여 생성하기
              </Typography>
            </Box>

            {/* 1. 상황 선택 (필수) */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} color="text.primary" mb={1} component="div">
                어떤 상황인가요?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="예: 오랜만에 만난 초등학교 친구와 카페에서 어색하지 않게 대화하고 싶어요."
                // value={situation}
                // onChange={e => setSituation(e.target.value)}
                sx={{
                  mt: 3,
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    backgroundColor: "grey.50",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {options.situation.map(item => (
                  <Chip
                    key={item.code}
                    label={item.label}
                    onClick={() => setSelectedSituation(item.code)}
                    variant={selectedSituation === item.code ? "filled" : "outlined"}
                    color={selectedSituation === item.code ? "primary" : "default"}
                    sx={{ borderRadius: 5, px: 1, py: 2 }}
                  />
                ))}
                {!optionsLoading && options.situation.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    선택지를 불러오지 못했습니다.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* 2. 형식 선택 (필수) */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} color="text.primary" mb={1} component="div">
                어떤 형식으로 만들까요?
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {options.format.map(item => (
                  <Chip
                    key={item.code}
                    label={item.label}
                    onClick={() => setSelectedFormat(item.code)}
                    variant={selectedFormat === item.code ? "filled" : "outlined"}
                    color={selectedFormat === item.code ? "primary" : "default"}
                    sx={{ mt: 1, borderRadius: 5, px: 1, py: 2 }}
                  />
                ))}
              </Box>
            </Box>

            {/* 3. 탭 선택 (선택사항: 분위기 / 관계 / 대상) */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2.5 }}>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} textColor="primary" indicatorColor="primary">
                {TABS.map(t => (
                  <Tab key={t.key} label={t.label} sx={{ fontWeight: 600 }} />
                ))}
              </Tabs>
            </Box>

            {/* 4. 옵션 선택 버튼 */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
              {(() => {
                const key = TABS[tabValue].key;
                const [value, setValue] = tabState[key];
                return options[key].map(item => (
                  <Chip
                    key={item.code}
                    label={item.label}
                    onClick={() => setValue(item.code)}
                    variant={value === item.code ? "filled" : "outlined"}
                    color={value === item.code ? "primary" : "default"}
                    sx={{ borderRadius: 5, px: 1, py: 2 }}
                  />
                ));
              })()}
            </Box>

            {/* 5. 선택된 태그 디스플레이 영역 */}
            {(selectedMood || selectedRelation || selectedTarget) && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {selectedMood && (
                  <Chip
                    label={labelOf("mood", selectedMood)}
                    onDelete={() => removeTag("mood")}
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: 5, bgcolor: theme.palette.momentalk.presetCard, fontWeight: 600 }}
                  />
                )}
                {selectedRelation && (
                  <Chip
                    label={labelOf("relation", selectedRelation)}
                    onDelete={() => removeTag("relation")}
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: 5, bgcolor: theme.palette.momentalk.presetCard, fontWeight: 600 }}
                  />
                )}
                {selectedTarget && (
                  <Chip
                    label={labelOf("target", selectedTarget)}
                    onDelete={() => removeTag("target")}
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: 5, bgcolor: theme.palette.momentalk.presetCard, fontWeight: 600 }}
                  />
                )}
              </Box>
            )}

            {/* 6. 레벨(대화 깊이) 선택 */}
            <Box sx={{ mb: 3.5 }}>
              <Typography variant="body2" fontWeight={600} color="text.primary" mb={1} component="div">
                대화 깊이
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {LEVEL_OPTIONS.map(lv => (
                  <Chip
                    key={lv.value}
                    label={lv.label}
                    onClick={() => setLevel(lv.value)}
                    variant={level === lv.value ? "filled" : "outlined"}
                    color={level === lv.value ? "primary" : "default"}
                    sx={{ borderRadius: 5, px: 1, py: 2 }}
                  />
                ))}
              </Box>
            </Box>

            {/* 7. 안내 메시지 박스 */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3.5,
                borderRadius: 3,
                bgcolor: theme.palette.momentalk.typeCard,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar sx={{ bgcolor: "background.paper", color: "primary.main", width: 40, height: 40 }}>
                <Box component="img" src="/assets/icons/smarttoy_icon.svg" alt="" sx={{ width: 24, height: 24 }} />
              </Avatar>
              <Typography variant="body2" color="text.primary">
                AI가 당신의 상황을 분석하여 최적의 대화 가이드를 구성할 준비를 마쳤습니다.
              </Typography>
            </Paper>

            {/* 8. 생성 버튼 (스타일 가이드 Button 컴포넌트) */}
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handleGenerate}
              trailingIcon={
                <Box component="img" src="/assets/icons/bolt_icon.svg" alt="" sx={{ width: 24, height: 24 }} />
              }
              sx={{ fontSize: "1rem" }}
            >
              AI 대화 생성하기
            </Button>
          </Paper>

          {/* 템플릿 클릭 시 형식/레벨 선택 모달 */}
          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "90%", sm: 420 },
                bgcolor: "background.paper",
                borderRadius: 4,
                boxShadow: 24,
                p: 3.5,
                border: "1px solid",
                borderColor: theme.palette.momentalk.modalBorder,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h5">[{activeTemplate?.title}] 형식 선택</Typography>
                <IconButton size="small" onClick={() => setIsModalOpen(false)}>
                  <Box component="img" src="/assets/icons/close_icon.svg" alt="" sx={{ width: 24, height: 24 }} />
                </IconButton>
              </Box>

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
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: isSelected ? "primary.main" : "divider",
                          bgcolor: isSelected ? theme.palette.momentalk.presetCard : "transparent",
                          py: 1.5,
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
                            sx={{ width: 24, height: 24 }}
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
              <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                {LEVEL_OPTIONS.map(lv => (
                  <Chip
                    key={lv.value}
                    label={lv.label}
                    onClick={() => setModalLevel(lv.value)}
                    variant={modalLevel === lv.value ? "filled" : "outlined"}
                    color={modalLevel === lv.value ? "primary" : "default"}
                    sx={{ borderRadius: 5 }}
                  />
                ))}
              </Box>

              {/* 하단 버튼 (이전 / 전송) — 스타일 가이드 Button 컴포넌트 */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button variant="tertiary" size="modal" fullWidth onClick={() => setIsModalOpen(false)}>
                  이전
                </Button>
                <Button variant="primary" size="modal" fullWidth onClick={handleSendTemplate} disabled={!modalFormat}>
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
