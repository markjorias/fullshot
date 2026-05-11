const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get cart items
router.get('/:userId', async (req, res) => {
  const sql = `
    SELECT ci.id, ci.quantity, ci.variation, ci.size, COALESCE(ci.item_price, mi.price) AS price, mi.name, mi.image_url, mi.category
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    JOIN menu_items mi ON ci.menu_item_id = mi.id
    WHERE c.user_id = $1
  `;
  try {
    const result = await db.query(sql, [req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add item to cart
router.post('/:userId/add', async (req, res) => {
  const { menu_item_id, quantity, variation, size, item_price } = req.body;
  const userId = req.params.userId;

  try {
    const cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartResult.rows.length === 0) {
      return res.status(500).json({ error: 'Cart not found' });
    }
    const cartId = cartResult.rows[0].id;

    const checkSql = 'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND menu_item_id = $2 AND COALESCE(variation, \'\') = COALESCE($3, \'\') AND COALESCE(size, \'\') = COALESCE($4, \'\')';
    const existingResult = await db.query(checkSql, [cartId, menu_item_id, variation, size]);

    if (existingResult.rows.length > 0) {
      await db.query('UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2', [quantity || 1, existingResult.rows[0].id]);
      res.json({ success: true, updated: true });
    } else {
      const insertSql = 'INSERT INTO cart_items (cart_id, menu_item_id, quantity, variation, size, item_price) VALUES ($1, $2, $3, $4, $5, $6)';
      await db.query(insertSql, [cartId, menu_item_id, quantity || 1, variation, size, item_price]);
      res.json({ success: true, added: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete cart item
router.delete('/item/:cartItemId', async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE id = $1', [req.params.cartItemId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update cart item quantity
router.put('/item/:cartItemId', async (req, res) => {
  const { quantity } = req.body;
  try {
    await db.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, req.params.cartItemId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
