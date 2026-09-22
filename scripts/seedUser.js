/**
 * scripts/seedUser.js — creates the demo login user (run once)
 * Run command: node scripts/seedUser.js
 * Set DEMO_USER_EMAIL / DEMO_USER_PASSWORD in .env, otherwise defaults will be used.
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../db");

async function seed() {
  const email = process.env.DEMO_USER_EMAIL || "demo@client.com";
  const password = process.env.DEMO_USER_PASSWORD || "demo1234";
  const hash = await bcrypt.hash(password, 10);

  try {
    await db.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [email, hash]
    );
    console.log(`[seedUser] ✅ Demo user ready — email: ${email}, password: ${password}`);
  } catch (err) {
    console.error("[seedUser] ❌ Failed:", err.message);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

seed();
