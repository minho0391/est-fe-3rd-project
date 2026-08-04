// [콘텐츠 보관함 영역] (AI 생성 및 운영진 기본 콘텐츠 리스트)
"use client";

import React, { useState } from "react";

// 보관함에 저장된 콘텐츠 데이터 샘플 (AI 생성 & 운영진 기본 콘텐츠)
const SAVED_CONTENTS = [
  {
    id: 1,
    type: "AI",
    badge: "✨ AI 생성",
    title: "여름 휴가철 커뮤니티 에티켓 안내",
    content:
      "안녕하세요! 즐거운 여름 휴가철을 맞아 서로를 배려하는 커뮤니티 에티켓을 공유합니다...",
    tags: ["휴가", "에티켓", "공지"],
  },
  {
    id: 2,
    type: "AI",
    badge: "✨ AI 생성",
    title: "주간 개발 및 소통 초안",
    content:
      "이번 주 업데이트된 주요 기능과 커뮤니티 피드백 반영 사항을 정리해 드립니다...",
    tags: ["업데이트", "개발일지"],
  },
  {
    id: 3,
    type: "ADMIN",
    badge: "📌 운영진 기본",
    title: "자유게시판 기본 작성 템플릿",
    content:
      "1. 오늘 공유하고 싶은 내용:\n2. 추천하는 이유:\n3. 함께 나누고 싶은 질문:",
    tags: ["템플릿", "자유게시판"],
  },
  {
    id: 4,
    type: "ADMIN",
    badge: "📌 운영진 기본",
    title: "Q&A 질문 양식 템플릿",
    content: "[질문 유형]: \n[현재 상황]: \n[원하는 해결 방향]: ",
    tags: ["템플릿", "Q&A"],
  },
];

export default function ContentFetcher({ onSelectContent }) {
  const [isOpen, setIsOpen] = useState(false);

  const [filter, setFilter] = useState("ALL"); // ALL, AI, ADMIN

  // 보관함 팝업 열기/닫기
  const toggleDrawer = () => setIsOpen(prev => !prev);

  // 콘텐츠 선택 시 폼에 적용하고 모달 닫기
  const handleSelect = item => {
    if (onSelectContent) {
      onSelectContent(item);
    }

    setIsOpen(false);
  };

  // 필터링된 콘텐츠 리스트
  const filteredContents = SAVED_CONTENTS.filter(item => {
    if (filter === "AI") return item.type === "AI";

    if (filter === "ADMIN") return item.type === "ADMIN";

    return true;
  });

  return (
    <div className="cabinet-fetcherWrapper">
      {/* 트리거 버튼 그룹 */}
      <button
        type="button"
        className="cabinet-btnSecondary"
        onClick={toggleDrawer}
      >
        <span>✨</span> AI 콘텐츠 생성하기
      </button>

      <button
        type="button"
        className="cabinet-btnTertiary"
        onClick={toggleDrawer}
      >
        <span>🔄</span> 콘텐츠 보관함 불러오기
      </button>

      {/* 콘텐츠 보관함 레이어/모달 */}
      {isOpen && (
        <div className="cabinet-modalOverlay" onClick={toggleDrawer}>
          <div
            className="cabinet-drawerCard"
            onClick={e => e.stopPropagation()}
          >
            <div className="cabinet-drawerHeader">
              <div>
                <h3 className="cabinet-drawerTitle">📂 콘텐츠 보관함</h3>

                <p className="cabinet-drawerSubtitle">
                  AI가 생성한 글과 운영진 제공 기본 템플릿을 선택하여
                  불러옵니다.
                </p>
              </div>

              <button
                type="button"
                className="cabinet-closeBtn"
                onClick={toggleDrawer}
              >
                ✕
              </button>
            </div>

            {/* 필터 탭 (전체 / AI 생성 / 운영진 기본) */}
            <div className="cabinet-filterTabs">
              <button
                type="button"
                className={`${"cabinet-filterBtn"} ${filter === "ALL" ? "cabinet-activeFilter" : ""}`}
                onClick={() => setFilter("ALL")}
              >
                전체
              </button>

              <button
                type="button"
                className={`${"cabinet-filterBtn"} ${filter === "AI" ? "cabinet-activeFilter" : ""}`}
                onClick={() => setFilter("AI")}
              >
                ✨ AI 생성
              </button>

              <button
                type="button"
                className={`${"cabinet-filterBtn"} ${filter === "ADMIN" ? "cabinet-activeFilter" : ""}`}
                onClick={() => setFilter("ADMIN")}
              >
                📌 운영진 기본
              </button>
            </div>

            {/* 콘텐츠 리스트 영역 */}
            <div className="cabinet-contentList">
              {filteredContents.map(item => (
                <div key={item.id} className="cabinet-contentCard">
                  <div className="cabinet-cardTop">
                    <span
                      className={`${"cabinet-typeBadge"} ${
                        item.type === "AI"
                          ? "cabinet-aiBadge"
                          : "cabinet-adminBadge"
                      }`}
                    >
                      {item.badge}
                    </span>

                    <button
                      type="button"
                      className="cabinet-applyBtn"
                      onClick={() => handleSelect(item)}
                    >
                      적용하기
                    </button>
                  </div>

                  <h4 className="cabinet-itemTitle">{item.title}</h4>

                  <p className="cabinet-itemPreview">{item.content}</p>

                  <div className="cabinet-tagGroup">
                    {item.tags.map(tag => (
                      <span key={tag} className="cabinet-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
