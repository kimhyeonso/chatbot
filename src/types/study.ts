export type Studymode = "explain" | "quiz" | "hint"
export type StudyItem = {
    id: number
    title: string
    description: string
    mode: Studymode
}

export type AiRequet = {
    message : string
    mode : Studymode
}

export type AiResponse = {
    answer : string
    quesion : string
    questionAnswer : string
    hint : string
}
