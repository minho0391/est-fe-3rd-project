// [저장된 콘텐츠 불러오기 영역]
"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { AutoAwesomeIcon, RefreshIcon } from "@/images/icons";

export default function ContentFetcher({ onAiGenerate, onExistingContent }) {
  return (
    <div className="write-fetcher-fetcherWrapper">
      <Button
        type="button"
        variant="secondary"
        size="md"
        className="write-fetcher-actionButton"
        leadingIcon={<AutoAwesomeIcon aria-hidden="true" />}
        onClick={onAiGenerate}
      >
        AI 콘텐츠 생성하기
      </Button>

      <Button
        type="button"
        variant="tertiary"
        size="md"
        className="write-fetcher-actionButton"
        leadingIcon={<RefreshIcon aria-hidden="true" />}
        onClick={onExistingContent}
      >
        기존 콘텐츠 불러오기
      </Button>
    </div>
  );
}
