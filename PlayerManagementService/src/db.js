const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

const caCert = fs.readFileSync('ca.pem', 'utf8');

const db = mysql.createPool({
  host: process.env.DB_HOST,       
  port: parseInt(process.env.DB_PORT, 10), 
  user: process.env.DB_USER,       
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,  
  ssl: {
    ca: caCert,
    rejectUnauthorized: true,
  },
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
})();

module.exports = db;