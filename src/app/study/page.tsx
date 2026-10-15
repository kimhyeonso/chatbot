'use client'

import { useActionState, useState } from "react"
import { studyData } from "@/data/studyData"
import type { AiResponse, Studymode } from '@/types/study'
import styles from './page.module.scss'

/*  openai 활용시
    프론트(html, react) 에서 유저에게 data를 받습니다  ->
   서버에게 전송(로컬) :: 내 서버에게  ->
   로컬서버가 openai에게 data를 전송하고 응답을 받는다 ->
   로컬서버가 프론트에게 받은 응답을 다시 전송해 준다   */

const StudyPage = () => {
    const [mode, setMode] = useState<Studymode>('explain');
    const [message, setMessage] = useState('') //사용자의 질문
    const [answer, setAnswer] = useState('') // 답변
    const [loading, setLoading] = useState(false)
    const [quizAnswer, setQuizAnswer] = useState('') //ai가 만들어낸 퀴즈
    const [showAnswer, setShowAnswer] = useState(false) // ai가 만든 퀴즈의 답변이 있으면 보여주고 그렇지 않으면 감추는 역할
    const [previousQuestion, setPreviousQuestion] = useState<string[]>([])
    const [currentQuiz, setCurrentQuiz] = useState('')

   const handleQuestion = async () => {
      if(!message.trim()){
        setAnswer('질문을 입력해주세요')
        return
      }

      if(mode === 'hint' && !currentQuiz) {
        setAnswer('먼저 퀴즈를 출력해주세요')
        return
      }

      try{
        setLoading(true)
        setAnswer('')

        const res = await fetch("/api/ai", {
             method : "POST",
             headers : {"Content-Type" : "application/json",} ,
             body : JSON.stringify({
                 message,
                 mode,
                 currentQuiz,
                 previousQuestion //이전 퀴즈도 전달해야함
             })
        })

        if( !res.ok) {
            throw new Error("AI 요청 실패")
        }

        const data :  AiResponse = await res.json()
        setAnswer(data.answer);

        if(mode === 'quiz'){
          setCurrentQuiz(data.answer)
          setQuizAnswer(data.quesion || '')
          setShowAnswer(false)
          setPreviousQuestion((prev) => [...prev, data.answer].slice(-10))
        }
      }catch(err){
           setAnswer('AI 답변을 가져오지 못했습니다');
      }finally{
            setLoading(false)
      }
   }
  return (
    <main className={styles.main}>
           <div className={styles.intro}>
                    <p>OpenAI API 활용</p>
                    <h1>React 학습</h1>
                    <span>학습 방식을 선택하고 질문을 입력하세요.</span>
           </div>
          <section className={styles.panel}>
               <h2>학습방법</h2>
               <div className={styles.modeList}>
               {
                   studyData.map( (item) => (
                      <button className={`${styles.modeButton} ${mode === item.mode ? styles.selected : ''}`} key={item.id} onClick={ () =>setMode(item.mode) }>
                              <strong>
                                  {item.title}
                              </strong>
                              <p>{item.description}</p>
                      </button>
                   ))
               }
               </div>
               <div className={styles.question}>
                   <label htmlFor="message">질문</label>
                   <textarea id="message" placeholder="예시: useState를 쉽게 설명해 줘"
                      value={message} onChange={ (e) => setMessage(e.target.value)}
                   />
               </div>

               <button className={styles.submitButton} onClick={handleQuestion} disabled={loading} >
                     { loading ? "답변 생성 중" : "질문하기" }
                </button>
          </section>
          {
            answer && (
              <section className={styles.answerPanel}>
                    <h2>AI 답변</h2>
                    <p>
                      {answer}
                    </p>
                    {
                      mode === 'quiz' && quizAnswer && (
                        <>
                          <button onClick={() => setShowAnswer(!showAnswer)}>
                            {showAnswer ? '정답숨기기' : '답변보기'}
                          </button>
                          {
                            showAnswer&&(
                              <p>{quizAnswer}</p>
                            )
                          }
                        </>
                      )
                    }
              </section>
            )
          }
    </main>
  )
}

export default StudyPage
