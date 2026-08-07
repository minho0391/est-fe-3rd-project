// src/lib/generateOptions.js
import { createClient } from "@/utils/supabase/client";

export async function fetchOptions() {
  const supabase = createClient();
  const { data } = await supabase
    .from("options")
    .select("category, code, label")
    .eq("is_active", true)
    .order("sort_order");

  const grouped = { situation: [], relation: [], target: [], mood: [], format: [] };
  data?.forEach(o => grouped[o.category]?.push(o));
  return grouped;
}
