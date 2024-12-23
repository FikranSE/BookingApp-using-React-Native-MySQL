const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection 

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sisibooking',
    waitForConnections: true, 
    connectionLimit: 10,
    queueLimit: 0
  });
  
  async function testConnection() {
    try {
      const connection = await pool.getConnection();
      console.log('Koneksi berhasil ke database!');
      connection.release(); // Pastikan koneksi dilepaskan setelah selesai
    } catch (error) {
      console.error('Error connecting to the database:', error.message);
    }
  }
  
  testConnection();

// Create users table
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clerk_id VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();

// Middleware to verify Clerk token
const verifyClerkToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify token with Clerk API
    // Implementation depends on your Clerk setup
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// API Routes
app.post('/(api)/user', async (req, res) => {
  try {
    const { name, email, clerkId, phone } = req.body;

    // Validate required fields
    if (!name || !email || !clerkId) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const connection = await pool.getConnection();
    
    // Check if user already exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ? OR clerk_id = ?',
      [email, clerkId]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ 
        error: 'User already exists' 
      });
    }

    // Insert new user
    const [result] = await connection.query(
      'INSERT INTO users (name, email, clerk_id, phone) VALUES (?, ?, ?, ?)',
      [name, email, clerkId, phone]
    );

    connection.release();

    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId,
      clerkId
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Internal server error'
    });
  }
});

// Get user profile
app.get('/(api)/user/:clerkId', verifyClerkToken, async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, name, email, phone, created_at FROM users WHERE clerk_id = ?',
      [clerkId]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});