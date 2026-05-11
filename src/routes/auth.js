const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Register
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  
  try {
    // 1. Create User
    const userSql = `INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id`;
    const userResult = await db.query(userSql, [first_name, last_name, email, password]);
    const userId = userResult.rows[0].id;
    
    // 2. Create Cart for User
    await db.query('INSERT INTO carts (user_id) VALUES ($1)', [userId]);
    res.json({ id: userId, first_name, last_name, email });
  } catch (err) {
    if (err.message.includes('unique constraint')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT id, first_name, last_name, email, role FROM users WHERE email = $1 AND password = $2';
  
  try {
    const result = await db.query(sql, [email, password]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
