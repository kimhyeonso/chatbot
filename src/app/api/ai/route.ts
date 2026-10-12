import OpenAI from "openai";
import type { AiRequet, Studymode} from "@/types/study";
import { getRequestInsightKey } from "next/dist/shared/lib/request-insights";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const Questget = (mode : Studymode) => {
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

}

export const POST = async (request : Request) =>{
    try{
        const body = await request.json()
        const {message, mode} = body
        
        if(!message?.trim()){
            return Response.json({message:'질문을 입력해 주세요'},{status:400})
        }

        const res = await openai.responses.create({
            model : 'gpt-4o-mini',
            instructions : Questget(mode),
            input : message,

        })
        
        return Response.json({
            answer : res.output_text
        })
    }catch{
        return Response.json({
            message : 'ai요청중에 오류가 발생하였습니다'
        },{
            status:500
        })
    }
}