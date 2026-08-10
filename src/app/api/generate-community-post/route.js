import { ALAN_TASK, generateAlanContent, toAlanResponse } from "@/lib/alan";
import { createClient } from "@/utils/supabase/server";

export async function POST(request) {
  try {
    const db = await createClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: "로그인이 필요한 기능입니다." },
        { status: 401 },
      );
    }

    const { title, description, keywords = [] } = await request.json();

    const generated = await generateAlanContent(ALAN_TASK.COMMUNITY_POST, {
      title,
      description,
      keywords,
    });

    return Response.json({
      source: "ai",
      title: generated.title,
      description: generated.description,
      content: generated.content,
      tags: generated.tags,
    });
  } catch (error) {
    return toAlanResponse(error);
  }
}
