export const getCustomWeatherIcon = (weather: any) => {
  const iconCode = weather?.weather?.[0]?.icon;
  const mainCondition = weather?.weather?.[0]?.main?.toLowerCase();
  const isNight = iconCode?.includes('n');

  const iconMap: Record<string, string> = {
    // Clear Sky
    "01d": "/icons/weather/clear-day.png", // icons8-sun-50.png
    "01n": "/icons/weather/clear-night.png", // icons8-night-50.png or icons8-new-moon-50.png

    // Clouds
    "02d": "/icons/weather/few-clouds-day.png", // icons8-clouds-48.png or icons8-clouds-50.png
    "02n": "/icons/weather/few-clouds-night.png", // Combination of night and clouds
    "03d": "/icons/weather/scattered-clouds-day.png", // icons8-clouds-48.png
    "03n": "/icons/weather/scattered-clouds-night.png", // Combination of night and clouds
    "04d": "/icons/weather/broken-clouds-day.png", // icons8-clouds-48.png
    "04n": "/icons/weather/broken-clouds-night.png", // Combination of night and clouds

    // Rain & Shower Rain
    "09d": "/icons/weather/shower-rain-day.png", // icons8-rain-cloud-50.png or icons8-wet-50.png
    "09n": "/icons/weather/shower-rain-night.png", // icons8-rainy-night-50.png
    "10d": "/icons/weather/rain-day.png", // icons8-rain-50.png
    "10n": "/icons/weather/rain-night.png", // icons8-rainy-night-50.png

    // Thunderstorm
    "11d": "/icons/weather/thunderstorm-day.png", // icons8-storm-50.png or icons8-cloud-lightning-48.png
    "11n": "/icons/weather/thunderstorm-night.png", // icons8-storm-50.png or icons8-cloud-lightning-48.png

    // Snow
    "13d": "/icons/weather/snow-day.png", // icons8-snow-50.png
    "13n": "/icons/weather/snow-night.png", // icons8-snow-50.png

    // Mist / Haze / Fog
    "50d": "/icons/weather/mist-day.png", // icons8-smoke-50.png or icons8-fog-50.png or icons8-haze-50.png
    "50n": "/icons/weather/mist-night.png", // icons8-smoke-50.png or icons8-fog-50.png or icons8-haze-50.png
  };

  // Use the icon map if the code is found
  if (iconMap[iconCode]) {
    return iconMap[iconCode];
  }

  // Fallback logic using main condition and day/night
  if (isNight) {
    switch (mainCondition) {
      case "clear": return "/icons/weather/clear-night.png";
      case "clouds": return "/icons/weather/broken-clouds-night.png"; // Default night cloud
      case "rain":
      case "drizzle": return "/icons/weather/rain-night.png";
      case "thunderstorm": return "/icons/weather/thunderstorm-night.png";
      case "snow": return "/icons/weather/snow-night.png";
      case "mist":
      case "fog": return "/icons/weather/mist-night.png";
      case "haze": return "/icons/weather/mist-night.png"; // Assuming haze is similar to mist at night
      case "smoke": return "/icons/weather/mist-night.png"; // Assuming smoke is similar to mist at night
      default: return "/icons/weather/clear-night.png"; // Default night icon
    }
  } else {
    switch (mainCondition) {
      case "clear": return "/icons/weather/clear-day.png";
      case "clouds": return "/icons/weather/broken-clouds-day.png"; // Default day cloud
      case "rain":
      case "drizzle": return "/icons/weather/rain-day.png";
      case "thunderstorm": return "/icons/weather/thunderstorm-day.png";
      case "snow": return "/icons/weather/snow-day.png";
      case "mist": return "/icons/weather/mist-day.png";
      case "fog": return "/icons/weather/mist-day.png";
      case "haze": return "/icons/weather/mist-day.png"; // Assuming haze is similar to mist during the day
      case "smoke": return "/icons/weather/mist-day.png"; // Assuming smoke is similar to mist during the day
      case "wind": return "/icons/weather/wind-day.png"; // For standalone wind condition
      case "hail": return "/icons/weather/hail-day.png"; // For standalone hail condition
      default: return "/icons/weather/clear-day.png"; // Default day icon
    }
  }
};
