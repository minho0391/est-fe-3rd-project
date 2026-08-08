/**
 * 대화 생성 결과 조회 함수.
 *
 * /api/generate 가 저장한 generations / generation_items 를 읽습니다.
 * RLS 상 본인 생성물만 조회됩니다.
 */

import { createClient } from "@/utils/supabase/client";

const supabase = () => createClient();

// "2026-08-08T12:34:56Z" → "2026.08.08"
const toDateLabel = iso => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
};

// DB 행 → /api/generate 응답과 같은 모양
const mapItem = row => ({
  id: row.id,
  position: row.position,
  title: row.title,
  scripts: row.scripts ?? [],
  tips: row.tips ?? [],
});

/**
 * 생성 결과 단건 조회.
 *
 * 결과 페이지에서 /generate/result?id=xxx 로 진입했을 때 사용합니다.
 * 반환 형태가 /api/generate 응답과 같아서 화면 코드를 공유할 수 있습니다.
 *
 * @param {string} generationId uuid
 * @returns {Promise<object|null>} 없거나 권한이 없으면 null
 */
export const getGenerationById = async generationId => {
  if (!generationId) return null;

  const { data } = await supabase()
    .from("generations")
    .select(
      `
      id, format_code, conditions, custom_input, status, source, created_at,
      generation_items ( id, position, title, scripts, tips )
    `,
    )
    .eq("id", generationId)
    .single();

  if (!data) return null;

  const items = (data.generation_items ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(mapItem);

  return {
    source: data.source ?? "ai",
    generationId: data.id,
    conditions: data.conditions ?? {},
    formatCode: data.format_code,
    customInput: data.custom_input ?? "",
    status: data.status,
    createdAt: toDateLabel(data.created_at),
    results: items,
  };
};

/**
 * 현재 사용자의 생성 이력 목록.
 *
 * 마이페이지 "최근 생성한 가이드" 같은 화면에 씁니다.
 * 성공한 것만 최신순으로 반환합니다.
 */
export const getMyGenerations = async (limit = 10) => {
  const db = supabase();

  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) return [];

  const { data } = await db
    .from("generations")
    .select(
      `
      id, format_code, conditions, custom_input, created_at,
      generation_items ( id, position, title, scripts, tips )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map(row => ({
    generationId: row.id,
    formatCode: row.format_code,
    conditions: row.conditions ?? {},
    customInput: row.custom_input ?? "",
    createdAt: toDateLabel(row.created_at),
    results: (row.generation_items ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(mapItem),
  }));
};

/**
 * 생성 결과 중 하나를 보관함에 저장.
 *
 * 결과 페이지의 "가이드 저장하기" 버튼에서 호출합니다.
 *
 * @param {string} generationItemId 저장할 항목 id (results[].id)
 * @param {string} [memo]
 * @returns {Promise<string>} saved_contents id
 */
export const saveGenerationItem = async (generationItemId, memo = null) => {
  const db = supabase();

  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  // 저장할 항목과 그 생성 조건을 함께 읽습니다.
  const { data: item, error: itemError } = await db
    .from("generation_items")
    .select("id, title, scripts, tips, generations ( format_code, conditions )")
    .eq("id", generationItemId)
    .single();

  if (itemError) throw itemError;
  if (!item) throw new Error("저장할 항목을 찾을 수 없습니다.");

  const { data, error } = await db
    .from("saved_contents")
    .insert({
      user_id: user.id,
      generation_item_id: item.id,
      format_code: item.generations?.format_code,
      conditions: item.generations?.conditions ?? {},
      title: item.title,
      scripts: item.scripts ?? [],
      tips: item.tips ?? [],
      memo,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
};
