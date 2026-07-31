"use client";

import { useState } from "react";

type Quiz = {
  initial: string;
  answer: string;
  hint: string;
};

export default function InitialQuiz() {
  const quizzes: Quiz[] = [
    {
      initial: "ㅂㄹㅅ ㄱㅇ",
      answer: "밸런스 게임",
      hint: "두 가지 선택지 중 하나를 고르는 게임",
    },
    {
      initial: "ㄹㄷㅂㅅ",
      answer: "랜덤박스",
      hint: "여러 항목 중 하나를 무작위로 뽑는 게임",
    },
    {
      initial: "ㅋㄷㄱㅇ",
      answer: "카드게임",
      hint: "카드를 뒤집어 질문을 확인하는 게임",
    },
    {
      initial: "ㅊㅅㅋㅈ",
      answer: "초성퀴즈",
      hint: "자음만 보고 정답을 맞히는 게임",
    },
    {
      initial: "ㅁㅁㅌ",
      answer: "모멘톡",
      hint: "우리 팀프로젝트 서비스 이름",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentQuiz = quizzes[currentIndex];

  const handleSubmit = () => {
    const userAnswer = input.trim().replaceAll(" ", "");
    const correctAnswer = currentQuiz.answer.replaceAll(" ", "");

    if (!userAnswer) {
      alert("정답을 입력해 주세요.");
      return;
    }

    if (userAnswer === correctAnswer) {
      setMessage("정답입니다!");
      setShowAnswer(true);
      return;
    }

    setMessage("틀렸습니다. 다시 생각해 보세요.");
  };

  const handleNextQuiz = () => {
    setCurrentIndex(prev => {
      if (prev === quizzes.length - 1) {
        return 0;
      }

      return prev + 1;
    });

    setInput("");
    setMessage("");
    setShowHint(false);
    setShowAnswer(false);
  };

  const handlePreviousQuiz = () => {
    setCurrentIndex(prev => {
      if (prev === 0) {
        return quizzes.length - 1;
      }

      return prev - 1;
    });

    setInput("");
    setMessage("");
    setShowHint(false);
    setShowAnswer(false);
  };

  const handleRandomQuiz = () => {
    if (quizzes.length <= 1) return;

    let randomIndex = currentIndex;

    while (randomIndex === currentIndex) {
      randomIndex = Math.floor(Math.random() * quizzes.length);
    }

    setCurrentIndex(randomIndex);
    setInput("");
    setMessage("");
    setShowHint(false);
    setShowAnswer(false);
  };

  return (
    <section>
      <h2>초성퀴즈</h2>

      <p>
        {currentIndex + 1} / {quizzes.length}
      </p>

      <h3>{currentQuiz.initial}</h3>

      <div>
        <input
          type="text"
          value={input}
          placeholder="정답을 입력하세요."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />

        <button type="button" onClick={handleSubmit}>
          정답 확인
        </button>
      </div>

      <div>
        <button type="button" onClick={() => setShowHint(prev => !prev)}>
          {showHint ? "힌트 숨기기" : "힌트 보기"}
        </button>

        <button type="button" onClick={() => setShowAnswer(prev => !prev)}>
          {showAnswer ? "정답 숨기기" : "정답 보기"}
        </button>
      </div>

      {showHint && <p>힌트: {currentQuiz.hint}</p>}

      {showAnswer && <p>정답: {currentQuiz.answer}</p>}

      {message && <p>{message}</p>}

      <div>
        <button type="button" onClick={handlePreviousQuiz}>
          이전 문제
        </button>

        <button type="button" onClick={handleNextQuiz}>
          다음 문제
        </button>

        <button type="button" onClick={handleRandomQuiz}>
          랜덤 문제
        </button>
      </div>
    </section>
  );
}
