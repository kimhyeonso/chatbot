import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

export const GET = async( request:Request) => {
  try{
    const {searchParams} = new URL(request.url)
    const city = searchParams.get('city')
    if(!city){
      return Response.json({
        message: '도시 이름을 입력해 주세요',
      },
    {
      status : 400
    })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?
      q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=kr`)

        if(!res.ok){
          return Response.json({
            message : '날씨 정보룰 받지 못했습니다'
          },{
            status : 404
          })
        }
        const data = await res.json()
        return Response.json(data)
  }catch{
    return Response.json({
      message : '날씨 요청 중에 오류가 발생'
    },{
      status : 500
    })
  }
 
};
