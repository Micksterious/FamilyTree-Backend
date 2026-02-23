require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { doubleCsrf } = require("csrf-csrf");
const apiRouter = require("./api");
const { router: authRouter } = require("./auth");
const { db } = require("./database");
const initSocketServer = require("./socket-server");

const app = express();
const PORT = process.env.PORT || 8080;

// CORS — allow vercel + localhost during dev
const VERCEL_PROD = "https://family-tree-frontend-alpha.vercel.app";
const FALLBACK_DEV_ORIGIN = "http://localhost:3000";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || VERCEL_PROD;

// Optional: allow all vercel previews too
const vercelPreviewRegex = /\.vercel\.app$/;

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8000", VERCEL_PROD],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
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

// cookies + logs + static
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// ─── CSRF — Double Submit Cookie pattern ──────────────────────────────────────
const IS_PROD = process.env.NODE_ENV === "production";

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: IS_PROD ? "__Host-x-csrf-token" : "x-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: IS_PROD,
    path: "/",
  },
  size: 64,
  // ignoredMethods must be an array — csrf-csrf does new Set(ignoredMethods)
  // We only skip GET/HEAD/OPTIONS here; login/signup exemption is handled
  // by the csrfExcept wrapper below.
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getTokenFromRequest: (req) =>
    req.headers["x-csrf-token"] ?? req.body?._csrf,
});

// ─── Selective CSRF middleware ────────────────────────────────────────────────
// Wraps doubleCsrfProtection and bypasses it for unauthenticated entry points.
// Login and signup have no session cookie yet, so there is nothing to hijack.
const CSRF_EXEMPT_PATHS = ["/login", "/signup"];

const csrfExcept = (exemptPaths) => (req, res, next) => {
  // req.path inside a mounted router is relative (e.g. "/login" not "/auth/login")
  if (exemptPaths.includes(req.path)) {
    return next();
  }
  return doubleCsrfProtection(req, res, next);
};

// ─── CSRF token endpoint ──────────────────────────────────────────────────────
app.get("/csrf-token", (req, res) => {
  const token = generateToken(req, res);
  res.json({ csrfToken: token });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.status(200).send("ok"));

// ─── Routers ──────────────────────────────────────────────────────────────────
app.use("/api", doubleCsrfProtection, apiRouter);
app.use("/auth", csrfExcept(CSRF_EXEMPT_PATHS), authRouter);

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.warn("⚠️  CSRF token validation failed:", req.method, req.path);
    return res.status(403).json({ error: "Invalid or missing CSRF token" });
  }
  console.error(err.stack);
  res.status(500).send({ error: "Server error" });
});

const runApp = async () => {
  try {
    await db.sync();
    console.log("✅ Connected to the database");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

    server.on("error", (err) => {
      console.error("❌ Server error:", err);
    });

    initSocketServer(server);
    console.log("🧦 Socket server initialized");
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
    process.exit(1);
  }
};

runApp().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});

module.exports = app;