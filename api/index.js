// FamilyTree-Backend/api/index.js
const express = require("express");
const router = express.Router();

const testDbRouter = require("./test-db");
const familyMembersMod = require("./familymembers");
const usersRouter = require("./users");

console.log("🟢 Users router imported:", !!usersRouter);

function pickRouter(name, mod) {
  if (!mod) return null;
  if (typeof mod === "function") return mod;
  if (mod && typeof mod.router === "function") return mod.router;
  console.warn(`[api] Skipping mount for "${name}" — not an express router.`);
  return null;
}

const familyMembersRouter = pickRouter("familymembers", familyMembersMod);

// Try optional modules
let relationshipsRouter = null;
try {
  relationshipsRouter = pickRouter("relationships", require("./relationships"));
} catch {}

// Required mounts
router.use("/test-db", testDbRouter);
if (familyMembersRouter) router.use("/familymembers", familyMembersRouter);
router.use("/users", usersRouter);
console.log("🟢 Users router mounted at /api/users");

// Optional mounts
if (relationshipsRouter) router.use("/relationships", relationshipsRouter);

module.exports = router;