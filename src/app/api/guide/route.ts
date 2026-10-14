import OpenAI from "openai";
import { readFile } from "fs/promises";
import path from "path";

type GuideRequest = {
  question?: unknown;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 제공된 질문과 RAG 파일을 가지고 관련 단원을 검색
const searchGuide = (question: string, guideText: string) => {
  // JS가 질문을 비교하기 쉬운 형태로 변경
  const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, "");
  const useQuestion = normalize(question);

  // 텍스트 파일을 단원별로 나누기
  const sections = guideText.split(/(?=\[\d{2}\.\s)/);

  // 공통 규칙 가져오기
  const commonRule = sections.find((item) =>
    item.includes("[00. 챗봇 공통 답변 원칙]"),
  );

  // 섹션과 섹션의 점수 결과가 들어갈 빈 배열 설정
  const result: { text: string; score: number }[] = [];

  for (const item of sections) {
    if (item.includes("[00. 챗봇 공통 답변 원칙]")) {
      continue;
    }

    const title = item.match(/대표명칭:\s*(.+)/);
    const keywords = item.match(/관련표현:\s*([\s\S]*?)(?=\n\s*\n|기능설명:|$)/);
    // keywords[0]: 관련표현을 포함한 전체 문자열
    // keywords[1]: 쉼표로 구분된 비교용 키워드 문자열
    const words = [title?.[1], ...(keywords?.[1]?.split(",") ?? [])].filter((word): word is string => Boolean(word)).map((word) => word.trim()).filter(Boolean);

    let score = 0;
    for (const word of words) {
      const keyword = normalize(word);
      if (keyword && useQuestion.includes(keyword)) {
        score += keyword.length;
      }
    }

    if (score > 0) {
      result.push({ text: item, score });
    }
  }

  result.sort((left, right) => right.score - left.score);
  const selected = result
    .slice(0, 3)
    .map((item) => item.text)
    .join("\n\n");

  return [commonRule, selected].filter(Boolean).join("\n\n");
};

export const POST = async (request: Request): Promise<Response> => {
  try {
    const { question }: GuideRequest = await request.json();

    if (typeof question !== "string" || !question.trim()) {
      return Response.json(
        { error: "질문을 입력해 주세요." },
        { status: 400 },
      );
    }

    // 프로젝트 최상단 경로를 기준으로 RAG 자료 파일 경로 생성
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "next_step4_guide_rag_complete.tsx",
    );
    const guideText = await readFile(filePath, "utf-8").catch(() => "");
    const searchResult = searchGuide(question, guideText);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "AI API 키가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      instructions: searchResult
        ? `당신은 React 학습 페이지의 안내 챗봇입니다. 아래 검색된 안내 자료만 참고하여 질문에 한국어로 답하세요.
        \n\n[검색된 안내 자료]\n${searchResult}`
        : "당신은 React를 처음 배우는 학습자를 위한 친절한 가이드입니다. 질문에 한국어로 쉽고 짧게 답하고, 필요하면 간단한 예시를 포함하세요.",
      input: question,
    });

    return Response.json({
      answer: response.output_text || "답변을 생성하지 못했습니다. 다시 질문해 주세요.",
    });
  } catch (error) {
    console.error("Guide chatbot request failed:", error);
    return Response.json(
      { error: "가이드 답변을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
};
