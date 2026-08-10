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
 * posts 테이블에서 직접 보장되는 컬럼만 조회합니다.
 * 관계 테이블은 별도 조회하여 FK constraint 이름에 의존하지 않도록 합니다.
 */
const POST_SELECT = `
  id, board_id, author_id, title, description,
  content_html, content_text, status,
  view_count, like_count, comment_count, created_at
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

// 현재 사용자가 좋아요한 글 id 집합
const fetchLikedIds = async (postIds = []) => {
  const db = supabase();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();

  throwQueryError("로그인 세션 확인 실패", authError);

  if (!user || postIds.length === 0) return new Set();

  const { data, error } = await db
    .from("post_likes")
    .select("post_id")
    .eq("user_id", user.id)
    .in("post_id", postIds);

  throwQueryError("좋아요 정보 조회 실패", error);

  return new Set((data ?? []).map(r => r.post_id));
};

/**
 * posts 기본 행에 boards / profiles / post_tags 정보를 별도 조회하여 합칩니다.
 * 이렇게 하면 PostgREST의 관계 constraint 이름이 달라도 게시글 목록 조회가 깨지지 않습니다.
 */
const hydratePosts = async rows => {
  if (!rows?.length) return [];

  const db = supabase();
  const boardIds = [...new Set(rows.map(row => row.board_id).filter(Boolean))];
  const authorIds = [
    ...new Set(rows.map(row => row.author_id).filter(Boolean)),
  ];
  const postIds = rows.map(row => row.id);

  const [
    { data: boards, error: boardsError },
    { data: profiles, error: profilesError },
    { data: postTags, error: postTagsError },
    likedIds,
  ] = await Promise.all([
    boardIds.length
      ? db.from("boards").select("id, code, name").in("id", boardIds)
      : Promise.resolve({ data: [], error: null }),
    authorIds.length
      ? db
          .from("profiles")
          .select("id, nickname, role, avatar_url")
          .in("id", authorIds)
      : Promise.resolve({ data: [], error: null }),
    postIds.length
      ? db.from("post_tags").select("post_id, tag_id").in("post_id", postIds)
      : Promise.resolve({ data: [], error: null }),
    fetchLikedIds(postIds),
  ]);

  throwQueryError("게시판 정보 조회 실패", boardsError);
  throwQueryError("작성자 프로필 조회 실패", profilesError);
  throwQueryError("게시글 태그 연결 조회 실패", postTagsError);

  const tagIds = [
    ...new Set((postTags ?? []).map(row => row.tag_id).filter(Boolean)),
  ];

  let tags = [];
  if (tagIds.length > 0) {
    const { data, error } = await db
      .from("tags")
      .select("id, name")
      .in("id", tagIds);

    throwQueryError("태그 정보 조회 실패", error);
    tags = data ?? [];
  }

  const boardMap = new Map((boards ?? []).map(row => [row.id, row]));
  const profileMap = new Map((profiles ?? []).map(row => [row.id, row]));
  const tagMap = new Map(tags.map(row => [row.id, row.name]));
  const tagsByPost = new Map();

  for (const link of postTags ?? []) {
    const tagName = tagMap.get(link.tag_id);
    if (!tagName) continue;

    const current = tagsByPost.get(link.post_id) ?? [];
    current.push(tagName);
    tagsByPost.set(link.post_id, current);
  }

  return rows.map(row => {
    const board = boardMap.get(row.board_id);
    const profile = profileMap.get(row.author_id);
    const boardName = board?.name ?? "";

    return {
      id: row.id,
      isNotice:
        boardName === "공지사항" ||
        boardName === "공지" ||
        board?.code === "notice",
      board: boardName,
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
      tags: tagsByPost.get(row.id) ?? [],
      likedByCurrentUser: likedIds.has(row.id),
    };
  });
};

const withLikes = async rows => hydratePosts(rows);

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
    .select("id, code, name")
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
