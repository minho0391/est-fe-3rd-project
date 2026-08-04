// [저장된 콘텐츠 불러오기 영역]
import React from "react";

export default function ContentFetcher() {
  return (
    <div className="write-fetcher-fetcherWrapper">
      <button type="button" className="write-fetcher-btnSecondary">
        <span>✨</span> AI 콘텐츠 생성하기
      </button>

      <button type="button" className="write-fetcher-btnTertiary">
        <span>🔄</span> 기존 콘텐츠 불러오기
      </button>
    </div>
  );
}
