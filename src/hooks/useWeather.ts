// src/hooks/useWeather.ts
import { useEffect, useState } from "react";

export interface WeatherData {
  name: string;
  coord: { lat: number; lon: number };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{ description: string; icon: string }>;
  wind: { speed: number };
}

export function useWeather(city: string | null, lat?: number | null, lon?: number | null) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hasCoords = lat !== undefined && lon !== undefined && lat !== null && lon !== null;
    if (!city && !hasCoords) return;

    const controller = new AbortController();

    async function fetchWeather() {
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_OWM_API_KEY;
        let url = "";

        if (hasCoords) {
          url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fa&appid=${apiKey}`;
        } else {
          url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=fa&appid=${apiKey}`;
        }

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error("خطا در دریافت اطلاعات آب‌وهوا");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "خطایی رخ داده است");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();

    return () => {
      controller.abort();
    };
  }, [city, lat, lon]);

  return { data, loading, error };
}
