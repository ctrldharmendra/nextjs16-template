// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// MINIMAL VERSION - Just connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'website_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection (optional but recommended)
const dbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error(' Database connection failed:', error.message);
    return false;
  }
};

module.exports = { pool, dbConnection };