// src/hooks/useForecast.ts
import { useEffect, useState } from "react";

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

export interface ForecastData {
  list: ForecastItem[];
}

export function useForecast(
  city: string | null,
  lat?: number | null,
  lon?: number | null
) {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasCoords = lat !== undefined && lon !== undefined && lat !== null && lon !== null;
    if (!city && !hasCoords) return;

    const controller = new AbortController();

    async function fetchForecast() {
      setLoading(true);
      try {
        const apiKey = import.meta.env.VITE_OWM_API_KEY;
        let url = "";

        if (hasCoords) {
          url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fa&appid=${apiKey}`;
        } else {
          url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=fa&appid=${apiKey}`;
        }

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error("Failed to fetch forecast");
        }
        
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchForecast();

    return () => {
      controller.abort();
    };
  }, [city, lat, lon]);

  return { data, loading };
}
