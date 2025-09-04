import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  WiDaySunny, 
  WiCloudy, 
  WiRain, 
  WiSnow, 
  WiThunderstorm, 
  WiFog,
  WiDayCloudy
} from "react-icons/wi";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to get appropriate weather icon based on condition
  const getWeatherIcon = (condition) => {
    const conditionId = condition.id;
    const mainCondition = condition.main.toLowerCase();
    
    // Clear
    if (conditionId === 800) return <WiDaySunny className="text-yellow-500 text-4xl" />;
    
    // Clouds
    if (mainCondition.includes("cloud")) {
      if (conditionId === 801 || conditionId === 802) {
        return <WiDayCloudy className="text-gray-400 text-4xl" />;
      }
      return <WiCloudy className="text-gray-500 text-4xl" />;
    }
    
    // Rain
    if (mainCondition.includes("rain")) return <WiRain className="text-blue-500 text-4xl" />;
    
    // Drizzle
    if (mainCondition.includes("drizzle")) return <WiRain className="text-blue-400 text-4xl" />;
    
    // Thunderstorm
    if (mainCondition.includes("thunderstorm")) return <WiThunderstorm className="text-purple-600 text-4xl" />;
    
    // Snow
    if (mainCondition.includes("snow")) return <WiSnow className="text-blue-200 text-4xl" />;
    
    // Atmosphere (mist, fog, haze, etc.)
    if (mainCondition.includes("mist") || mainCondition.includes("fog") || 
        mainCondition.includes("haze") || mainCondition.includes("dust")) {
      return <WiFog className="text-gray-300 text-4xl" />;
    }
    
    // Default icon
    return <WiDaySunny className="text-yellow-500 text-4xl" />;
  };

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
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {getWeatherIcon(weather.weather[0])}
              </div>
              <h2 className="text-xl font-semibold">{weather.name}</h2>
              <p className="capitalize">{weather.weather[0].description}</p>
              <p className="text-3xl font-bold">{Math.round(weather.main.temp)}°C</p>
              <div className="flex justify-center gap-4 mt-2 text-sm">
                <p>Humidity: {weather.main.humidity}%</p>
                <p>Wind: {Math.round(weather.wind.speed * 3.6)} km/h</p>
              </div>
            </div>
          )}

          {/* Forecast */}
          {forecast.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-center mb-3">5-Day Forecast</h3>
              <div className="grid grid-cols-5 gap-2">
                {forecast.map((day) => (
                  <div key={day.dt} className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium">
                      {new Date(day.dt_txt).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>
                    <div className="my-1">
                      {getWeatherIcon(day.weather[0])}
                    </div>
                    <p className="text-xs capitalize">{day.weather[0].description}</p>
                    <p className="text-sm font-bold">{Math.round(day.main.temp)}°C</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
