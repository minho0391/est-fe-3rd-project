// 실제 AI 생성 API 연동 전까지 사용하는 목업 함수.
// 테스트 목적 URL에 ?forceError=true
export function mockGenerateGuide(searchParams) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (searchParams.get("forceError") === "true") {
        reject(new Error("대화 가이드 생성 실패"));
      } else {
        resolve();
      }
    }, 2600);
  });
}
