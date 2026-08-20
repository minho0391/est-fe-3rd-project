/**
 * 대화 생성 결과 조회 함수.
 *
 * supabase/functions/generate 가 저장한 generations / generation_items 를 읽습니다.
 * RLS 상 본인 생성물만 조회됩니다.
 *
 * 반환 형태는 generate 함수의 응답과 동일하게 맞춥니다:
 * { source, saved, generationId, meta, results }
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

// generation_items 행 → generate 함수 응답의 results[] 항목과 같은 모양
const mapItem = row => ({
  id: row.id,
  position: row.position,
  title: row.title,
  scripts: row.scripts ?? [],
  tips: row.tips ?? [],
  extras: row.extras ?? {},
});

// options 테이블을 읽어 "코드 → 라벨" 조회 함수를 만든다.
// (generate 함수의 labelOf 와 동일한 로직)
const buildLabelOf = async db => {
  const { data: options } = await db.from("options").select("category, code, label");
  return (category, code) => options?.find(o => o.category === category && o.code === code)?.label ?? null;
};

// generations 행 + labelOf → meta ({ situation, format, level, mood })
const buildMeta = (row, labelOf) => {
  const cond = row.conditions ?? {};
  return {
    relation: labelOf("relation", cond.relation) ?? cond.relation ?? "",
    target: labelOf("target", cond.target) ?? cond.target ?? "",
    situation: labelOf("situation", cond.situation) ?? "커스텀",
    format: labelOf("format", row.format_code) ?? row.format_code,
    level: cond.level ?? 1,
    mood: labelOf("mood", cond.mood),
    customInput: cond.custom_input ?? null,
  };
};

/**
 * 생성 결과 단건 조회.
 *
 * 결과 페이지에서 /generate/result?id=xxx 로 진입했을 때 사용합니다.
 * 반환 형태가 generate 함수 응답과 같아서 화면 코드를 공유할 수 있습니다.
 *
 * @param {string|number} generationId
 * @returns {Promise<object|null>} 없거나 권한이 없으면 null
 */
export const getGenerationById = async generationId => {
  if (!generationId) return null;

  const db = supabase();

  const { data } = await db
    .from("generations")
    .select(
      `
      id, format_code, conditions, status, source, created_at,
      generation_items ( id, position, title, scripts, tips, extras )
    `,
    )
    .eq("id", generationId)
    .single();

  if (!data) return null;

  const labelOf = await buildLabelOf(db);

  const items = (data.generation_items ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(mapItem);

  return {
    source: data.source ?? "ai",
    saved: true,
    generationId: data.id,
    meta: buildMeta(data, labelOf),
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
      id, format_code, conditions, created_at,
      generation_items ( id, position, title, scripts, tips, extras )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data?.length) return [];

  const labelOf = await buildLabelOf(db);

  return data.map(row => ({
    generationId: row.id,
    meta: buildMeta(row, labelOf),
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
 * generate 함수 응답의 results[].id (generation_items.id) 를 넘겨야 합니다.
 * 비로그인 사용자는 id가 없으니(=null) 버튼을 숨기거나 로그인 유도로 처리하세요.
 *
 * @param {number} generationItemId 저장할 항목 id (results[].id)
 * @param {string} [memo]
 * @returns {Promise<string>} saved_contents id
 */
export const saveGenerationItem = async (generationItemId, memo = null) => {
  if (!generationItemId) {
    throw new Error("저장할 항목 id가 없습니다. (비로그인 상태로 생성된 결과일 수 있습니다)");
  }

  const db = supabase();

  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  // 저장할 항목과 그 생성 조건을 함께 읽습니다.
  const { data: item, error: itemError } = await db
    .from("generation_items")
    .select("id, title, scripts, tips, extras, generations ( format_code, conditions )")
    .eq("id", generationItemId)
    .single();

  if (itemError) throw itemError;
  if (!item) throw new Error("저장할 항목을 찾을 수 없습니다.");

  // upsert + onConflict: (user_id, generation_item_id) 유니크 제약을 전제로,
  // 이미 저장된 항목이면 새로 삽입하지 않고 조용히 무시합니다.
  // (새로고침 후 재저장, 더블클릭 등으로 인한 중복 저장 방지)
  const { data, error } = await db
    .from("saved_contents")
    .upsert(
      {
        user_id: user.id,
        generation_item_id: item.id,
        format_code: item.generations?.format_code,
        conditions: item.generations?.conditions ?? {},
        title: item.title,
        scripts: item.scripts ?? [],
        tips: item.tips ?? [],
        memo,
      },
      { onConflict: "user_id,generation_item_id", ignoreDuplicates: true },
    )
    .select("id");

  if (error) throw error;

  // ignoreDuplicates: true 인 경우 충돌(이미 저장됨) 시 data가 빈 배열로 반환
  if (!data || data.length === 0) {
    const { data: existing, error: existingError } = await db
      .from("saved_contents")
      .select("id")
      .eq("user_id", user.id)
      .eq("generation_item_id", item.id)
      .single();

    if (existingError) throw existingError;
    return existing.id;
  }

  return data[0].id;
};
