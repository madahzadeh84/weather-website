import React, { useState, useEffect, useRef } from "react";
import { useWeather } from "./hooks/useWeather";
import { useForecast } from "./hooks/useForecast";
import { useAirPollution } from "./hooks/useAirPollution";
import { useGeolocation } from "./hooks/useGeolocation";
import { useFavorites } from "./hooks/useFavorites";
import { useGeocoding } from "./hooks/useGeocoding";
import type { GeocodingSuggestion } from "./hooks/useGeocoding";
import { useTheme } from "./hooks/useTheme";
import "../public/assets/css/App.css"

const aqiLabels = [
  "",
  "خوب",
  "متوسط",
  "ناسالم برای گروه‌های حساس",
  "ناسالم",
  "خطرناک",
];

export default function App() {
  const [city, setCity] = useState<string | null>("Tehran");
  const [inputValue, setInputValue] = useState("Tehran");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // نگهداشتن مختصات شهر انتخاب شده برای جلوگیری از بروز ابهام در نام‌های تکراری
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number | null;
    lon: number | null;
  }>({
    lat: null,
    lon: null,
  });

  // شاخص (Index) مربوط به هدایت کیبورد روی منوی پیشنهادات
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const {
    coords,
    loading: geoLoading,
    error: geoError,
    getCurrentLocation,
    clearCoords,
  } = useGeolocation();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const {
    suggestions,
    loading: geoSuggestLoading,
    setSuggestions,
  } = useGeocoding(inputValue);

  // اولویت‌دهی به مختصات GPS، سپس مختصات انتخاب شده از جست‌وجو و در نهایت نام متنی شهر
  const targetLat = coords.lat !== null ? coords.lat : selectedCoords.lat;
  const targetLon = coords.lon !== null ? coords.lon : selectedCoords.lon;
  const targetCity = targetLat !== null ? null : city;

  // واکشی داده‌های آب‌وهوا
  const { data, loading, error } = useWeather(targetCity, targetLat, targetLon);
  const { data: forecast, loading: forecastLoading } = useForecast(
    targetCity,
    targetLat,
    targetLon,
  );

  const airQuality = useAirPollution(
    data?.coord?.lat ?? targetLat,
    data?.coord?.lon ?? targetLon,
  );

  const { theme, toggleTheme } = useTheme();

  // هماهنگ‌سازی فیلد ورودی پس از موقعیت‌یابی موفق توسط GPS
  useEffect(() => {
    if (data?.name && coords.lat !== null) {
      setInputValue(data.name);
      setCity(data.name);
      setSelectedCoords({ lat: null, lon: null });
    }
  }, [data?.name, coords.lat]);

  // ریست کردن ایندکس فوکوس در هنگام تغییر نتایج جست‌وجو
  useEffect(() => {
    setFocusedIndex(-1);
  }, [suggestions]);

  // بستن لیست پیشنهادات در صورت کلیک در محیط خارج از محدوده
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // پیدا کردن یک تطابق دقیق از لیست موجود در صورت فشردن کلید Enter
    const exactMatch = suggestions.find(
      (s) =>
        s.name.toLowerCase() === inputValue.trim().toLowerCase() ||
        s.local_names?.fa?.toLowerCase() === inputValue.trim().toLowerCase(),
    );

    if (exactMatch) {
      handleSuggestionClick(exactMatch);
    } else {
      clearCoords();
      setSelectedCoords({ lat: null, lon: null });
      setCity(inputValue.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: GeocodingSuggestion) => {
    clearCoords();
    const displayName = suggestion.local_names?.fa || suggestion.name;
    setInputValue(displayName);
    setCity(displayName);
    setSelectedCoords({ lat: suggestion.lat, lon: suggestion.lon });
    setSuggestions([]);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleGeoClick = () => {
    setSelectedCoords({ lat: null, lon: null });
    getCurrentLocation();
    setShowSuggestions(false);
  };

  // مدیریت رویدادهای صفحه‌کلید (Keyboard Event Handlers)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        e.preventDefault();
        handleSuggestionClick(suggestions[focusedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  };

  const isFavorite = city ? favorites.includes(city) : false;

  const handleFavoriteToggle = () => {
    if (!city) return;
    if (isFavorite) {
      removeFavorite(city);
    } else {
      addFavorite(city);
    }
  };

  const isAppLoading = loading || forecastLoading || geoLoading;

  return (
    <div className="weather-container">
      <div className="weather-card">
        <div className="top-bar">
          <h1 className="title">🌤️ آب‌وهوا</h1>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "فعال‌سازی حالت روشن" : "فعال‌سازی حالت تیره"
            }
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* فیلد جستجو به همراه کامپوننت پیشنهاد خودکار */}
        <div className="search-wrapper" ref={dropdownRef}>
          <form onSubmit={handleSubmit} className="search-form">
            <input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="نام شهر را وارد کنید..."
              className="city-input"
            />
            <button type="submit" className="search-btn">
              جستجو
            </button>
            <button
              type="button"
              onClick={handleGeoClick}
              className="geo-btn"
              title="موقعیت فعلی من"
            >
              📍
            </button>
          </form>

          {/* منوی کشویی پیشنهادات شهرها */}
          {showSuggestions && (suggestions.length > 0 || geoSuggestLoading) && (
            <ul className="suggestions-dropdown">
              {geoSuggestLoading && (
                <li className="suggestion-status">در حال جستجو...</li>
              )}
              {suggestions.map((suggestion, index) => {
                const faName = suggestion.local_names?.fa;
                const displayName = faName
                  ? `${faName} (${suggestion.name})`
                  : suggestion.name;
                const stateRegion = suggestion.state
                  ? `, ${suggestion.state}`
                  : "";
                const isFocused = index === focusedIndex;

                return (
                  <li
                    key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`suggestion-item ${isFocused ? "focused" : ""}`}
                  >
                    <span className="suggestion-city">{displayName}</span>
                    <span className="suggestion-country">
                      {stateRegion} [{suggestion.country}]
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* لیست علاقه‌مندی‌ها */}
        {favorites.length > 0 && (
          <div className="favorites-container">
            <span className="fav-title">محبوب‌ها:</span>
            <div className="favorites-list">
              {favorites.map((favCity) => (
                <span
                  key={favCity}
                  className={`fav-chip ${city === favCity ? "active" : ""}`}
                  onClick={() => {
                    clearCoords();
                    setSelectedCoords({ lat: null, lon: null });
                    setInputValue(favCity);
                    setCity(favCity);
                  }}
                >
                  {favCity}
                  <button
                    type="button"
                    className="fav-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(favCity);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* مدیریت خطاها */}
        {(error || geoError) && (
          <div className="error">
            {error && <p>{error}</p>}
            {geoError && <p>{geoError}</p>}
          </div>
        )}

        {/* وضعیت لودینگ */}
        {isAppLoading && (
          <p className="status">در حال دریافت اطلاعات آب‌وهوا...</p>
        )}

        {/* نمایش اطلاعات اصلی هواشناسی */}
        {data && !isAppLoading && (
          <div className="weather-info">
            <div className="city-header">
              <h2 className="city-name">{data.name}</h2>
              <button
                type="button"
                className={`fav-toggle-btn ${isFavorite ? "fav-active" : ""}`}
                onClick={handleFavoriteToggle}
              >
                {isFavorite ? "★" : "☆"}
              </button>
            </div>

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
                <span className="value">
                  {Math.round(data.main.feels_like)}°C
                </span>
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
              {airQuality && airQuality.list && (
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
                {forecast.list &&
                  forecast.list
                    .filter((_, i) => i % 8 === 0)
                    .map((item) => (
                      <div key={item.dt} className="forecast-item">
                        <p className="forecast-day">
                          {new Date(item.dt * 1000).toLocaleDateString(
                            "fa-IR",
                            {
                              weekday: "short",
                            },
                          )}
                        </p>
                        <img
                          src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                          alt=""
                          className="forecast-icon"
                        />
                        <p className="forecast-temp">
                          {Math.round(item.main.temp)}°
                        </p>
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
