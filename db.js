/**
 * db.js — PostgreSQL connection pool (Railway / any Postgres)
 * ---------------------------------------------------------------
 * Import this single file from everywhere:
 *   const db = require("./db");
 *   const rows = await db.query("SELECT ...", [params]);
 *
 * Set in .env:
 *   DATABASE_URL=postgresql://user:pass@host:port/dbname
 *   (On Railway it is automatically injected, no need to set it manually)
 */

require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway Postgres always requires SSL; for local dev without SSL,
  // set DB_SSL=false in .env
  ssl:
    process.env.DB_SSL === "false"
      ? false
      : { rejectUnauthorized: false },
  max: 10,           // max 10 concurrent connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// lightweight connectivity check on startup
pool.on("connect", () => {
  console.log("[db] PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("[db] Unexpected pool error:", err.message);
});

/**
 * db.query(text, params) — takes a connection from the pool and runs the query
 * @returns {Promise<import("pg").QueryResult>}
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "production") {
      console.log(`[db] query (${duration}ms) rows=${res.rowCount}`);
    }
    return res;
  } catch (err) {
    console.error("[db] query error:", err.message, "\nSQL:", text);
    throw err;
  }
}

/**
 * db.getClient() — get a dedicated client for transactions
 * Usage:
 *   const client = await db.getClient();
 *   try {
 *     await client.query("BEGIN");
 *     ...
 *     await client.query("COMMIT");
 *   } catch(e) {
 *     await client.query("ROLLBACK"); throw e;
 *   } finally {
 *     client.release();
 *   }
 */
async function getClient() {
  return pool.connect();
}

/**
 * db.healthCheck() — use for Railway health probes
 */
async function healthCheck() {
  const res = await pool.query("SELECT NOW() AS now");
  return res.rows[0].now;
}

module.exports = { query, getClient, healthCheck, pool };
