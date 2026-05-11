const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all orders (admin)
router.get('/', async (req, res) => {
  const sql = `
    SELECT o.id, o.customer_name, o.total_price, o.status, o.created_at,
           (SELECT STRING_AGG(mi.name || ' x' || oi.quantity, ', ') 
            FROM order_items oi 
            JOIN menu_items mi ON oi.item_id = mi.id 
            WHERE oi.order_id = o.id) as items_summary
    FROM orders o
    ORDER BY o.created_at DESC
  `;
  try {
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  const orderId = req.params.id;
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
    await client.query('DELETE FROM orders WHERE id = $1', [orderId]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user orders
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order details
router.get('/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  
  try {
    const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orderResult.rows[0];

    const itemsSql = `
      SELECT oi.quantity, mi.name, mi.price, mi.image_url, mi.category
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.id
      WHERE oi.order_id = $1
    `;
    const itemsResult = await db.query(itemsSql, [orderId]);
    res.json({ ...order, items: itemsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Checkout
router.post('/checkout', async (req, res) => {
  const { user_id, customer_name, total_price } = req.body;
  const orderId = `ORD-${Date.now()}`;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const orderSql = 'INSERT INTO orders (id, user_id, customer_name, total_price, status) VALUES ($1, $2, $3, $4, \'Received\')';
    await client.query(orderSql, [orderId, user_id, customer_name, total_price]);

    const transferSql = `
      INSERT INTO order_items (order_id, item_id, quantity)
      SELECT $1, menu_item_id, quantity
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE c.user_id = $2
    `;
    await client.query(transferSql, [orderId, user_id]);

    await client.query('DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)', [user_id]);

    await client.query('COMMIT');
    res.json({ success: true, orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
