import { weatherData } from "../types/weather.types";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

const API_KEY = process.env.OPENWEATHER_API_KEY;

const getWeather = async (city: string): Promise<weatherData> => {
  if (!API_KEY) {
    throw new Error("OPENWEATHER_API_KEY is missing");
  }

  return new Promise((resolve, reject) => {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?q=${encodeURIComponent(city)}` +
      `&units=metric` +
      `&appid=${API_KEY}`;

    const request = https.get(
      url,
      {
        family: 4,
        timeout: 10000,
      },
      (response) => {
        let body = "";

        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("end", () => {
          try {
            const data = JSON.parse(body);

            if (response.statusCode !== 200) {
              reject(
                new Error(
                  data.message || `Weather API error: ${response.statusCode}`
                )
              );
              return;
            }

            resolve({
              city: data.name,
              latitude: data.coord.lat,
              longitude: data.coord.lon,
              temperature: data.main.temp,
              forecast: [],
              warning:
                data.main.temp > 35
                  ? `Temperature exceeds 35°C (${data.main.temp}°C)`
                  : null,
            });
          } catch {
            reject(new Error("Invalid weather API response"));
          }
        });
      }
    );

    request.on("timeout", () => {
      request.destroy();
      reject(new Error("Weather API request timeout"));
    });

    request.on("error", (error) => {
      reject(error);
    });
  });
};

export default getWeather;