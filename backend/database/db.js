require("dotenv").config();

const { Pool } = require("pg");

let pool;

function getPool() {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  pool = new Pool({
    connectionString,
    ssl: connectionString.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false
  });

  return pool;
}

async function query(text, params = []) {
  return getPool().query(text, params);
}

async function getClient() {
  return getPool().connect();
}

async function verifyConnection() {
  await query("SELECT 1");
}

module.exports = {
  getClient,
  query,
  verifyConnection
};
