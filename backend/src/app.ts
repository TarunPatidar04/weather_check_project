import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyticsRoutes from "./routes/analytics.routes"

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

const PORT = Number(process.env.PORT) || 5000;

app.get("/", (req, res) => {
  res.json({
    message: "wethare",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/analytics", analyticsRoutes)

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
