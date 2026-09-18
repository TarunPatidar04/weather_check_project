import { useState } from "react";
import "./App.css";


function App() {
  const [city, setCity] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
    const response = await fetch(
  `http://localhost:5000/analytics/city/${encodeURIComponent(
    city.trim()
  )}`
);

      const data = await response.json();
      console.log("response : ",response)

      if (!response.ok) {
        throw new Error(data.message || "Weather fetch failed");
      }

      // Backend `/analytics/city/:name` returns a simplified `weatherData` shape.
      // Map that shape directly into `result` to avoid accessing missing fields.
      setResult({
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        temperature: data.temperature,
        // preserve any backend-provided warning and forecast
        warning: data.warning ?? null,
        forecast: Array.isArray(data.forecast) ? data.forecast : [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>🌤️ Weather Check</h1>

      <div className="form">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fetchWeather();
            }
          }}
          placeholder="Enter city name"
        />

        <button
          onClick={fetchWeather}
          disabled={!city.trim() || loading}
        >
          {loading ? "Loading..." : "Get Weather"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="weather-card">
          <h2>{result.city}</h2>

          <h1>{result.temperature}°C</h1>

          {result.forecast && result.forecast.length > 0 && (
            <p>📅 Forecast days: {result.forecast.length}</p>
          )}

          <p>
            📍 Latitude: {result.latitude}
          </p>

          <p>
            📍 Longitude: {result.longitude}
          </p>

          {result.warning && (
            <div className="warning">⚠️ {result.warning}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;