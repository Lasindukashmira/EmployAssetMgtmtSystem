/**
 * src/config/db.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Data-layer abstraction.
 *
 * Current mode  → returns the in-memory store from src/data/store.js
 * Azure SQL mode → uncomment the mssql block below and fill .env credentials.
 *                  Controllers stay UNCHANGED because they receive the same
 *                  store reference; only the query methods inside store differ.
 *
 * To switch to Azure SQL:
 *   1. Fill DB_HOST, DB_NAME, DB_USER, DB_PASSWORD in .env
 *   2. Uncomment the mssql pool block below
 *   3. Replace the in-memory CRUD in controllers with sql.query() calls
 */

require('dotenv').config();
const store = require('../data/store');

/* ── Future Azure SQL block (uncomment when DB is ready) ──────────────────────
const sql = require('mssql');

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  options: {
    encrypt: true,           // Required for Azure SQL
    trustServerCertificate: false,
  },
};

let pool;
const getPool = async () => {
  if (!pool) {
    pool = await sql.connect(sqlConfig);
    console.log('✅ Connected to Azure SQL Database');
  }
  return pool;
};
module.exports = { getPool, sql };
──────────────────────────────────────────────────────────────────────────────*/

// Current mode: expose the in-memory store directly
module.exports = store;
