"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// 스타일 가이드
import { layout } from "@/lib/layout";
import Button from "@/components/ui/Button";

// MUI Core Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
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

// MUI Icons
import FavoriteIcon from "@mui/icons-material/Favorite";
import GroupsIcon from "@mui/icons-material/Groups";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SchoolIcon from "@mui/icons-material/School";
import EditNoteIcon from "@mui/icons-material/EditNote";
import BoltIcon from "@mui/icons-material/Bolt";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

// 템플릿 카드 데이터 (색상은 theme의 semantic 색상 키를 그대로 참조)
const TEMPLATES = [
  {
    id: "dating",
    title: "소개팅",
    desc: "설레는 첫 만남, 어색함을 깨줄 센스 있는 질문 리스트",
    icon: FavoriteIcon,
    iconColor: "primary.main",
    defaultAtmosphere: "설렘",
  },
  {
    id: "mt",
    title: "MT (엠티)",
    desc: "다함께 즐기는 단체 분위기를 위한 고텐션 대화 주제",
    icon: GroupsIcon,
    iconColor: "secondary.main",
    defaultAtmosphere: "유쾌함",
  },
  {
    id: "dinner",
    title: "회식",
    desc: "상사, 동료와 자연스럽게 어울릴 수 있는 사회생활 팁",
    icon: RestaurantIcon,
    iconColor: "warning.main",
    defaultAtmosphere: "격식있음",
  },
  {
    id: "ot",
    title: "대학교 신입 OT",
    desc: "새로운 친구들과 빠르게 친해지는 마법 같은 첫 마디",
    icon: SchoolIcon,
    iconColor: "success.main",
    defaultAtmosphere: "친근함",
  },
];

// 형식 옵션 데이터
const FORMAT_OPTIONS = [
  { code: "question", label: "질문" },
  { code: "balance", label: "밸런스" },
  { code: "topic", label: "대화주제" },
  { code: "mission", label: "미션" },
  { code: "humor", label: "유머" },
  { code: "quiz", label: "퀴즈" },
];

// 직접 입력 옵션 데이터
const OPTIONS = {
  atmosphere: ["유쾌함", "진지함", "부드러움", "논리적임", "따뜻함"],
  relation: ["초면/어색한 사이", "친한 사이", "직장 동료", "선후배"],
  age: ["10대", "20대", "30대", "40대 이상"],
};

