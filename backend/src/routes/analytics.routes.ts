import { Router, Request, Response } from "express";
import getWeather from "../services/weather.services";
import { db } from "../db/db";
import { weatherData } from "../types/weather.types";
import { log } from "console";

const router = Router();

const saveCitySnapshot = async (weather: weatherData) => {
  try {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const cityRes = await client.query(
        `
        INSERT INTO cities
          (name, latitude, longitude, updated_at)
        VALUES
          ($1, $2, $3, NOW())
        ON CONFLICT (name)
        DO UPDATE SET
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          updated_at = NOW()
        RETURNING id
        `,
        [
          weather.city,
          weather.latitude,
          weather.longitude,
        ]
      );

      const cityId = cityRes.rows[0].id;

      await client.query(
        `
        INSERT INTO weather_snapshots
          (city_id, temperature, forecast)
        VALUES
          ($1, $2, $3)
        `,
        [
          cityId,
          weather.temperature,
          JSON.stringify(weather.forecast),
        ]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.warn("DB snapshot save failed:", error);
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn("DB unavailable, skipping weather save:", error);
  }
};

router.get(
  "/city/:name",
  async (req: Request, res: Response) => {
    try {
      const cityName = req.params.name;


      const weather = await getWeather(cityName);

      console.log("✅ Weather received:", weather);

      res.status(200).json(weather);
    } catch (error) {
      console.error("❌ Weather route error:", error);

      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      });
    }
  }
);
// POST /analytics/cities
router.post(
  "/cities",
  async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        cities?: string[];
        threshold?: number;
      };

      const cities = Array.isArray(body.cities)
        ? body.cities
        : [];

      const threshold =
        typeof body.threshold === "number"
          ? body.threshold
          : 35;

      if (!cities.length) {
        return res.status(400).json({
          error:
            "cities is required and must be a non-empty array",
        });
      }

      const results = await Promise.allSettled(
        cities.map((city) => getWeather(city))
      );

      const successes: weatherData[] = results
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<weatherData> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);

      if (!successes.length) {
        return res.status(502).json({
          error: "Failed to fetch weather",
        });
      }

      for (const weather of successes) {
        void saveCitySnapshot(weather);
      }

      const temps = successes.map((weather) => ({
        city: weather.city,
        temp: weather.temperature,
      }));

      const sum = temps.reduce(
        (total, item) => total + item.temp,
        0
      );

      const averageTemperature = sum / temps.length;

      let highest = temps[0];
      let lowest = temps[0];

      for (const item of temps) {
        if (item.temp > highest.temp) {
          highest = item;
        }

        if (item.temp < lowest.temp) {
          lowest = item;
        }
      }

      const hotCities = temps
        .filter((item) => item.temp > threshold)
        .map((item) => item.city);

      res.json({
        averageTemperature: Number(
          averageTemperature.toFixed(2)
        ),
        highestTemperature: highest,
        lowestTemperature: lowest,
        hotCities,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

export default router;