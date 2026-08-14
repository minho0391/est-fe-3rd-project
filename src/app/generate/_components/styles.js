// /generate 화면 공용 sx 스타일
export const styles = {
  page: { textAlign: "center", mb: 6 },
  templateGrid: { display: "flex", flexWrap: "wrap", justifyContent: "center", mb: 6, mx: -1.5 },
  templateCardWrap: {
    width: { lg: "calc(25% - 24px)", sm: "calc(50% - 24px)", xs: "calc(100% - 24px)" },
    m: 1.5,
  },
  templateCard: {
    height: "100%",
    borderRadius: 3,
    bgcolor: "background.paper",
    border: "1px solid",
    borderColor: "divider",
    transition: "all 0.2s ease-in-out",
    "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.06)", transform: "translateY(-3px)" },
  },
  templateCardAction: {
    height: "100%",
    p: 3,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  templateIcon: { borderRadius: 2.5, mb: 2, width: 48, height: 48 },

  formPaper: {
    maxWidth: 800,
    mx: "auto",
    p: { xs: 3, sm: 5 },
    borderRadius: 4,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
  },
  formHeader: { display: "flex", alignItems: "center", gap: 1, color: "primary.main", mb: 3 },
  fieldGroup: { mb: 3 },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 1 },
  // 선택지 칩(상황/형식/분위기/관계/대상/레벨) 공용 — 선택 여부는 variant/color prop으로 표현
  chip: { borderRadius: 5, px: 1, py: 2 },
  // 선택된 값이 태그 형태로 표시될 때(분위기/관계/대상)
  selectedTag: { borderRadius: 5, fontWeight: 600 },
  textField: {
    mt: 3,
    mb: 3,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      backgroundColor: "grey.50",
      "& fieldset": { borderColor: "divider" },
      "&:hover fieldset": { borderColor: "primary.main" },
    },
  },
  infoBox: { p: 2.5, mb: 3.5, borderRadius: 3, display: "flex", alignItems: "center", gap: 2 },
  infoAvatar: { bgcolor: "background.paper", color: "primary.main", width: 40, height: 40 },
  icon24: { width: 24, height: 24 },
  icon16: { width: 16, height: 16 },

  // 템플릿 형식/레벨 선택 모달
  modalBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", sm: 420 },
    maxHeight: { xs: "85vh", sm: "90vh" },
    bgcolor: "background.paper",
    borderRadius: 4,
    boxShadow: 24,
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    // 내부에서 header/body/footer가 각자 패딩을 갖도록 여기서는 p를 두지 않음
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
    px: 3.5,
    pt: 3.5,
    pb: 1,
  },
  modalBody: {
    overflowY: "auto",
    px: 3.5,
    minHeight: 0, // flex item이 콘텐츠 크기만큼 커지지 않고 스크롤되도록 (result/styles.js와 통일)
  },
  modalListItem: { borderRadius: 2, border: "1px solid", py: 1.5 },
  modalActions: {
    display: "flex",
    gap: 1.5,
    flexShrink: 0,
    px: 3.5,
    pt: 2,
    pb: 3.5,
  },
};
