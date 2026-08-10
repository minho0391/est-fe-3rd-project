/**
 * Supabase 기반 커뮤니티 조회 함수.
 *
 * @/data/communityPosts 의 셀렉터와 같은 이름·같은 반환 형태를 유지합니다.
 * 다만 전부 async 이므로 호출부에서 await 이 필요합니다.
 */

import { createClient } from "@/utils/supabase/client";

const supabase = () => createClient();

// "2026-07-28T12:34:56Z" → "2026.07.28"
const toDateLabel = iso => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
};

// "2026-07-28T12:34:56Z" → "10분 전"
const toRelativeLabel = iso => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}일 전`;
  return toDateLabel(iso);
};

// 본문 텍스트 앞부분을 목록용 요약으로
const toDescription = (text, max = 60) => {
  const s = (text ?? "").trim().replace(/\s+/g, " ");
  return s.length > max ? `${s.slice(0, max)}…` : s;
};

/**
 * 게시글 목록에 필요한 관계를 PostgREST embed로 한 번에 조회합니다.
 * 목록 한 번을 그릴 때 posts / boards / profiles / post_tags / tags / post_likes를
 * 각각 왕복하지 않도록 기존 조인 조회 방식으로 유지합니다.
 */
const POST_SELECT = `
  id, board_id, author_id, title, description,
  content_html, content_text, status, is_ai_generated,
  view_count, like_count, comment_count, created_at,
  boards ( id, code, name, is_notice ),
  profiles ( id, nickname, role, avatar_url ),
  post_tags ( tags ( id, name ) ),
  post_likes ( user_id )
