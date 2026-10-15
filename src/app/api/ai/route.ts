import OpenAI from "openai";
import type { AiRequest, Studymode } from "@/types/study";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const isStudyMode = (value: unknown): value is Studymode => {
    return value === "explain" || value === "quiz" || value === "hint";
};

const getInstructions = (mode: Studymode) => {
    if(mode === 'explain'){
        return `너는 react 초보자를 쉽게 가르쳐주는 선생님이야
        사용자의 질문을 아주 쉽게 설명해줘
        가능하면 간단한 코드 예제도 보여줘`
    }
    if(mode === 'quiz'){
        return `너는 react 초보자를 쉽게 가르쳐주는 선생님이야
        사용자가 입력한 주제와 관련된 아주 쉬운 문제 1개를 만들어줘
        정답은 바로 알려주지 마`
    }
    
    return `너는 react 초보자를 쉽게 가르쳐주는 선생님이야
    정답을 알려주지 말고, 문제를 해결할 수 있는 힌트를 제공해줘`

};

export const POST = async (request: Request) => {
    let body: AiRequest;

    try {
        body = await request.json() as AiRequest;
    } catch {
        return Response.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
    }

    const { message, mode, currentQuiz, previousQuestions = [] } = body;

    if (typeof message !== "string" || !message.trim()) {
        return Response.json({ message: "질문을 입력해 주세요." }, { status: 400 });
    }

    if (!isStudyMode(mode)) {
        return Response.json({ message: "학습 방식을 확인해 주세요." }, { status: 400 });
    }

    if (mode === "hint" && !currentQuiz?.trim()) {
        return Response.json({ message: "먼저 퀴즈를 만들어 주세요." }, { status: 400 });
    }

    try {
        if (mode === "quiz") {
            const quizResponse = await openai.responses.create({
                model: "gpt-4o-mini",
                instructions: `${getInstructions(mode)}\n문제와 정답을 각각 작성해. 정답은 사용자가 버튼을 누르기 전까지 화면에 표시되지 않아.`,
                input: `학습 주제: ${message.trim()}\n최근에 만든 문제: ${previousQuestions.slice(-10).join("\n") || "없음"}`,
                text: {
                    format: {
                        type: "json_schema",
                        name: "react_quiz",
                        strict: true,
                        schema: {
                            type: "object",
                            properties: {
                                question: { type: "string" },
                                answer: { type: "string" },
                            },
                            required: ["question", "answer"],
                            additionalProperties: false,
                        },
                    },
                },
            });

            const parsed = JSON.parse(quizResponse.output_text) as { question?: unknown; answer?: unknown };

            if (typeof parsed.question !== "string" || typeof parsed.answer !== "string") {
                throw new Error("Invalid quiz response");
            }

            return Response.json({ answer: parsed.question, quizAnswer: parsed.answer });
        }

        const input = mode === "hint"
            ? `현재 퀴즈:\n${currentQuiz}\n\n학습자 요청:\n${message.trim()}`
            : message.trim();

        const response = await openai.responses.create({
            model: "gpt-4o-mini",
            instructions: getInstructions(mode),
            input,

        });

        return Response.json({ answer: response.output_text });
    } catch {
        return Response.json({ message: "AI 요청 중 오류가 발생했습니다." }, { status: 500 });
    }
};