export default function GeneratePage() {
  const router = useRouter();
  const theme = useTheme();

  // 입력 폼 상태
  const [situation, setSituation] = useState("");
  const [selectedAtmosphere, setSelectedAtmosphere] = useState("");
  const [selectedRelation, setSelectedRelation] = useState("");
  const [selectedAge, setSelectedAge] = useState("");

  // 탭 상태 (0: 분위기, 1: 관계, 2: 나이)
  const [tabValue, setTabValue] = useState(0);

  // 모달 상태 및 형식 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("");

  const handleCardClick = template => {
    setActiveTemplate(template);
    setSelectedFormat("");
    setIsModalOpen(true);
  };

  const handleSelectFormat = formatCode => setSelectedFormat(formatCode);

  const handleSendTemplate = () => {
    if (!selectedFormat) {
      alert("형식을 선택해주세요.");
      return;
    }
    const queryParams = new URLSearchParams({
      situation: `${activeTemplate.title} 상황에서의 대화`,
      atmosphere: activeTemplate.defaultAtmosphere || "",
      format: selectedFormat,
    }).toString();

    setIsModalOpen(false);
    router.push(`/generate/loading?${queryParams}`);
  };

  const removeTag = type => {
    if (type === "atmosphere") setSelectedAtmosphere("");
    if (type === "relation") setSelectedRelation("");
    if (type === "age") setSelectedAge("");
  };

  const handleGenerate = () => {
    if (!situation.trim()) {
      alert("상황을 입력해주세요.");
      return;
    }
    const queryParams = new URLSearchParams({
      situation,
      atmosphere: selectedAtmosphere,
      relation: selectedRelation,
      age: selectedAge,
    }).toString();

    router.push(`/generate/loading?${queryParams}`);
  };

  return (
    <>
      <Header />
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 8, px: 2 }}>
        {/* layout.js 기준 max-width / gutter 적용 */}
        <Box sx={{ maxWidth: layout.maxWidth, mx: "auto", px: { xs: 2, md: `${layout.gutter}px` } }}>
          {/* 헤더 영역 */}
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
              const IconComp = tpl.icon;
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
                          // theme에 아이콘 전용 배경 토큰이 없어 semantic 색상을 alpha 처리해서 사용
                          bgcolor: alpha(theme.palette[tpl.iconColor.split(".")[0]].main, 0.12),
                          color: tpl.iconColor,
                          borderRadius: 2.5,
                          mb: 2,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <IconComp />
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
              <EditNoteIcon />
              <Typography variant="h4" color="primary.main">
                직접 입력하여 생성하기
              </Typography>
            </Box>

            {/* 1. 상황 입력 */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" fontWeight={600} color="text.primary" mb={1} component="div">
                어떤 상황인가요?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="예: 오랜만에 만난 초등학교 친구와 카페에서 어색하지 않게 대화하고 싶어요."
                value={situation}
                onChange={e => setSituation(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    backgroundColor: "grey.50",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
            </Box>

            {/* 2. 탭 선택 */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2.5 }}>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} textColor="primary" indicatorColor="primary">
                <Tab label="원하는 대화 분위기" sx={{ fontWeight: 600 }} />
                <Tab label="관계" sx={{ fontWeight: 600 }} />
                <Tab label="나이" sx={{ fontWeight: 600 }} />
              </Tabs>
            </Box>

            {/* 3. 옵션 선택 버튼 */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
              {tabValue === 0 &&
                OPTIONS.atmosphere.map(item => (
                  <Chip
                    key={item}
                    label={item}
                    onClick={() => setSelectedAtmosphere(item)}
                    variant={selectedAtmosphere === item ? "filled" : "outlined"}
                    color={selectedAtmosphere === item ? "primary" : "default"}
                    sx={{ borderRadius: 5, px: 1, py: 2 }}
                  />
                ))}
              {tabValue === 1 &&
                OPTIONS.relation.map(item => (
                  <Chip
                    key={item}
                    label={item}
                    onClick={() => setSelectedRelation(item)}
                    variant={selectedRelation === item ? "filled" : "outlined"}
                    color={selectedRelation === item ? "primary" : "default"}
                    sx={{ borderRadius: 5, px: 1, py: 2 }}
                  />
                ))}
              {tabValue === 2 &&
                OPTIONS.age.map(item => (
                  <Chip
                    key={item}
                    label={item}
                    onClick={() => setSelectedAge(item)}
                    variant={selectedAge === item ? "filled" : "outlined"}
                    color={selectedAge === item ? "primary" : "default"}
                    sx={{ borderRadius: 5, px: 1, py: 2 }}
                  />
                ))}
            </Box>

            {/* 4. 선택된 태그 디스플레이 영역 */}
            {(selectedAtmosphere || selectedRelation || selectedAge) && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {selectedAtmosphere && (
                  <Chip
                    label={selectedAtmosphere}
                    onDelete={() => removeTag("atmosphere")}
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: 5, bgcolor: theme.palette.momentalk.presetCard, fontWeight: 600 }}
                  />
                )}
                {selectedRelation && (
                  <Chip
                    label={selectedRelation}
                    onDelete={() => removeTag("relation")}
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: 5, bgcolor: theme.palette.momentalk.presetCard, fontWeight: 600 }}
                  />
                )}
                {selectedAge && (
                  <Chip
                    label={selectedAge}
                    onDelete={() => removeTag("age")}
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: 5, bgcolor: theme.palette.momentalk.presetCard, fontWeight: 600 }}
                  />
                )}
              </Box>
            )}

            {/* 5. 안내 메시지 박스 */}
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
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <Typography variant="body2" color="text.primary">
                AI가 당신의 상황을 분석하여 최적의 대화 가이드를 구성할 준비를 마쳤습니다.
              </Typography>
            </Paper>

            {/* 6. 생성 버튼 (스타일 가이드 Button 컴포넌트) */}
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handleGenerate}
              trailingIcon={<BoltIcon />}
              sx={{ fontSize: "1rem" }}
            >
              AI 대화 생성하기
            </Button>
          </Paper>

          {/* 템플릿 클릭 시 형식 선택 모달 */}
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
                  <CloseIcon />
                </IconButton>
              </Box>

              <Typography variant="body2" color="text.secondary" display="block" mb={2.5}>
                원하시는 대화 형식을 선택해 주세요.
              </Typography>

              <List disablePadding sx={{ mb: 3 }}>
                {FORMAT_OPTIONS.map(item => {
                  const isSelected = selectedFormat === item.code;
                  return (
                    <ListItem key={item.code} disablePadding sx={{ mb: 1 }}>
                      <ListItemButton
                        onClick={() => handleSelectFormat(item.code)}
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
                        {isSelected && <CheckIcon fontSize="small" color="primary" />}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>

              {/* 하단 버튼 (이전 / 전송) — 스타일 가이드 Button 컴포넌트 */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  variant="tertiary"
                  size="md"
                  fullWidth
                  onClick={() => setIsModalOpen(false)}
                  sx={{ height: 48, fontSize: "0.95rem" }}
                >
                  이전
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleSendTemplate}
                  disabled={!selectedFormat}
                  sx={{ height: 48, fontSize: "0.95rem" }}
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
