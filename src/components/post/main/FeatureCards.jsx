// [주요 기능 선택 영역] (AI 콘텐츠 생성 카드, 커뮤니티 카드)
"use client";

import React from "react";
import Link from "next/link";
import { AutoAwesomeIcon, ChatBubbleOutlineOutlined } from "@/images/icons";

export default function FeatureSelection() {
  return (
    <section className="feature-container">
      <div className="feature-header">
        <h2 className="feature-title">주요 기능 선택</h2>

        <p className="feature-subtitle">
          원하시는 작업을 선택하여 쉽고 빠르게 시작해 보세요.
        </p>
      </div>

      <div className="feature-cardGrid">
        {/* 1. AI 콘텐츠 생성 카드 */}
        <Link
          href="/post/write"
          className={`${"feature-card"} ${"feature-aiCard"}`}
        >
          <div className="feature-cardHeader">
            <div className="feature-iconBox">
              <AutoAwesomeIcon aria-hidden="true" />
            </div>

            <span className="feature-badge">초스피드 작성</span>
          </div>

          <div className="feature-cardBody">
            <h3 className="feature-cardTitle">AI 콘텐츠 생성</h3>

            <p className="feature-cardDesc">
              간단한 키워드 입력만으로 AI가 글 초안과 태그를 자동으로 완성해
              드립니다.
            </p>
          </div>

          <div className="feature-cardAction">
            <span>바로 생성하기</span>

            <span className="feature-arrow">→</span>
          </div>
        </Link>

        {/* 2. 커뮤니티 카드 */}
        <Link
          href="/post/list"
          className={`${"feature-card"} ${"feature-communityCard"}`}
        >
          <div className="feature-cardHeader">
            <div className="feature-iconBox">
              <ChatBubbleOutlineOutlined aria-hidden="true" />
            </div>

            <span className="feature-badge">실시간 소통</span>
          </div>

          <div className="feature-cardBody">
            <h3 className="feature-cardTitle">커뮤니티</h3>

            <p className="feature-cardDesc">
              다양한 주제로 사용자들과 이야기를 나누고 따뜻한 소통을 이어가
              보세요.
            </p>
          </div>

          <div className="feature-cardAction">
            <span>게시판 바로가기</span>

            <span className="feature-arrow">→</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
