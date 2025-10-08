// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export default function App() {
  const [city, setCity] = useState("");       
  const [query, setQuery] = useState("");     
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const controllerRef = useRef(null);

  
  useEffect(() => {
    if (!query) return; 

    
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    const signal = controller.signal;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      setWeather(null);

      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          query
        )}&appid=${API_KEY}&units=metric`;

        const res = await fetch(url, { signal });

        if (!res.ok) {
          if (res.status === 404) throw new Error("City not found");
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        setWeather(data);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    return () => controller.abort();
  }, [query]);

  const onSubmit = (e) => {
    e.preventDefault();
    const trimmed = city.trim();
    if (!trimmed) return;
    setQuery(trimmed);
  };

  const Spinner = () => (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      Loading...
    </div>
  );

  const getBgClass = (main) => {
    if (!main) return "bg-gray-100";
    const key = main.toLowerCase();
    switch (key) {
      case "clear":
        return "bg-gradient-to-b from-blue-100 to-blue-200";
      case "clouds":
        return "bg-gradient-to-b from-gray-200 to-gray-300";
      case "rain":
      case "drizzle":
      case "thunderstorm":
        return "bg-gradient-to-b from-blue-200 to-gray-400";
      case "snow":
        return "bg-gradient-to-b from-blue-50 to-white";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${getBgClass(weather?.weather?.[0]?.main)}`}>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Weather App</h1>

        <form onSubmit={onSubmit} className="flex gap-2 mb-4">
          <input
            aria-label="City name"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter city (e.g. London)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            type="submit"
            aria-label="Search weather"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Search
          </button>
        </form>

        {loading && (
          <div className="mb-4">
            <Spinner />
          </div>
        )}

        {error && (
          <div className="mb-4 text-red-600 bg-white px-4 py-3 rounded shadow">
            {error}
          </div>
        )}

        <AnimatePresence>
          {weather && !loading && !error && (
            <motion.div
              key={weather.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              layout
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {weather.name}, {weather.sys?.country}
                  </h2>
                  <p className="text-sm text-gray-500 capitalize">{weather.weather[0].description}</p>
                </div>

                <img
                  width={64}
                  height={64}
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Feels: {Math.round(weather.main.feels_like)}°C</div>
                  <div>Humidity: {weather.main.humidity}%</div>
                  <div>Wind: {Math.round(weather.wind.speed)} m/s</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
