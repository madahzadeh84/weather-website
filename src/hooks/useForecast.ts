// src/hooks/useForecast.ts
import { useState, useEffect } from "react";

interface ForecastItem {
  dt: number;
  main: { temp: number };
  weather: { description: string; icon: string }[];
}

interface ForecastData {
  list: ForecastItem[];
}

const API_KEY = import.meta.env.VITE_OWM_API_KEY;

export function useForecast(city: string) {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return;
    const controller = new AbortController();

    async function fetchForecast() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: city,
          appid: API_KEY,
          units: "metric",
          lang: "fa",
        });
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?${params}`,
          { signal: controller.signal }
        );
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchForecast();
    return () => controller.abort();
  }, [city]);

  return { data, loading };
}
