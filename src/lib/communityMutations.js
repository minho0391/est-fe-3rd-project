/**
 * 커뮤니티 작성·수정·삭제 함수.
 *
 * 전부 로그인 필요. 실패 시 error 를 throw 하므로 호출부에서 try/catch 하세요.
 */

import { createClient } from "@/utils/supabase/client";

const supabase = () => createClient();

const requireUser = async db => {
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  return user;
};

// Quill HTML → 검색·요약용 순수 텍스트
const toPlainText = html =>
  (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

// 게시판 이름 → board_id
const resolveBoardId = async (db, boardName) => {
  const { data } = await db
    .from("boards")
    .select("id, name")
    .eq("name", boardName)
    .single();
  if (!data) throw new Error(`없는 게시판입니다: ${boardName}`);
  return data.id;
};

// 태그 이름 배열 → tag_id 배열 (없으면 생성)
const resolveTagIds = async (db, tagNames = []) => {
  const names = [
    ...new Set(tagNames.map(t => String(t).trim()).filter(Boolean)),
  ];
  if (names.length === 0) return [];

  const { data: existing } = await db
    .from("tags")
    .select("id, name")
    .in("name", names);

  const found = new Map((existing ?? []).map(t => [t.name, t.id]));
  const missing = names.filter(n => !found.has(n));

  if (missing.length > 0) {
    const { data: created, error } = await db
      .from("tags")
      .insert(missing.map(name => ({ name })))
      .select("id, name");

    if (error) throw error;
    (created ?? []).forEach(t => found.set(t.name, t.id));
  }

  return names.map(n => found.get(n)).filter(Boolean);
};

// post_tags 재설정
const syncPostTags = async (db, postId, tagNames) => {
  const tagIds = await resolveTagIds(db, tagNames);

  await db.from("post_tags").delete().eq("post_id", postId);

  if (tagIds.length === 0) return;

  const { error } = await db
    .from("post_tags")
    .insert(tagIds.map(tagId => ({ post_id: postId, tag_id: tagId })));

  if (error) throw error;
};

/**
 * 게시글 작성
 *
 * @param {object} form WriteForm 의 state 를 그대로 넘기면 됩니다.
 * @param {string} form.board 게시판 이름 ("자유게시판" 등)
 * @param {string} form.title
 * @param {string} form.description 추가 설명
 * @param {string} form.content Quill HTML
 * @param {string[]} form.tags
 * @param {boolean} form.isAiGenerated AI 생성 여부
 * @param {object} form.sharedContent AI/저장 콘텐츠 스냅샷 (선택)
 * @returns {Promise<number>} 생성된 게시글 id
 */
export const createPost = async ({
  board,
  title,
  description = "",
  content,
  tags = [],
  isAiGenerated = false,
  sharedContent = null,
  savedContentId = null,
}) => {
  const db = supabase();
  const user = await requireUser(db);
  const boardId = await resolveBoardId(db, board);

  const { data, error } = await db
    .from("posts")
    .insert({
      board_id: boardId,
      author_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      content_html: content,
      content_text: toPlainText(content),
      saved_content_id: savedContentId,
      shared_content:
        sharedContent ?? (isAiGenerated ? { source: "ai" } : null),
      is_ai_generated: Boolean(isAiGenerated),
      status: "published",
    })
    .select("id")
    .single();

  if (error) throw error;

  await syncPostTags(db, data.id, tags);

  return data.id;
};

/**
 * 게시글 본문 이미지 업로드.
 *
 * public `post-images` 버킷의 {user_id}/{128bit-random}.{ext} 경로에 저장합니다.
 * 브라우저에서 본문에 바로 표시할 수 있도록 공개 URL을 반환합니다.
 *
 * @param {File} file 이미지 파일
 * @returns {Promise<string>} 공개 URL
 */
export const uploadPostImage = async file => {
  const db = supabase();
  const user = await requireUser(db);

  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("본문 이미지는 5MB 이하만 업로드할 수 있습니다.");
  }

  // 원본 파일명은 Storage 경로에 사용하지 않습니다.
  // 128bit 난수를 hex 문자열로 만들어 충돌 가능성을 낮추고 파일명을 예측하기 어렵게 합니다.
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const randomFileName = Array.from(randomBytes, byte =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  const extensionByMimeType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  const safeExt = extensionByMimeType[file.type] ?? "jpg";
  const path = `${user.id}/${randomFileName}.${safeExt}`;

  const { error: uploadError } = await db.storage
    .from("post-images")
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    if (/bucket.*not found/i.test(uploadError.message ?? "")) {
      throw new Error(
        "게시글 이미지 저장소(post-images)가 준비되지 않았습니다.",
      );
    }
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = db.storage.from("post-images").getPublicUrl(path);

  if (!publicUrl) {
    throw new Error("업로드한 이미지 URL을 가져오지 못했습니다.");
  }

  return publicUrl;
};

/** 게시글 수정 (본인 글만 — RLS가 막습니다) */
export const updatePost = async (
  postId,
  { board, title, description, content, tags },
) => {
  const db = supabase();
  await requireUser(db);

  const patch = { updated_at: new Date().toISOString() };

  if (board !== undefined) patch.board_id = await resolveBoardId(db, board);
  if (title !== undefined) patch.title = title.trim();
  if (description !== undefined) patch.description = description.trim() || null;
  if (content !== undefined) {
    patch.content_html = content;
    patch.content_text = toPlainText(content);
  }

  const { error } = await db.from("posts").update(patch).eq("id", postId);
  if (error) throw error;

  if (tags !== undefined) await syncPostTags(db, postId, tags);
};

/** 게시글 삭제 (본인 글만) */
export const deletePost = async postId => {
  const db = supabase();
  await requireUser(db);

  const { error } = await db.from("posts").delete().eq("id", postId);
  if (error) throw error;
};

/**
 * 댓글 작성
 *
 * @returns 화면에서 바로 쓸 수 있는 모양으로 반환합니다.
 */
export const createComment = async (postId, content, parentId = null) => {
  const db = supabase();
  const user = await requireUser(db);

  const { data, error } = await db
    .from("comments")
    .insert({
      post_id: postId,
      author_id: user.id,
      parent_id: parentId,
      content: content.trim(),
    })
    .select(
      "id, post_id, author_id, content, created_at, profiles ( nickname, avatar_url )",
    )
    .single();

  if (error) throw error;

  return {
    id: data.id,
    postId: data.post_id,
    authorId: data.author_id,
    author: data.profiles?.nickname ?? "",
    avatarUrl: data.profiles?.avatar_url ?? "",
    content: data.content,
    createdAt: "방금 전",
  };
};

/** 댓글 삭제 (soft delete — 대댓글이 있어도 트리가 안 깨집니다) */
export const deleteComment = async commentId => {
  const db = supabase();
  await requireUser(db);

  const { error } = await db
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) throw error;
};

