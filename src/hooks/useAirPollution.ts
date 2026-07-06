// src/hooks/useAirPollution.ts
import { useState, useEffect } from "react";

interface AirData {
  list: {
    main: { aqi: number };
    components: { pm2_5: number; co: number };
  }[];
}

const API_KEY = import.meta.env.VITE_OWM_API_KEY;

export function useAirPollution(lat: number | null, lon: number | null) {
  const [data, setData] = useState<AirData | null>(null);

  useEffect(() => {
    if (lat == null || lon == null) return;

    async function fetchAir() {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        appid: API_KEY,
      });
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?${params}`
      );
      const json = await res.json();
      setData(json);
    }

    fetchAir();
  }, [lat, lon]);

  return data;
}
