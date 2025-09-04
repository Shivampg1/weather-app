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

// Time of day component
const TimeOfDayIcon = ({ timeOfDay, size = "text-2xl" }) => {
  const getTimeIcon = (time) => {
    switch(time) {
      case 'morning':
        return '🌅'; // Sunrise
      case 'afternoon':
        return '☀️'; // Sun
      case 'evening':
        return '🌇'; // Sunset
      case 'night':
        return '🌙'; // Moon
      default:
        return '🕒'; // Clock
    }
  };

  return <span className={`${size} inline-block`}>{getTimeIcon(timeOfDay)}</span>;
};

// Function to get time of day
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// Farming Advisory Component
const FarmingAdvisory = ({ weatherData }) => {
  if (!weatherData) return null;
  
  const temp = weatherData.main.temp;
  const humidity = weatherData.main.humidity;
  const windSpeed = weatherData.wind.speed;
  const rain = weatherData.weather[0].main.toLowerCase().includes('rain');
  const description = weatherData.weather[0].description.toLowerCase();
  
  let advice = "";
  let icon = "🌱";
  
  if (rain || description.includes('rain')) {
    advice = "⚠️ Rainfall expected - Good for natural irrigation but avoid field work and spraying";
    icon = "🌧️";
  } else if (temp > 35) {
    advice = "🌡️ Very hot conditions - Water crops in early morning or late evening";
    icon = "🔥";
  } else if (temp > 30 && humidity < 40) {
    advice = "🌡️ High temperature, low humidity - Consider irrigation for moisture-sensitive crops";
    icon = "💧";
  } else if (temp < 5) {
    advice = "❄️ Cold conditions - Protect sensitive crops and seedlings from frost damage";
    icon = "❄️";
  } else if (windSpeed > 6) {
    advice = "💨 Windy conditions - Not suitable for spraying chemicals. Secure loose items.";
    icon = "💨";
  } else if (temp >= 20 && temp <= 30 && humidity >= 50 && humidity <= 80) {
    advice = "✅ Excellent conditions for most farming activities - Good for planting and growth";
    icon = "✅";
  } else {
    advice = "🌾 Favorable conditions for most farming activities";
    icon = "🌾";
  }
  
  return (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h4 className="font-semibold text-yellow-800">कृषि सलाह / Farming Advisory</h4>
      </div>
      <p className="text-yellow-700 mt-1">{advice}</p>
    </div>
  );
};

// Soil Moisture Indicator Component
const SoilMoistureIndicator = ({ weatherData }) => {
  if (!weatherData) return null;
  
  const rain = weatherData.weather[0].main.toLowerCase().includes('rain');
  const humidity = weatherData.main.humidity;
  const temp = weatherData.main.temp;
  
  let moistureLevel = "Moderate";
  let moistureClass = "bg-blue-100 text-blue-800";
  let moistureIcon = "💧";
  
  if (rain || humidity > 80) {
    moistureLevel = "High (Waterlogged)";
    moistureClass = "bg-green-100 text-green-800";
    moistureIcon = "🌊";
  } else if (humidity < 30 || temp > 32) {
    moistureLevel = "Low (Dry)";
    moistureClass = "bg-red-100 text-red-800";
    moistureIcon = "🏜️";
  }
  
  return (
    <div className={`p-3 rounded-lg text-center ${moistureClass}`}>
      <div className="flex items-center justify-center gap-2">
        <span className="text-xl">{moistureIcon}</span>
        <p className="font-medium">मिट्टी की नमी / Soil Moisture: {moistureLevel}</p>
      </div>
    </div>
  );
};

// 7-Day Forecast Component for Farmers
const FarmForecast = ({ forecast }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-center mb-3">7-Day Farm Forecast</h3>
      <div className="grid grid-cols-1 gap-3">
        {forecast.map((day) => {
          const date = new Date(day.dt_txt);
          const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
          const isWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun';
          
          return (
            <Card key={day.dt} className={`p-3 flex items-center justify-between ${isWeekend ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center space-x-4">
                <WeatherIcon condition={day.weather[0].main} />
                <div>
                  <p className="font-medium">
                    {dayOfWeek}, {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    })}
                  </p>
                  <p className="text-sm capitalize text-gray-600">{day.weather[0].description}</p>
                  <p className="text-xs text-gray-500">Humidity: {day.main.humidity}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{Math.round(day.main.temp)}°C</p>
                <p className="text-sm text-gray-600">Feels: {Math.round(day.main.feels_like)}°C</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
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
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());

  // Update time of day every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

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
        setError("Unable to retrieve your location");
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
      if (data.cod !== 200) throw new Error(data.message);
      setWeather(data);

      // 7-day forecast (changed from 5-day)
      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
      );
      const forecastData = await resForecast.json();
      if (forecastData.cod !== "200") throw new Error(forecastData.message);

      // Get 7 days forecast (one reading per day)
      const daily = forecastData.list.filter((f, index) => index % 8 === 0).slice(0, 7);
      setForecast(daily);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    const cityNameOnly = city.split(',')[0].trim();
    
    if (!cityNameOnly) return;
    setLoading(true);
    setError(null);
    setWeather(null);
    setForecast([]);

    try {
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityNameOnly}&limit=1&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
      );
      const geoData = await geoResponse.json();
      
      if (geoData.length === 0) throw new Error("City not found");
      
      const { lat, lon } = geoData[0];
      
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== 200) throw new Error(data.message);
      setWeather(data);

      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
      );
      const forecastData = await resForecast.json();
      if (forecastData.cod !== "200") throw new Error(forecastData.message);

      const daily = forecastData.list.filter((f, index) => index % 8 === 0).slice(0, 7);
      setForecast(daily);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    switch(timeOfDay) {
      case 'morning':
        return { english: 'Good Morning', hindi: 'शुभ प्रभात' };
      case 'afternoon':
        return { english: 'Good Afternoon', hindi: 'नमस्कार' };
      case 'evening':
        return { english: 'Good Evening', hindi: 'शुभ संध्या' };
      case 'night':
        return { english: 'Good Night', hindi: 'शुभ रात्रि' };
      default:
        return { english: 'Hello', hindi: 'नमस्ते' };
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-indigo-500 p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">किसान मौसम ऐप / Farmer Weather App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Time of day greeting */}
          {weather && (
            <div className="flex flex-col items-center justify-center mb-2">
              <div className="flex items-center justify-center gap-2">
                <TimeOfDayIcon timeOfDay={timeOfDay} />
                <p className="text-lg font-medium">{getGreeting().english}!</p>
              </div>
              <p className="text-sm text-gray-700 mt-1">{getGreeting().hindi}!</p>
            </div>
          )}
          
          <div className="relative">
            <div className="flex gap-2">
              <Input
                placeholder="गाँव/शहर/Enter village/city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
                onFocus={() => city.length > 2 && setShowSuggestions(true)}
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
                {gettingLocation ? "Detecting Location..." : "मेरा स्थान Use My Location"}
              </Button>
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
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

              {/* Farming Features */}
              <SoilMoistureIndicator weatherData={weather} />
              <FarmingAdvisory weatherData={weather} />
            </div>
          )}

          {/* Forecast */}
          {forecast.length > 0 && (
            <FarmForecast forecast={forecast} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
