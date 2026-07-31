"use client";

import { useState } from "react";

export default function CardGame() {
  const cards = [
    "요즘 가장 즐겨 듣는 노래는?",
    "최근에 가장 웃겼던 일은?",
    "지금 당장 여행을 간다면 어디로 가고 싶어?",
    "어릴 때 장래희망은 무엇이었어?",
    "요즘 새롭게 배우고 싶은 것은?",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlipCard = () => {
    setIsFlipped(prev => !prev);
  };

  const handleNextCard = () => {
    setCurrentIndex(prev => {
      if (prev === cards.length - 1) {
        return 0;
      }

      return prev + 1;
    });

    setIsFlipped(false);
  };

  const handlePreviousCard = () => {
    setCurrentIndex(prev => {
      if (prev === 0) {
        return cards.length - 1;
      }

      return prev - 1;
    });

    setIsFlipped(false);
  };

  const handleRandomCard = () => {
    if (cards.length <= 1) return;

    let randomIndex = currentIndex;

    while (randomIndex === currentIndex) {
      randomIndex = Math.floor(Math.random() * cards.length);
    }

    setCurrentIndex(randomIndex);
    setIsFlipped(false);
  };

  return (
    <section>
      <h2>카드게임</h2>

      <p>
        {currentIndex + 1} / {cards.length}
      </p>

      <button type="button" onClick={handleFlipCard}>
        {isFlipped ? cards[currentIndex] : "카드를 눌러 질문을 확인하세요."}
      </button>

      <div>
        <button type="button" onClick={handlePreviousCard}>
          이전 카드
        </button>

        <button type="button" onClick={handleNextCard}>
          다음 카드
        </button>

        <button type="button" onClick={handleRandomCard}>
          랜덤 카드
        </button>
      </div>
    </section>
  );
}
