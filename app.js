require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const jwt = require("jsonwebtoken");
const apiRouter = require("./api");
const { router: authRouter } = require("./auth");
const { db } = require("./database");
const initSocketServer = require("./socket-server");

const app = express();

const PORT = process.env.PORT || 8080;

// CORS — allow vercel + localhost during dev
const VERCL_PROD = "https://family-tree-frontend-alpha.vercel.app"; // <- exact URL, no trailing slash
const FALLBACK_DEV_ORIGIN = "http://localhost:3000";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || VERCL_PROD; // let env override if you want

// Optional: allow all vercel previews too
const vercelPreviewRegex = /\.vercel\.app$/;

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser tools (no Origin header)
      if (!origin) return cb(null, true);

      const allowed =
        origin === FRONTEND_ORIGIN ||
        origin === FALLBACK_DEV_ORIGIN ||
        vercelPreviewRegex.test(origin); // comment this line out if you don't want previews

      if (allowed) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true, // allow cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // no need to list Cookie
  })
);

// (Optional) quick visibility when debugging:
app.use((req, _res, next) => {
  if (req.headers.origin) {
    console.log("Incoming Origin:", req.headers.origin);
  }
  next();
});

// trust proxy so secure cookies work on Render
app.set("trust proxy", 1);

// body parser
app.use(express.json());

// CORS — allow vercel + localhost during dev
const allowedOrigins = new Set([
  FRONTEND_ORIGIN,
  FALLBACK_DEV_ORIGIN, // keep for local testing
]);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser tools (no origin) and allowed origins
      if (!origin || allowedOrigins.has(origin)) return cb(null, true);
      cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// cookies + logs + static
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// Health check for Render
app.get("/health", (_req, res) => res.status(200).send("ok"));

app.use("/api", apiRouter);
app.use("/auth", authRouter);

// error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Server error" });
});

const runApp = async () => {
  try {
    await db.sync(); // or db.authenticate() if you don't want sync in prod
    console.log("✅ Connected to the database");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

    initSocketServer(server);
    console.log("🧦 Socket server initialized");
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
    process.exit(1);
  }
};

runApp();

module.exports = app;
