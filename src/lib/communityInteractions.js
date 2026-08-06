/**
 * 게시글 상호작용용 임시 클라이언트 저장소입니다.
 *
 * TODO: Supabase 인증/좋아요 API 연동 후 이 파일의 localStorage 기반 구현을
 * 서버 세션과 DB 응답을 사용하는 repository/service로 교체합니다.
 */

const SESSION_STORAGE_KEY = "community-session-user";
const LIKE_STORAGE_KEY_PREFIX = "community-post-like";

const canUseStorage = () => typeof window !== "undefined";

const toSafeCount = value => {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
};

const getLikeStorageKey = ({ postId, userId }) =>
  `${LIKE_STORAGE_KEY_PREFIX}:${String(postId)}:${String(userId)}`;

/**
 * 로그인 후 원래 보던 페이지로 돌아올 수 있는 URL을 만듭니다.
 */
export function buildCommunityLoginUrl(returnUrl = "/post") {
  const safeReturnUrl =
    typeof returnUrl === "string" && returnUrl.startsWith("/")
      ? returnUrl
      : "/post";

  return `/login?returnUrl=${encodeURIComponent(safeReturnUrl)}`;
}

/**
 * 목 인증 사용자 정보를 반환합니다.
 * 인증 담당 코드가 연결되기 전까지 localStorage의 community-session-user를 사용합니다.
 * 값이 없거나 파싱에 실패하면 비로그인 상태(null)로 처리합니다.
 */
export function getCommunitySessionUser() {
  if (!canUseStorage()) return null;

  const savedUser = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!savedUser) return null;

  try {
    const user = JSON.parse(savedUser);

    if (!user || typeof user !== "object" || !user.id) {
      return null;
    }

    return user;
  } catch (error) {
    console.warn("커뮤니티 목 사용자 정보를 읽지 못했습니다.", error);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

/**
 * 현재 사용자의 게시글 좋아요 상태를 반환합니다.
 * 저장된 상태가 없으면 게시글 목데이터의 초기값을 사용합니다.
 */
export function getCommunityPostLikeState({
  postId,
  initialLikeCount = 0,
  initialLiked = false,
  userId,
} = {}) {
  const fallbackState = {
    likeCount: toSafeCount(initialLikeCount),
    liked: Boolean(initialLiked),
  };

  if (!canUseStorage() || postId == null || !userId) {
    return fallbackState;
  }

  const storageKey = getLikeStorageKey({ postId, userId });
  const savedState = window.localStorage.getItem(storageKey);

  if (!savedState) return fallbackState;

  try {
    const parsedState = JSON.parse(savedState);

    return {
      likeCount: toSafeCount(parsedState?.likeCount),
      liked: Boolean(parsedState?.liked),
    };
  } catch (error) {
    console.warn("게시글 좋아요 상태를 읽지 못했습니다.", error);
    window.localStorage.removeItem(storageKey);
    return fallbackState;
  }
}

/**
 * 좋아요 상태를 한 번 토글하고 갱신된 서버 응답 형태를 반환합니다.
 * 현재는 localStorage 목 저장소를 사용하며, 비로그인 상태에서는 변경하지 않습니다.
 */
export async function toggleCommunityPostLike({
  postId,
  initialLikeCount = 0,
  initialLiked = false,
  userId,
} = {}) {
  if (postId == null) {
    throw new Error("좋아요를 변경할 게시글 ID가 필요합니다.");
  }

  if (!userId) {
    throw new Error("좋아요를 변경하려면 로그인이 필요합니다.");
  }

  const currentState = getCommunityPostLikeState({
    postId,
    initialLikeCount,
    initialLiked,
    userId,
  });

  const nextLiked = !currentState.liked;
  const nextLikeCount = Math.max(
    0,
    currentState.likeCount + (nextLiked ? 1 : -1),
  );

  const nextState = {
    likeCount: nextLikeCount,
    liked: nextLiked,
  };

  if (canUseStorage()) {
    const storageKey = getLikeStorageKey({ postId, userId });
    window.localStorage.setItem(storageKey, JSON.stringify(nextState));
  }

  return nextState;
}
