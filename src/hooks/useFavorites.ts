import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "weather_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // بارگذاری داده‌ها در زمان اولین اجرا
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("خطا در پردازش لیست علاقه‌مندی‌ها:", e);
      }
    }
  }, []);

  const addFavorite = useCallback((city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    setFavorites((prev) => {
      if (prev.includes(trimmed)) return prev;
      const updated = [trimmed, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((city: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((item) => item !== city);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { favorites, addFavorite, removeFavorite };
}
