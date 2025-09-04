import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Weather icon component
const WeatherIcon = ({ condition, size = "text-4xl" }) => {
  const getIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('clear')) {
      return '☀️'; // Sun icon
    } else if (conditionLower.includes('cloud')) {
      return '☁️'; // Cloud icon
    } else if (conditionLower.includes('rain')) {
      return '🌧️'; // Rain icon
    } else if (conditionLower.includes('drizzle')) {
      return '🌦️'; // Drizzle icon
    } else if (conditionLower.includes('thunder')) {
      return '⛈️'; // Thunderstorm icon
    } else if (conditionLower.includes('snow')) {
      return '❄️'; // Snow icon
    } else if (conditionLower.includes('mist') || conditionLower.includes('fog')) {
      return '🌫️'; // Mist icon
    } else {
      return '🌡️'; // Default thermometer icon
    }
  };

  return <span className={`${size} inline-block`}>{getIcon(condition)}</span>;
};

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError(null);
    setWeather(null);
    setForecast([]);

    try {
      // Current weather
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== 200) throw new Error(data.message);
      setWeather(data);

      // 5-day forecast
      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
      );
      const forecastData = await resForecast.json();
      if (forecastData.cod !== "200") throw new Error(forecastData.message);

      // Take 1 forecast per day (at 12:00)
      const daily = forecastData.list.filter((f) =>
        f.dt_txt.includes("12:00:00")
      );
      setForecast(daily);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-indigo-500 p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Weather App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
            />
            <Button onClick={fetchWeather} disabled={loading}>
              {loading ? "Loading..." : "Search"}
            </Button>
          </div>

          {error && <p className="text-center text-red-500">{error}</p>}

          {/* Current Weather */}
          {weather && (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">{weather.name}</h2>
              <div className="flex justify-center items-center">
                <WeatherIcon condition={weather.weather[0].main} size="text-6xl" />
              </div>
              <p className="capitalize text-lg">{weather.weather[0].description}</p>
              <p className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</p>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Feels like</p>
                  <p className="font-semibold">{Math.round(weather.main.feels_like)}°C</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Humidity</p>
                  <p className="font-semibold">{weather.main.humidity}%</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Wind</p>
                  <p className="font-semibold">{weather.wind.speed} m/s</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Pressure</p>
                  <p className="font-semibold">{weather.main.pressure} hPa</p>
                </div>
              </div>
            </div>
          )}

          {/* Forecast */}
          {forecast.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-center mb-3">5-Day Forecast</h3>
              <div className="grid grid-cols-1 gap-3">
                {forecast.map((day) => (
                  <Card key={day.dt} className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <WeatherIcon condition={day.weather[0].main} />
                      <div>
                        <p className="font-medium">
                          {new Date(day.dt_txt).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric"
                          })}
                        </p>
                        <p className="text-sm capitalize text-gray-600">{day.weather[0].description}</p>
                      </div>
                    </div>
                    <p className="font-bold text-lg">{Math.round(day.main.temp)}°C</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
