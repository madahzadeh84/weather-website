// src/utils/weatherIcons.ts
export const getWeatherIcon = (main: string): string => {
  const icons: Record<string, string> = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Haze: "🌫️",
    Fog: "🌫️",
  };
  return icons[main] || "🌡️";
};

export const getAQILabel = (aqi: number) => {
  const map: Record<number, { text: string; color: string }> = {
    1: { text: "خوب", color: "#22c55e" },
    2: { text: "قابل قبول", color: "#84cc16" },
    3: { text: "متوسط", color: "#eab308" },
    4: { text: "ناسالم برای حساس‌ها", color: "#f97316" },
    5: { text: "بسیار ناسالم", color: "#ef4444" },
  };
  return map[aqi] || { text: "نامشخص", color: "#94a3b8" };
};
