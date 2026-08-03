// [상단 탭/필터] (최신순, 좋아요순, 조회수순 정렬 버튼)
"use client";

import React, { useState } from "react";

const SORT_OPTIONS = [
  { id: "latest", label: "최신순" },
  { id: "likes", label: "좋아요순" },
  { id: "views", label: "조회수순" },
];

export default function PostFilter({ onSortChange }) {
  const [activeSort, setActiveSort] = useState("latest");

  const handleSortClick = sortId => {
    setActiveSort(sortId);

    if (onSortChange) {
      onSortChange(sortId); // 부모 컴포넌트로 정렬 상태 전달
    }
  };

  return (
    <div className="post-filter-filterWrapper">
      <div className="post-filter-tabGroup">
        {SORT_OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            className={`${"post-filter-tabBtn"} ${activeSort === option.id ? "post-filter-active" : ""}`}
            onClick={() => handleSortClick(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