`;

const throwQueryError = (context, error) => {
  if (!error) return;

  const message = [context, error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" | ");

  const wrapped = new Error(message);
  wrapped.cause = error;
  throw wrapped;
};

const getSingleRelation = relation =>
  Array.isArray(relation) ? relation[0] : relation;

/** Supabase 행을 기존 커뮤니티 UI 데이터 형태로 변환합니다. */
const mapPost = (row, currentUserId = null) => {
  const board = getSingleRelation(row.boards);
  const profile = getSingleRelation(row.profiles);
  const tags = (row.post_tags ?? [])
    .map(link => getSingleRelation(link.tags)?.name)
    .filter(Boolean);

  return {
    id: row.id,
    isNotice: board?.is_notice === true,
    board: board?.name ?? "",
    title: row.title,
    description: row.description ?? toDescription(row.content_text),
    content: row.content_html,
    authorId: row.author_id,
    author: profile?.nickname ?? "탈퇴한 사용자",
    authorRole: profile?.role === "admin" ? "관리자" : "정회원",
    authorAvatarUrl: profile?.avatar_url ?? "",
    createdAt: toDateLabel(row.created_at),
    views: row.view_count ?? 0,
    likes: row.like_count ?? 0,
    commentsCount: row.comment_count ?? 0,
    tags,
    likedByCurrentUser:
      Boolean(currentUserId) &&
      (row.post_likes ?? []).some(like => like.user_id === currentUserId),
    isAiGenerated: row.is_ai_generated === true,
  };
};

/**
 * 좋아요 여부 표시는 보안 판정이 아니라 현재 UI 상태용이므로 로컬 세션을 사용합니다.
 * 게시글/관계 데이터 자체는 POST_SELECT 한 번의 조회로 가져옵니다.
 */
const mapPosts = async rows => {
  if (!rows?.length) return [];

  const db = supabase();
  const {
    data: { session },
  } = await db.auth.getSession();
  const currentUserId = session?.user?.id ?? null;

  return rows.map(row => mapPost(row, currentUserId));
};

const withLikes = async rows => mapPosts(rows);

/**
 * 목데이터와 동일한 최신순 비교 함수.
 * createdAt은 mapPost()에서 "YYYY.MM.DD" 형태로 정규화됩니다.
 */
export const compareCommunityPostCreatedAtDesc = (a, b) => {
  const toTimestamp = value => {
    const normalized = String(value ?? "")
      .trim()
      .replace(/\.+$/, "")
      .replaceAll(".", "-");
    const timestamp = Date.parse(normalized);

    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const dateDifference = toTimestamp(b?.createdAt) - toTimestamp(a?.createdAt);

  return (
    dateDifference || String(b?.id ?? "").localeCompare(String(a?.id ?? ""))
  );
};

/** 공지 포함 전체 게시글 (최신순) */
export const getCommunityPosts = async () => {
  const { data, error } = await supabase()
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  throwQueryError("전체 게시글 조회 실패", error);

  return withLikes(data ?? []);
};

/** 게시글 단건 */
export const getCommunityPostById = async id => {
  const { data, error } = await supabase()
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  throwQueryError("게시글 상세 조회 실패", error);

  if (!data) return undefined;
  const [post] = await withLikes([data]);
  return post;
};

/** 공지를 제외한 전체 글 (최신순) */
export const getRankablePosts = async () => {
  const { data, error } = await supabase()
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  throwQueryError("랭킹 게시글 조회 실패", error);

  const rows = await withLikes(data ?? []);
  return rows.filter(post => !post.isNotice);
};

/** 최신글 */
export const getLatestCommunityPosts = async (limit = 3) => {
  const rows = await getRankablePosts();
  return rows.slice(0, limit);
};

/** 인기글 (좋아요순) */
export const getPopularCommunityPosts = async (limit = 3) => {
  const { data, error } = await supabase()
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order("like_count", { ascending: false })
    .limit(limit + 5);

  throwQueryError("인기 게시글 조회 실패", error);

  const rows = await withLikes(data ?? []);
  return rows.filter(post => !post.isNotice).slice(0, limit);
};

/** 게시글의 댓글 */
export const getCommentsByPostId = async postId => {
  const { data, error } = await supabase()
    .from("comments")
    .select(
      "id, post_id, author_id, content, created_at, profiles ( nickname, avatar_url )",
    )
    .eq("post_id", postId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  throwQueryError("댓글 조회 실패", error);

  return (data ?? []).map(c => ({
    id: c.id,
    postId: c.post_id,
    authorId: c.author_id,
    author: c.profiles?.nickname ?? "탈퇴한 사용자",
    avatarUrl: c.profiles?.avatar_url ?? "",
    content: c.content,
    createdAt: toRelativeLabel(c.created_at),
  }));
};

/** 특정 작성자의 글 */
export const getPostsByAuthorId = async authorId => {
  const { data, error } = await supabase()
    .from("posts")
    .select(POST_SELECT)
    .eq("author_id", authorId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  throwQueryError("작성 게시글 조회 실패", error);

  const rows = await withLikes(data ?? []);
  return rows.filter(post => !post.isNotice);
};

/** 현재 사용자가 좋아요한 글 */
export const getLikedPostsByCurrentUser = async () => {
  const db = supabase();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();

  throwQueryError("로그인 세션 확인 실패", authError);

  if (!user) return [];

  const { data: likes, error: likesError } = await db
    .from("post_likes")
    .select("post_id")
    .eq("user_id", user.id);

  throwQueryError("좋아요 게시글 목록 조회 실패", likesError);

  const ids = (likes ?? []).map(l => l.post_id);
  if (ids.length === 0) return [];

  const { data, error } = await db
    .from("posts")
    .select(POST_SELECT)
    .in("id", ids)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  throwQueryError("좋아요 게시글 상세 조회 실패", error);

  const rows = await withLikes(data ?? []);
  return rows.filter(post => !post.isNotice);
};

/** 특정 작성자의 댓글 */
export const getCommentsByAuthorId = async authorId => {
  const { data, error } = await supabase()
    .from("comments")
    .select("id, post_id, author_id, content, created_at")
    .eq("author_id", authorId)
    .is("deleted_at", null);

  throwQueryError("작성 댓글 조회 실패", error);

  return (data ?? []).map(c => ({
    id: c.id,
    postId: c.post_id,
    authorId: c.author_id,
    content: c.content,
    createdAt: toRelativeLabel(c.created_at),
  }));
};

/** 현재 로그인 사용자 (목데이터의 currentCommunityUser 대체) */
export const getCurrentCommunityUser = async () => {
  const db = supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("id, nickname, avatar_url, role, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.nickname,
    email: user.email ?? "",
    role: profile.role === "admin" ? "관리자" : "정회원",
    joinDate: toDateLabel(profile.created_at),
    avatarUrl: profile.avatar_url ?? "",
  };
};

/** 마이페이지 프로필 + 집계 */
export const getCurrentUserProfile = async () => {
  const me = await getCurrentCommunityUser();
  if (!me) return null;

  const [posts, comments] = await Promise.all([
    getPostsByAuthorId(me.id),
    getCommentsByAuthorId(me.id),
  ]);

  const receivedLikes = posts.reduce((sum, p) => sum + p.likes, 0);

  return {
    ...me,
    postsCount: posts.length,
    commentsCount: comments.length,
    likesCount: receivedLikes,
  };
};

/** 게시판 목록 (목데이터의 communityBoards 대체) */
export const getCommunityBoards = async () => {
  const { data, error } = await supabase()
    .from("boards")
    .select("id, code, name, is_notice")
    .order("sort_order");

  throwQueryError("게시판 목록 조회 실패", error);

  return data ?? [];
};

/** 저장한 콘텐츠 (마이페이지 보관함) */
export const getSavedContents = async () => {
  const db = supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return [];

  const { data } = await db
    .from("saved_contents")
    .select(
      "id, format_code, title, scripts, tips, extras, conditions, memo, created_at",
    )
    .order("created_at", { ascending: false });

  return (data ?? []).map(s => ({
    id: s.id,
    type: "AI",
    badge: "AI 생성",
    title: s.title,
    content: (s.scripts ?? []).join("\n"),
    tags: [s.conditions?.situation, s.format_code].filter(Boolean),
    memo: s.memo,
    createdAt: toDateLabel(s.created_at),
  }));
};

/** 좋아요 토글 */
export const togglePostLike = async postId => {
  const { data, error } = await supabase().rpc("toggle_post_like", {
    p_post_id: postId,
  });
  if (error) throw error;
  return data;
};

/**
 * 조회수 집계용 식별자.
 * 로그인 사용자는 user id, 비로그인은 브라우저에 보관한 임의 키를 씁니다.
 * post_views PK가 (post_id, viewer_key, viewed_on)이라 하루 1회만 집계됩니다.
 */
const VIEWER_KEY_STORAGE = "momentalk-viewer-key";

const getViewerKey = async () => {
  const db = supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (user) return user.id;

  if (typeof window === "undefined") return "server";

  let key = window.localStorage.getItem(VIEWER_KEY_STORAGE);
  if (!key) {
    key = crypto.randomUUID();
    window.localStorage.setItem(VIEWER_KEY_STORAGE, key);
  }
  return key;
};

/** 조회수 증가 */
export const incrementPostView = async postId => {
  const viewerKey = await getViewerKey();
  const { error } = await supabase().rpc("increment_post_view", {
    p_post_id: postId,
    p_viewer_key: viewerKey,
  });
  if (error) console.warn("조회수 증가 실패:", error);
};
