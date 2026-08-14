// 관리자 전용 화면이라 색인 대상이 아닙니다.
export const metadata = {
  title: "신고 관리",
  robots: { index: false, follow: false },
};

export default function AdminReportsLayout({ children }) {
  return children;
}
