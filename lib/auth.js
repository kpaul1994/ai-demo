/**
 * lib/auth.js — Simple email/password login (JWT)
 * Per scope: no role/team management/SSO needed, just simple auth.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";

async function login(email, password) {
  const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = rows[0];
  if (!user) throw new Error("Invalid email or password");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Invalid email or password");

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  return { token, user: { id: user.id, email: user.email } };
}

/** Express middleware — use on protected routes */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing auth token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { login, requireAuth };
