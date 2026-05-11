const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Add feedback
router.post('/', async (req, res) => {
  const { name, email, first_time, service, rating, recommend, comments } = req.body;
  const sql = `INSERT INTO feedback (name, email, first_time, service, rating, recommend, comments) 
               VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
  const params = [name, email, first_time, service, rating, recommend, comments];
  
  try {
    const result = await db.query(sql, params);
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all feedback
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM feedback ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete feedback
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM feedback WHERE id = $1', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
