'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './GuideChatbot.module.scss'
import React from 'react'
type ChatMessage = {
    role : 'user' | 'assistant'
    content: string
}

const GuideChatbot = () => {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState<ChatMessage[]>([
        {
            role : 'assistant',
            content : '안녕하세요! 홈페이지 이용 방법을 안내해 드립니다'
        }
    ])
    const [loading, setLoading] = useState(false)
    const [question, setQuestion] = useState('')

    const messageRef = useRef<HTMLDivElement | null>(null)    

    //질문이나 답변이 추가되면 맨 아래로 이동
    useEffect (()=>{
        if(messageRef.current){
            messageRef.current.scrollTop = messageRef.current.scrollHeight
        }
    },[message, loading])

    const handleSend = async()=> {
        if(!question.trim()) return
        // input에서 받은 question 을 사용자라는 role붙여 사용하기
        const userMessage: ChatMessage = {
            role: 'user',
            content: question.trim(),
        };

        setMessage((prev) => [...prev, userMessage]);
        setQuestion('');
        setLoading(true)

        // 서버로 (guide/route.ts) 요청 :: 사용자 질문을 받아서 openAi 에게 보내고 받는 역할
        try{
            const response = await fetch('/api/guide', {
                method :'POST',
                headers : {'Content-Type' : 'application/json'},
                body : JSON.stringify({
                    question : userMessage.content
                })
            })

            const data = await response.json()

            if(!response.ok){
                throw new Error(data.error || '답변 요청 실패')
            }

            const botMessage:ChatMessage = {
                role : 'assistant',
                content : data.answer || '답변을 생성하지 못했습니다'
            }

            setMessage((prev) => [...prev, botMessage]);
        }catch(err){
            console.error('가이드 챗봇 오류', err)
            setMessage((prev) => [...prev, {role : 'assistant', content : '오류가 발생했습니다, 다시 질문해주세요'}]);
            
        }finally{
            setLoading(false)
        }
    }
  return (
    <main className={styles.chatbot}>
        {
            open && (
                <div>
                    <div>
                        <h3>홈페이지 가이드</h3>
                        <button onClick={() => setOpen(false)}>X</button>
                    </div>
                    <div className={styles.messages} ref={messageRef} >
                        {
                            message.map((item,index) => (
                                <p key={index} className={item.role === 'user' ? styles.userMessage : styles.answer}>
                                    {item.content}
                                </p>
                            ))
                        }
                        <div>
                            <input type="text" placeholder='궁금한 내용을 입력 예시 : 홈페이지에 관해서 알려주세요' 
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter'){
                                    handleSend()      
                                }
                            }}
                            disabled = {loading}
                            />
                            <button onClick={handleSend}> {loading ? '대기중' : '전송'}</button>
                        </div>
                    </div>
                </div>
            )
        }
        <button onClick={()=> setOpen(!open)}>
            {open ? "x" : "💬"}
        </button>
    </main>
  )
}

export default GuideChatbot
