'use client'

import { useState } from "react";
import type { WeatherData } from "@/types/weather";
import styles from './page.module.scss'


const WeatherPage = () => {
  const [city, setCity] = useState('서울')
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState('')

  const funWeather = async() => {
    if(!city.trim()){
      return
    }try {
      setLoading(true)
      setError('')
      setWeather(null)

      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      if(!res.ok){
        throw new Error('날씨 요청 실패')
      }

      const data: WeatherData = await res.json()
      setWeather(data)
    }catch{
      setError("날씨 정보를 가져오지 못했습니다")
    }finally{
      setLoading(false)      
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.title}>
        <p>OPEN WEATHER API</p>
        <h2>현재 날씨</h2>
        <span>도시 이름을 입력하시면 도시의 날씨를 알 수 있습니다</span>
      </div>
      <div className={styles.serachBox}>
        <input type="text" placeholder="예: 서울, 부산, Tokyo" value={city} onChange={(e) => setCity(e.target.value)}/>
        <button onClick={funWeather} disabled ={loading}>
          {loading ? '검색중' : "날씨 검색"}</button>
      </div>
      {
        error && (
          <div className={styles.error}>
            {error}
          </div>
        )
      }
      {
        weather && (
          <div className={styles.weatherCard}>
            <p className={styles.city}>{weather.name}</p>
            <h2>{Math.round(weather.main.temp)}°</h2>
            <p className={styles.description}>{weather.weather[0].description}</p>
            <div className={styles.details}>
              <p><span>바람</span>{weather.wind.speed} m/s</p>
              <p><span>상태</span>{weather.weather[0].main}</p>
            </div>
          </div>
        )
      }
    </main>
  );
};

export default WeatherPage;
