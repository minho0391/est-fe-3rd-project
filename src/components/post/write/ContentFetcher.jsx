// [저장된 콘텐츠 불러오기 영역]
"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { AutoAwesomeIcon, RefreshIcon } from "@/images/icons";

export default function ContentFetcher() {
  return (
    <div className="write-fetcher-fetcherWrapper">
      <Button
        type="button"
        variant="secondary"
        size="md"
        className="write-fetcher-actionButton"
        leadingIcon={<AutoAwesomeIcon aria-hidden="true" />}
      >
        AI 콘텐츠 생성하기
      </Button>

      <Button
        type="button"
        variant="tertiary"
        size="md"
        className="write-fetcher-actionButton"
        leadingIcon={<RefreshIcon aria-hidden="true" />}
      >
        기존 콘텐츠 불러오기
      </Button>
    </div>
  );
}
