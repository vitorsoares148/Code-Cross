const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { checkOrigin } = require("./middleware/checkOrigin");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const reviewsRoutes = require("./routes/reviews.routes");

const app = express();

const SECRET_KEY = process.env.SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

if (!SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined in .env");
}

// ======================================================
// CONFIGURAÇÕES
// ======================================================

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(checkOrigin);

// ======================================================
// ROTAS
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/reviews", reviewsRoutes);
module.exports = app;
