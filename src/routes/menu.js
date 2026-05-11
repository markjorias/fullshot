const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get menu items
router.get('/', async (req, res) => {
  const category = req.query.category;
  let sql = 'SELECT * FROM menu_items';
  let params = [];

  if (category && category !== 'All') {
    sql += ' WHERE category = $1';
    params.push(category);
  }

  try {
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM menu_items WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add menu item
router.post('/', async (req, res) => {
  const { name, description, price, category, image_url, variations, sizes, addons } = req.body;
  const sql = `INSERT INTO menu_items (name, description, price, category, image_url, variations, sizes, addons) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;
  const params = [name, description, price, category, image_url, variations, sizes, JSON.stringify(addons)];
  
  try {
    const result = await db.query(sql, params);
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update menu item
router.put('/:id', async (req, res) => {
  const { name, description, price, category, image_url, variations, sizes, addons } = req.body;
  const sql = `UPDATE menu_items SET name = $1, description = $2, price = $3, category = $4, 
               image_url = $5, variations = $6, sizes = $7, addons = $8, updated_at = CURRENT_TIMESTAMP 
               WHERE id = $9`;
  const params = [name, description, price, category, image_url, variations, sizes, JSON.stringify(addons), req.params.id];
  
  try {
    await db.query(sql, params);
    res.json({ updated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete menu item
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
