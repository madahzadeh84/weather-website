import { useState, useEffect } from 'react';

interface CityResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export const useCitySearch = (query: string) => {
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
            query
          )}&limit=5&appid=${apiKey}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error('خطا در دریافت پیشنهادات');

        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }, 350); // debounce

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { suggestions, loading, error };
};
