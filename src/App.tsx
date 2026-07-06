// src/App.tsx
import { useState } from "react";
import { useWeather } from "./hooks/useWeather";
import { useForecast } from "./hooks/useForecast";
import { useAirPollution } from "./hooks/useAirPollution";
import "./App.css";

const aqiLabels = ["", "خوب", "متوسط", "ناسالم برای گروه‌های حساس", "ناسالم", "خطرناک"];

export default function App() {
  const [city, setCity] = useState("Tehran");
  const [inputValue, setInputValue] = useState("Tehran");

  const { data, loading, error } = useWeather(city);
  const { data: forecast } = useForecast(city);
  const airQuality = useAirPollution(
    data?.coord?.lat ?? null,
    data?.coord?.lon ?? null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCity(inputValue);
  };

  console.log(data);
  

  return (
    <div className="weather-container">
      <div className="weather-card">
        <h1 className="title">🌤️ آب‌وهوا</h1>

        <form onSubmit={handleSubmit} className="search-form">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="نام شهر را وارد کنید..."
            className="city-input"
          />
          <button type="submit" className="search-btn">
            جستجو
          </button>
        </form>

        {loading && <p className="status">در حال دریافت اطلاعات...</p>}
        {error && <p className="error">{error}</p>}

        {data && (
          <div className="weather-info">
            <h2 className="city-name">{data.name}</h2>
            <img
              src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
              alt="آیکون آب‌وهوا"
              className="weather-icon"
            />
            <p className="temp">{Math.round(data.main.temp)}°C</p>
            <p className="description">{data.weather[0].description}</p>

            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-icon">🌡️</span>
                <span className="label">احساس دما</span>
                <span className="value">{Math.round(data.main.feels_like)}°C</span>
              </div>
              <div className="stat-box">
                <span className="stat-icon">💧</span>
                <span className="label">رطوبت</span>
                <span className="value">{data.main.humidity}%</span>
              </div>
              <div className="stat-box">
                <span className="stat-icon">💨</span>
                <span className="label">سرعت باد</span>
                <span className="value">{data.wind.speed} m/s</span>
              </div>
              {airQuality && (
                <div className="stat-box">
                  <span className="stat-icon">🫁</span>
                  <span className="label">کیفیت هوا</span>
                  <span className={`value aqi-${airQuality.list[0].main.aqi}`}>
                    {aqiLabels[airQuality.list[0].main.aqi]}
                  </span>
                </div>
              )}
            </div>

            {forecast && (
              <div className="forecast-list">
                {forecast.list && forecast.list
                  .filter((_, i) => i % 8 === 0)
                  .map((item) => (
                    <div key={item.dt} className="forecast-item">
                      <p className="forecast-day">
                        {new Date(item.dt * 1000).toLocaleDateString("fa-IR", {
                          weekday: "short",
                        })}
                      </p>
                      <img
                        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                        alt=""
                        className="forecast-icon"
                      />
                      <p className="forecast-temp">{Math.round(item.main.temp)}°</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
