import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";

export interface GeocodingSuggestion {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// حافظه کش در سطح ماژول برای جلوگیری از درخواست‌های تکراری شبکه (Memory Cache)
const geocodingCache = new Map<string, GeocodingSuggestion[]>();

export function useGeocoding(query: string) {
  const [suggestions, setSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // کاهش تأخیر دی‌بانس به 300 میلی‌ثانیه برای بهبود نرخ پاسخ‌دهی (Responsiveness)
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const trimmed = debouncedQuery.trim().toLowerCase();

    if (!trimmed || trimmed.length < 3) {
      setSuggestions([]);
      return;
    }

    // بررسی وجود داده در حافظه کش (Cache Hit)
    if (geocodingCache.has(trimmed)) {
      setSuggestions(geocodingCache.get(trimmed) || []);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function fetchSuggestions() {
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_OWM_API_KEY;
        // دریافت حداکثر 10 نتیجه برای بررسی دقیق‌تر و فیلترینگ بهتر
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          trimmed
        )}&limit=10&appid=${apiKey}`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error("خطا در دریافت لیست پیشنهادی شهرها");
        }

        const data: GeocodingSuggestion[] = await res.json();

        // سیستم رتبه‌بندی هوشمند نتایج بر اساس اولویت انطباق (Exact Match > Starts With > Contains)
        const sortedData = [...data].sort((a, b) => {
          const aFa = a.local_names?.fa?.toLowerCase() || "";
          const bFa = b.local_names?.fa?.toLowerCase() || "";
          const aEn = a.name.toLowerCase();
          const bEn = b.name.toLowerCase();

          const getScore = (name: string) => {
            if (name === trimmed) return 1; // تطابق دقیق بالاترین امتیاز را دارد
            if (name.startsWith(trimmed)) return 2;
            if (name.includes(trimmed)) return 3;
            return 4;
          };

          const scoreA = Math.min(getScore(aFa), getScore(aEn));
          const scoreB = Math.min(getScore(bFa), getScore(bEn));

          return scoreA - scoreB;
        });

        geocodingCache.set(trimmed, sortedData);
        setSuggestions(sortedData);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "خطایی رخ داده است");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  return { suggestions, loading, error, setSuggestions };
}
