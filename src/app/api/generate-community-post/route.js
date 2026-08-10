import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { title, description, keywords = [] } = await request.json();

    // TODO:
    // 실제 AI 호출 로직을 연결하세요.
    // communityQueries.js / communityMutations.js는 그대로 사용할 수 있습니다.

    return NextResponse.json({
      source: "ai",
      title: title ?? "",
      description: description ?? "",
      content: "",
      tags: Array.isArray(keywords) ? keywords : [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: "failed",
        error: "AI 콘텐츠 생성에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
