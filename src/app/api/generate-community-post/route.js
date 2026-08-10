import { ALAN_TASK, generateAlanContent, toAlanResponse } from "@/lib/alan";

export async function POST(request) {
  try {
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
