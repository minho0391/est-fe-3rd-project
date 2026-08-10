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
    throw new AlanError("앨런 응답 JSON 파싱에 실패했습니다.", {
      cause: error,
    });
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
export const askAlan = async (
  prompt,
  { reset = true, timeoutMs = 60000 } = {},
) => {
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
      throw new AlanError("앨런 응답이 시간 내에 오지 않았습니다.", {
        status: 504,
      });
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
 * 앨런을 사용하는 기능 구분값.
 * 두 API Route 모두 같은 공통 함수(generateAlanContent)를 호출하고,
 * task 값에 따라 프롬프트와 결과 스키마를 분리합니다.
 */
export const ALAN_TASK = {
  CONVERSATION: "conversation",
  COMMUNITY_POST: "community-post",
};

const buildConversationPrompt = ({
  situation,
  mood,
  relation,
  target,
  format,
}) => {
  const conditions = [
    situation && `상황: ${situation}`,
    mood && `원하는 분위기: ${mood}`,
    relation && `관계: ${relation}`,
    target && `대화 상대: ${target}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `아래 조건에 맞는 "${format}" 형식의 대화 카드 3개를 만들어줘.

${conditions}

카드 하나에 내용은 딱 1개. 여러 개 넣지 마.
검색하지 말고 직접 창작해. 출처나 링크 붙이지 마.
아래 JSON 형식만 출력. 설명이나 인사말 금지.
{"results":[{"title":"주제","scripts":["내용 1개"],"tips":["팁1","팁2"]}]}
results는 3개, 각 scripts는 1개, 각 tips는 2개.
금지 소재: 연봉, 인사평가, 승진, 사내정치, 사생활, 음주강요, 정치, 종교`;
};

const buildCommunityPostPrompt = ({ title, description, keywords = [] }) => {
  const keywordText = Array.isArray(keywords)
    ? keywords.filter(Boolean).join(", ")
    : "";

  return `커뮤니티에 게시할 글 초안을 작성해줘.

입력 정보
- 제목 힌트: ${title?.trim() || "없음"}
- 설명: ${description?.trim() || "없음"}
- 키워드: ${keywordText || "없음"}

요구사항
- 사용자가 바로 수정해서 게시할 수 있는 자연스러운 한국어 글로 작성
- 제목, 한 줄 설명, 본문, 태그를 서로 일관되게 작성
- 본문은 HTML이 아니라 일반 텍스트로 작성
- 태그는 2~5개
- 입력 정보가 부족해도 합리적으로 보완해서 초안을 작성
- 사실 확인이 필요한 구체적 수치나 출처는 임의로 만들지 않기
- 아래 JSON 형식만 출력하고 설명이나 인사말은 붙이지 않기

{"title":"게시글 제목","description":"한 줄 설명","content":"게시글 본문","tags":["태그1","태그2"]}`;
};

const normalizeConversationResult = result => {
  const results = Array.isArray(result?.results) ? result.results : [];

  if (results.length === 0) {
    throw new AlanError("앨런이 대화 생성 결과를 만들지 못했습니다.");
  }

  return {
    results: results.slice(0, 3).map((item, index) => ({
      position: index + 1,
      title: item?.title ?? "",
      scripts: Array.isArray(item?.scripts) ? item.scripts.slice(0, 1) : [],
      tips: Array.isArray(item?.tips) ? item.tips.slice(0, 2) : [],
    })),
  };
};

const normalizeCommunityPostResult = (result, payload) => {
  const tags = Array.isArray(result?.tags)
    ? result.tags.filter(Boolean).slice(0, 5)
    : Array.isArray(payload?.keywords)
      ? payload.keywords.filter(Boolean).slice(0, 5)
      : [];

  const normalized = {
    title: String(result?.title ?? payload?.title ?? "").trim(),
    description: String(
      result?.description ?? payload?.description ?? "",
    ).trim(),
    content: String(result?.content ?? "").trim(),
    tags,
  };

  if (!normalized.title && !normalized.content) {
    throw new AlanError("앨런이 커뮤니티 게시글 초안을 만들지 못했습니다.");
  }

  return normalized;
};

/**
 * 기능별 공통 앨런 생성 함수.
 *
 * @param {"conversation"|"community-post"} task 기능 구분값
 * @param {object} payload 기능별 입력값
 * @returns {Promise<object>} 기능별 정규화 결과
 */
export const generateAlanContent = async (task, payload = {}) => {
  switch (task) {
    case ALAN_TASK.CONVERSATION: {
      const { situation, mood, relation, target, format } = payload;

      if (!situation?.trim()) {
        throw new AlanError("상황을 입력해주세요.", { status: 400 });
      }

      if (!format) {
        throw new AlanError("형식을 선택해주세요.", { status: 400 });
      }

      const result = await askAlan(
        buildConversationPrompt({
          situation,
          mood,
          relation,
          target,
          format,
        }),
      );

      return normalizeConversationResult(result);
    }

    case ALAN_TASK.COMMUNITY_POST: {
      const { title, description, keywords = [] } = payload;

      const hasInput =
        Boolean(title?.trim()) ||
        Boolean(description?.trim()) ||
        (Array.isArray(keywords) && keywords.some(Boolean));

      if (!hasInput) {
        throw new AlanError("제목, 설명, 키워드 중 하나 이상을 입력해주세요.", {
          status: 400,
        });
      }

      const result = await askAlan(
        buildCommunityPostPrompt({
          title,
          description,
          keywords,
        }),
      );

      return normalizeCommunityPostResult(result, payload);
    }

    default:
      throw new AlanError("지원하지 않는 AI 생성 기능입니다.", {
        status: 400,
      });
  }
};

/**
 * 라우트에서 에러를 응답으로 바꿀 때 씁니다.
 */
export const toAlanResponse = error => {
  if (error instanceof AlanError) {
    return Response.json(
      { source: "failed", error: error.message },
      { status: error.status },
    );
  }

  console.error("[alan] 예상치 못한 오류", error);

  return Response.json(
    { source: "failed", error: "알 수 없는 오류가 발생했습니다." },
    { status: 500 },
  );
};