/** 생성 결과를 내 보관함에 저장 */
export const saveContent = async ({
  generationItemId = null,
  formatCode,
  conditions = {},
  title,
  scripts = [],
  tips = [],
  extras = {},
  memo = null,
}) => {
  const db = supabase();
  const user = await requireUser(db);

  const { data, error } = await db
    .from("saved_contents")
    .insert({
      user_id: user.id,
      generation_item_id: generationItemId,
      format_code: formatCode,
      conditions,
      title,
      scripts,
      tips,
      extras,
      memo,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
};

/** 보관함에서 삭제 */
export const deleteSavedContent = async id => {
  const db = supabase();
  await requireUser(db);

  const { error } = await db.from("saved_contents").delete().eq("id", id);
  if (error) throw error;
};

/** 회원 프로필 정보 수정 */
export const updateCurrentUserProfile = async ({ nickname }) => {
  const db = supabase();
  const user = await requireUser(db);
  const nextNickname = String(nickname ?? "").trim();

  if (nextNickname.length < 2 || nextNickname.length > 20) {
    throw new Error("닉네임은 2자 이상 20자 이하로 입력해 주세요.");
  }

  const { data, error } = await db
    .from("profiles")
    .update({ nickname: nextNickname })
    .eq("id", user.id)
    .select("id, nickname, avatar_url, role, created_at")
    .single();

  if (error) throw error;

  // 헤더/다른 화면에서 auth metadata를 사용하는 경우에도 이름이 맞도록 동기화합니다.
  const { error: authError } = await db.auth.updateUser({
    data: { ...user.user_metadata, nickname: nextNickname },
  });
  if (authError) console.warn("인증 메타데이터 닉네임 동기화 실패:", authError);

  return data;
};

/**
 * 프로필 사진 업로드.
 *
 * avatars 버킷의 {user_id}/ 폴더에 저장하고 profiles.avatar_url 을 갱신합니다.
 * 버킷 자체가 2MB, 이미지 MIME 만 허용하도록 설정돼 있어 서버에서도 한 번 더 걸러집니다.
 *
 * @param {File} file 이미지 파일
 * @returns {Promise<string>} 공개 URL
 */
export const uploadAvatar = async file => {
  const db = supabase();
  const user = await requireUser(db);

  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 올릴 수 있습니다.");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("2MB 이하 이미지만 올릴 수 있습니다.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await db.storage
    .from("avatars")
    .upload(path, file, { upsert: true, cacheControl: "3600" });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = db.storage.from("avatars").getPublicUrl(path);

  // 같은 경로에 덮어쓰므로 캐시 무효화용 쿼리스트링을 붙입니다.
  const url = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await db
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id);

  if (updateError) throw updateError;

  return url;
};

/** 프로필 사진 삭제 (기본 아바타로 되돌리기) */
export const removeAvatar = async () => {
  const db = supabase();
  const user = await requireUser(db);

  const { data: files } = await db.storage.from("avatars").list(user.id);

  if (files?.length) {
    await db.storage
      .from("avatars")
      .remove(files.map(f => `${user.id}/${f.name}`));
  }

  const { error } = await db
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);
  if (error) throw error;
};
