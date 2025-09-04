import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
            />
            <Button onClick={fetchWeather} disabled={loading}>
              {loading ? "Loading..." : "Search"}
            </Button>
          </div>

          {error && <p className="text-center text-red-500">{error}</p>}

          {/* Current Weather */}
          {weather && (
            <div className="text-center">
              <h2 className="text-xl font-semibold">{weather.name}</h2>
              <p className="capitalize">{weather.weather[0].description}</p>
              <p className="text-3xl font-bold">{weather.main.temp}°C</p>
            </div>
          )}

          {/* Forecast */}
          {forecast.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-center">5-Day Forecast</h3>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {forecast.map((day) => (
                  <Card key={day.dt} className="p-3 text-center">
                    <p className="font-medium">
                      {new Date(day.dt_txt).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>
                    <p>{day.weather[0].description}</p>
                    <p className="font-bold">{day.main.temp}°C</p>
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
