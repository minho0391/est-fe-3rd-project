/**
 * 앨런 API 공통 호출 모듈.
 *
 * 대화 생성(/api/generate)과 커뮤니티 초안 생성(/api/generate-community-post)이
 * 함께 사용합니다. 프롬프트는 각 라우트에서 만들고,
 * 이 파일은 호출·파싱·에러 처리만 담당합니다.
 *
 * 서버 전용입니다. 클라이언트 컴포넌트에서 import 하지 마세요.
 * (ALAN_CLIENT_ID는 NEXT_PUBLIC_ 접두사 없는 서버 환경변수입니다)
 */

const ALAN_BASE = "https://kdt-api-function.azurewebsites.net/api/v1";

/** 앨런 호출 실패를 구분하기 위한 에러 타입 */
export class AlanError extends Error {
  constructor(message, { status = 502, cause = null } = {}) {
    super(message);
    this.name = "AlanError";
    this.status = status;
    this.cause = cause;
  }
}

const getClientId = () => {
  const clientId = process.env.ALAN_CLIENT_ID;

  if (!clientId) {
    throw new AlanError("ALAN_CLIENT_ID 환경변수가 없습니다.", { status: 500 });
  }

  return clientId;
};

/**
 * 이전 대화 상태 초기화.
 *
 * 앨런은 client_id 단위로 대화 맥락을 유지해서, 초기화하지 않으면
 * 직전 질문의 영향을 받습니다. 실패해도 질의는 진행합니다.
 */
const resetState = async clientId => {
  try {
    await fetch(`${ALAN_BASE}/reset-state`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId }),
    });
  } catch {
    // 초기화 실패는 치명적이지 않으므로 무시합니다.
  }
};

/** 응답 문자열에서 첫 번째 JSON 블록을 뽑아 파싱합니다. */
const extractJson = answer => {
  if (typeof answer !== "string") {
    throw new AlanError("앨런 응답에 answer 필드가 없습니다.");
  }

  const match = answer.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new AlanError("앨런 응답에서 JSON을 찾지 못했습니다.");
  }

  try {
    return JSON.parse(match[0]);
  } catch (error) {
    throw new AlanError("앨런 응답 JSON 파싱에 실패했습니다.", { cause: error });
  }
};

/**
 * 앨런에 질의하고 JSON 결과를 반환합니다.
 *
 * @param {string} prompt 완성된 프롬프트 문자열
 * @param {object} [options]
 * @param {boolean} [options.reset=true] 호출 전 대화 상태 초기화 여부
 * @param {number} [options.timeoutMs=60000] 응답 대기 시간
 * @returns {Promise<object>} 파싱된 JSON 객체
 * @throws {AlanError}
 */
export const askAlan = async (prompt, { reset = true, timeoutMs = 60000 } = {}) => {
  if (!prompt?.trim()) {
    throw new AlanError("프롬프트가 비어 있습니다.", { status: 400 });
  }

  const clientId = getClientId();

  if (reset) await resetState(clientId);

  const url = `${ALAN_BASE}/question?content=${encodeURIComponent(prompt)}&client_id=${clientId}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;

  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new AlanError("앨런 응답이 시간 내에 오지 않았습니다.", { status: 504 });
    }

    throw new AlanError("앨런 API 호출에 실패했습니다.", { cause: error });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new AlanError(`앨런 API가 ${res.status}를 반환했습니다.`, {
      status: res.status === 429 ? 429 : 502,
    });
  }

  const data = await res.json().catch(() => {
    throw new AlanError("앨런 응답이 JSON 형식이 아닙니다.");
  });

  return extractJson(data.answer);
};

/**
 * 라우트에서 에러를 응답으로 바꿀 때 씁니다.
 */
export const toAlanResponse = error => {
  if (error instanceof AlanError) {
    return Response.json({ source: "failed", error: error.message }, { status: error.status });
  }

  console.error("[alan] 예상치 못한 오류", error);

  return Response.json(
    { source: "failed", error: "알 수 없는 오류가 발생했습니다." },
    { status: 500 },
  );
};
