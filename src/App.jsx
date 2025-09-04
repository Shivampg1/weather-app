import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Weather icon component
const WeatherIcon = ({ condition, size = "text-4xl" }) => {
  const getIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('clear')) {
      return '☀️';
    } else if (conditionLower.includes('cloud')) {
      return '☁️';
    } else if (conditionLower.includes('rain')) {
      return '🌧️';
    } else if (conditionLower.includes('drizzle')) {
      return '🌦️';
    } else if (conditionLower.includes('thunder')) {
      return '⛈️';
    } else if (conditionLower.includes('snow')) {
      return '❄️';
    } else if (conditionLower.includes('mist') || conditionLower.includes('fog')) {
      return '🌫️';
    } else {
      return '🌡️';
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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (city.length > 2) {
      fetchCitySuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [city]);

  const fetchCitySuggestions = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const displayName = suggestion.state 
      ? `${suggestion.name}, ${suggestion.state}` 
      : `${suggestion.name}, ${suggestion.country}`;
    setCity(displayName);
    setShowSuggestions(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Get city name from coordinates
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
          );
          const locationData = await response.json();
          
          if (locationData.length > 0) {
            const location = locationData[0];
            const displayName = location.state 
              ? `${location.name}, ${location.state}` 
              : `${location.name}, ${location.country}`;
            setCity(displayName);
            fetchWeatherWithCoords(latitude, longitude);
          }
        } catch (error) {
          setError("Error getting your location");
          console.error("Error getting location:", error);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setError("Unable to retrieve your location. Please check your location settings.");
        console.error("Error getting location:", error);
        setGettingLocation(false);
      }
    );
  };

  const fetchWeatherWithCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    setWeather(null);
    setForecast([]);

    try {
      // Current weather
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== 200) throw new Error(data.message || "Failed to fetch weather data");
      setWeather(data);

      // 5-day forecast
      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
      );
      const forecastData = await resForecast.json();
      if (forecastData.cod !== "200") throw new Error(forecastData.message || "Failed to fetch forecast data");

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

  const fetchWeather = async () => {
    // Extract just the city name without state for the API call
    const cityNameOnly = city.split(',')[0].trim();
    
    if (!cityNameOnly) {
      setError("Please enter a city name");
      return;
    }
    
    setLoading(true);
    setError(null);
    setWeather(null);
    setForecast([]);

    try {
      // First get coordinates for the city
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityNameOnly}&limit=1&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
      );
      const geoData = await geoResponse.json();
      
      if (geoData.length === 0) {
        // Try a more flexible search if exact match not found
        const fallbackGeoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${cityNameOnly}&limit=5&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
        );
        const fallbackGeoData = await fallbackGeoResponse.json();
        
        if (fallbackGeoData.length === 0) {
          throw new Error(`City "${cityNameOnly}" not found. Please try a nearby larger city.`);
        }
        
        // Use the first result from the broader search
        const { lat, lon } = fallbackGeoData[0];
        fetchWeatherWithCoords(lat, lon);
        return;
      }
      
      const { lat, lon } = geoData[0];
      fetchWeatherWithCoords(lat, lon);
    } catch (err) {
      setError(err.message);
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
          <div className="relative">
            <div className="flex gap-2">
              <Input
                placeholder="Enter city (e.g., Mumbai, London)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
                onFocus={() => city.length > 2 && setShowSuggestions(true)}
                className="flex-1"
              />
              <Button onClick={fetchWeather} disabled={loading}>
                {loading ? "Loading..." : "Search"}
              </Button>
            </div>
            
            <div className="mt-2">
              <Button 
                onClick={getCurrentLocation} 
                disabled={gettingLocation}
                variant="outline"
                className="w-full"
              >
                {gettingLocation ? "Detecting Location..." : "Use My Current Location"}
              </Button>
            </div>
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((item, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSuggestionClick(item)}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.state ? `${item.state}, ${item.country}` : item.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-200 rounded-md">
              <p className="text-red-700 text-center">{error}</p>
              <p className="text-red-600 text-sm text-center mt-1">
                Try entering a nearby larger city or check your spelling.
              </p>
            </div>
          )}

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
