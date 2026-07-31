"use client";

import { useState } from "react";

export default function RandomPick() {
  const [items, setItems] = useState<string[]>([
    "노래 한 소절 부르기",
    "옆 사람 칭찬하기",
    "재미있는 표정 짓기",
  ]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleAddItem = () => {
    const newItem = input.trim();

    if (!newItem) {
      alert("내용을 입력해 주세요.");
      return;
    }

    setItems(prev => [...prev, newItem]);
    setInput("");
    setResult("");
  };

  const handleDeleteItem = (deleteIndex: number) => {
    setItems(prev => prev.filter((_, index) => index !== deleteIndex));
    setResult("");
  };

  const handleRandomPick = () => {
    if (items.length === 0) {
      alert("랜덤 픽에 항목을 먼저 추가해 주세요.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * items.length);
    setResult(items[randomIndex]);
  };

  const handleReset = () => {
    setItems([]);
    setInput("");
    setResult("");
  };

  return (
    <section>
      <h2>랜덤 픽</h2>

      <div>
        <input
          type="text"
          value={input}
          placeholder="질문, 미션, 벌칙 등을 입력하세요."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              handleAddItem();
            }
          }}
        />

        <button type="button" onClick={handleAddItem}>
          추가
        </button>
      </div>

      <ul>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>
            <span>{item}</span>

            <button type="button" onClick={() => handleDeleteItem(index)}>
              삭제
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && <p>등록된 항목이 없습니다.</p>}

      <div>
        <button type="button" onClick={handleRandomPick}>
          랜덤 뽑기
        </button>

        <button type="button" onClick={handleReset}>
          전체 삭제
        </button>
      </div>

      {result && (
        <div>
          <h3>선택 결과</h3>
          <p>{result}</p>
        </div>
      )}
    </section>
  );
}
