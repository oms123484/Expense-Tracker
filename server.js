const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from current directory
app.use(express.static(__dirname));

let dbPool = null;
let dbError = null;

// Initialize MySQL database connection
async function connectDatabase() {
  try {
    console.log('Connecting to MySQL host:', process.env.DB_HOST || 'localhost');
    
    // Create base connection to check database existence
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    const dbName = process.env.DB_NAME || 'expense_tracker';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();
    console.log(`Database '${dbName}' verified/created.`);

    // Create pool with database specified
    dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create transactions table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(10) NOT NULL, -- 'income' or 'expense'
        category VARCHAR(50) NOT NULL,
        description VARCHAR(255) DEFAULT '',
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    dbError = null;
    console.log('MySQL Database initialized successfully. Transactions table verified.');
  } catch (error) {
    dbError = error;
    console.error('================================================================');
    console.error('DATABASE CONNECTION ERROR: Failed to connect to MySQL!');
    console.error('Reason:', error.message);
    console.error('Please ensure:');
    console.error('1. Your MySQL server is running.');
    console.error('2. Your .env file database credentials are correct.');
    console.error('================================================================');
  }
}

// Middleware to ensure DB connection is active before processing requests
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') && dbError) {
    return res.status(500).json({
      error: 'Database connection is currently unavailable.',
      details: dbError.message,
      setupHelp: 'Check if MySQL is running and verify the .env database credentials.'
    });
  }
  next();
});

// REST API Routes

// 1. Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM transactions ORDER BY date DESC, id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// 2. Add a new transaction
app.post('/api/transactions', async (req, res) => {
  const { amount, type, category, description, date } = req.body;

  // Validation
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number.' });
  }
  if (!type || (type !== 'income' && type !== 'expense')) {
    return res.status(400).json({ error: 'Type must be "income" or "expense".' });
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({ error: 'Category is required.' });
  }
  if (!date) {
    return res.status(400).json({ error: 'Date is required.' });
  }

  try {
    const cleanDescription = description ? description.trim() : '';
    const cleanCategory = category.trim();
    
    const [result] = await dbPool.query(
      'INSERT INTO transactions (amount, type, category, description, date) VALUES (?, ?, ?, ?, ?)',
      [Number(amount), type, cleanCategory, cleanDescription, date]
    );

    // Fetch the newly created record
    const [newRows] = await dbPool.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
    res.status(201).json(newRows[0]);
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// 3. Delete a transaction
app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await dbPool.query('DELETE FROM transactions WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    res.json({ message: 'Transaction successfully deleted.', id: Number(id) });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Default route (serves frontend)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start DB connection and Express server
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});
