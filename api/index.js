// FamilyTree-Backend/api/index.js
const express = require("express");
const router = express.Router();

const testDbRouter = require("./test-db");
const familyMembersMod = require("./familymembers");

function pickRouter(name, mod) {
  if (!mod) return null;
  if (typeof mod === "function") return mod; // exported a router directly
  if (mod && typeof mod.router === "function") return mod.router; // { router, ... }
  console.warn(`[api] Skipping mount for "${name}" — not an express router.`);
  return null;
}

const familyMembersRouter = pickRouter("familymembers", familyMembersMod);

// Try optional modules
let relationshipsRouter = null;
try {
  relationshipsRouter = pickRouter("relationships", require("./relationships"));
} catch {}
let authRouter = null;
try {
  authRouter = pickRouter("auth", require("./auth"));
} catch {
  console.warn("⚠️ No auth router found, skipping mount.");
}

// Required mounts
router.use("/test-db", testDbRouter);
if (familyMembersRouter) router.use("/familymembers", familyMembersRouter);

// Optional mounts
if (relationshipsRouter) router.use("/relationships", relationshipsRouter);
if (authRouter) router.use("/auth", authRouter);

module.exports = router;
