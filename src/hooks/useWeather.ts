// src/hooks/useWeather.ts
import { useState, useEffect } from "react";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
}

const API_KEY = import.meta.env.VITE_OWM_API_KEY;

export function useWeather(city: string) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) return;

    const controller = new AbortController();

    async function fetchWeather() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          q: city,
          appid: API_KEY,
          units: "metric",
          lang: "fa",
        });

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?${params}`,
          { signal: controller.signal }
        );

        //https://api.openweathermap.org/data/2.5/weather?q="tehran"&appid="dasdsaf"&units="metric"&lang="fa"

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError("خطا در دریافت اطلاعات آب‌وهوا");
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    return () => controller.abort();
  }, [city]);

  return { data, loading, error };
}
