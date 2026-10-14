const koreanCityQueries: Record<string, string> = {
  서울: "Seoul,KR",
  부산: "Busan,KR",
  인천: "Incheon,KR",
  대구: "Daegu,KR",
  대전: "Daejeon,KR",
  광주: "Gwangju,KR",
  울산: "Ulsan,KR",
  세종: "Sejong,KR",
  수원: "Suwon,KR",
  제주: "Jeju City,KR",
  제주시: "Jeju City,KR",
};

export const GET = async (request: Request): Promise<Response> => {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city")?.trim();

    if (!city) {
      return Response.json(
        { message: "도시 이름을 입력해 주세요." },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return Response.json(
        { message: "날씨 API 키가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const cityQuery = koreanCityQueries[city] ?? city;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityQuery)}&appid=${apiKey}&units=metric&lang=kr`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return Response.json(
        { message: "날씨 정보를 받아오지 못했습니다." },
        { status: response.status },
      );
    }

    return Response.json(await response.json());
  } catch {
    return Response.json(
      { message: "날씨 요청 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
};
