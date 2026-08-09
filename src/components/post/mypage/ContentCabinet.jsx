// [콘텐츠 보관함 영역] (AI 생성 및 운영진 기본 콘텐츠 리스트)
"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import {
  AutoAwesomeIcon,
  CloseIcon,
  FolderOpenIcon,
  PushPinIcon,
  RefreshIcon,
} from "@/images/icons";

import { savedCommunityContents } from "@/data/communityPosts";

export default function ContentCabinet({ onSelectContent }) {
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
  const filteredContents = savedCommunityContents.filter(item => {
    if (filter === "AI") return item.type === "AI";

    if (filter === "ADMIN") return item.type === "ADMIN";

    return true;
  });

  return (
    <div className="cabinet-fetcherWrapper">
      {/* 트리거 버튼 그룹 */}
      <Button
        type="button"
        variant="secondary"
        size="md"
        className="cabinet-triggerButton"
        leadingIcon={<AutoAwesomeIcon aria-hidden="true" />}
        onClick={toggleDrawer}
      >
        AI 콘텐츠 생성하기
      </Button>

      <Button
        type="button"
        variant="tertiary"
        size="md"
        className="cabinet-triggerButton"
        leadingIcon={<RefreshIcon aria-hidden="true" />}
        onClick={toggleDrawer}
      >
        콘텐츠 보관함 불러오기
      </Button>

      {/* 콘텐츠 보관함 레이어/모달 */}
      {isOpen && (
        <div className="cabinet-modalOverlay" onClick={toggleDrawer}>
          <div
            className="cabinet-drawerCard"
            onClick={e => e.stopPropagation()}
          >
            <div className="cabinet-drawerHeader">
              <div>
                <h3 className="cabinet-drawerTitle">
                  <FolderOpenIcon aria-hidden="true" /> 콘텐츠 보관함
                </h3>

                <p className="cabinet-drawerSubtitle">
                  AI가 생성한 글과 운영진 제공 기본 템플릿을 선택하여
                  불러옵니다.
                </p>
              </div>

              <button
                type="button"
                className="cabinet-closeBtn"
                onClick={toggleDrawer}
                aria-label="콘텐츠 보관함 닫기"
              >
                <CloseIcon aria-hidden="true" />
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
                <AutoAwesomeIcon aria-hidden="true" fontSize="small" /> AI 생성
              </button>

              <button
                type="button"
                className={`${"cabinet-filterBtn"} ${filter === "ADMIN" ? "cabinet-activeFilter" : ""}`}
                onClick={() => setFilter("ADMIN")}
              >
                <PushPinIcon aria-hidden="true" fontSize="small" /> 운영진 기본
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

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => handleSelect(item)}
                    >
                      적용하기
                    </Button>
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
