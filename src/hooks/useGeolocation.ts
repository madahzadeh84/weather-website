import { useState, useCallback } from "react";

export interface Coordinates {
  lat: number | null;
  lon: number | null;
}

export function useGeolocation() {
  const [coords, setCoords] = useState<Coordinates>({ lat: null, lon: null });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("مرورگر شما از سرویس Geolocation (موقعیت‌یابی) پشتیبانی نمی‌کند.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = "موفق به دریافت موقعیت مکانی شما نشدیم.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = "دسترسی به موقعیت مکانی توسط کاربر رد شد.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMessage = "اطلاعات موقعیت مکانی در دسترس نیست.";
        } else if (err.code === err.TIMEOUT) {
          errorMessage = "زمان درخواست دریافت موقعیت مکانی به پایان رسید (Timeout).";
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // ۵ دقیقه کش در لایه سخت‌افزار
      }
    );
  }, []);

  const clearCoords = useCallback(() => {
    setCoords({ lat: null, lon: null });
  }, []);

  return { coords, loading, error, getCurrentLocation, clearCoords };
}
