const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));

const db = new sqlite3.Database('./coffee_shop.db');

app.get('/api/menu', (req, res) => {
  const category = req.query.category;
  let sql = 'SELECT * FROM menu_items';
  let params = [];

  if (category && category !== 'All') {
    sql += ' WHERE category = ?';
    params.push(category);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/menu/:id', (req, res) => {
  db.get('SELECT * FROM menu_items WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.json(row);
  });
});

app.post('/api/menu', (req, res) => {
  const { name, description, price, category, image_url, variations, sizes, addons } = req.body;
  const sql = `INSERT INTO menu_items (name, description, price, category, image_url, variations, sizes, addons) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [name, description, price, category, image_url, variations, sizes, JSON.stringify(addons)];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.put('/api/menu/:id', (req, res) => {
  const { name, description, price, category, image_url, variations, sizes, addons } = req.body;
  const sql = `UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, 
               image_url = ?, variations = ?, sizes = ?, addons = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?`;
  const params = [name, description, price, category, image_url, variations, sizes, JSON.stringify(addons), req.params.id];
  
  db.run(sql, params, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ updated: true });
  });
});

app.delete('/api/menu/:id', (req, res) => {
  db.run('DELETE FROM menu_items WHERE id = ?', req.params.id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: true });
  });
});

// Featured Products logic
app.get('/api/featured', (req, res) => {
  db.all('SELECT * FROM featured_items', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const featured = {
      bestseller: [],
      snacks: [],
      more_to_try: []
    };

    rows.forEach(row => {
      featured[row.section] = JSON.parse(row.item_ids);
    });

    if (req.query.full === 'true') {
      // Fetch full item details
      const allIds = [].concat(...Object.values(featured));
      if (allIds.length === 0) {
        res.json(featured);
        return;
      }

      const placeholders = allIds.map(() => '?').join(',');
      db.all(`SELECT * FROM menu_items WHERE id IN (${placeholders})`, allIds, (err, items) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        const fullFeatured = {
          bestseller: featured.bestseller.map(id => items.find(i => i.id === id)).filter(Boolean),
          snacks: featured.snacks.map(id => items.find(i => i.id === id)).filter(Boolean),
          more_to_try: featured.more_to_try.map(id => items.find(i => i.id === id)).filter(Boolean)
        };
        res.json(fullFeatured);
      });
    } else {
      res.json(featured);
    }
  });
});

app.post('/api/featured', (req, res) => {
  const featured = req.body;
  const sections = Object.keys(featured);
  
  const stmt = db.prepare('INSERT OR REPLACE INTO featured_items (section, item_ids) VALUES (?, ?)');
  
  let completed = 0;
  let hasError = false;

  sections.forEach(section => {
    stmt.run(section, JSON.stringify(featured[section]), (err) => {
      if (err && !hasError) {
        hasError = true;
        res.status(500).json({ error: err.message });
        return;
      }
      completed++;
      if (completed === sections.length && !hasError) {
        res.json({ success: true });
      }
    });
  });
  stmt.finalize();
});

// --- User Auth APIs ---
app.post('/api/auth/register', (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  
  // 1. Create User
  const userSql = `INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`;
  db.run(userSql, [first_name, last_name, email, password], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }
    
    const userId = this.lastID;
    
    // 2. Create Cart for User
    db.run('INSERT INTO carts (user_id) VALUES (?)', [userId], (err) => {
      if (err) {
        res.status(500).json({ error: 'User created but cart initialization failed' });
        return;
      }
      res.json({ id: userId, first_name, last_name, email });
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT id, first_name, last_name, email, role FROM users WHERE email = ? AND password = ?';
  
  db.get(sql, [email, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    res.json(row);
  });
});

// --- Cart APIs ---
app.get('/api/cart/:userId', (req, res) => {
  const sql = `
    SELECT ci.id, ci.quantity, ci.variation, ci.size, IFNULL(ci.item_price, mi.price) AS price, mi.name, mi.image_url, mi.category
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    JOIN menu_items mi ON ci.menu_item_id = mi.id
    WHERE c.user_id = ?
  `;
  db.all(sql, [req.params.userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/cart/:userId/add', (req, res) => {
  const { menu_item_id, quantity, variation, size, item_price } = req.body;
  const userId = req.params.userId;

  // Find user's cart ID
  db.get('SELECT id FROM carts WHERE user_id = ?', [userId], (err, cart) => {
    if (err || !cart) {
      res.status(500).json({ error: 'Cart not found' });
      return;
    }

    // Check if item already exists in cart with same options
    const checkSql = 'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND menu_item_id = ? AND IFNULL(variation, "") = IFNULL(?, "") AND IFNULL(size, "") = IFNULL(?, "")';
    db.get(checkSql, [cart.id, menu_item_id, variation, size], (err, existing) => {
      if (existing) {
        // Update quantity
        db.run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity || 1, existing.id], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, updated: true });
        });
      } else {
        // Insert new
        const insertSql = 'INSERT INTO cart_items (cart_id, menu_item_id, quantity, variation, size, item_price) VALUES (?, ?, ?, ?, ?, ?)';
        db.run(insertSql, [cart.id, menu_item_id, quantity || 1, variation, size, item_price], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, added: true });
        });
      }
    });
  });
});

app.delete('/api/cart/item/:cartItemId', (req, res) => {
  db.run('DELETE FROM cart_items WHERE id = ?', [req.params.cartItemId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.put('/api/cart/item/:cartItemId', (req, res) => {
  const { quantity } = req.body;
  db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.cartItemId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- Order APIs ---
app.get('/api/orders', (req, res) => {
  const sql = `
    SELECT o.id, o.customer_name, o.total_price, o.status, o.created_at,
           (SELECT GROUP_CONCAT(mi.name || ' x' || oi.quantity, ', ') 
            FROM order_items oi 
            JOIN menu_items mi ON oi.item_id = mi.id 
            WHERE oi.order_id = o.id) as items_summary
    FROM orders o
    ORDER BY o.created_at DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.run('DELETE FROM order_items WHERE order_id = ?', [orderId], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      db.run('DELETE FROM orders WHERE id = ?', [orderId], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        db.run('COMMIT');
        res.json({ success: true });
      });
    });
  });
});

app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/api/orders/user/:userId', (req, res) => {
  db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  
  // 1. Fetch Order Basic Info
  db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // 2. Fetch Order Items
    const itemsSql = `
      SELECT oi.quantity, mi.name, mi.price, mi.image_url, mi.category
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.id
      WHERE oi.order_id = ?
    `;
    db.all(itemsSql, [orderId], (err, items) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ...order, items });
    });
  });
});

app.post('/api/orders/checkout', (req, res) => {
  const { user_id, customer_name, total_price } = req.body;
  const orderId = `ORD-${Date.now()}`;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // 1. Create Order
    const orderSql = 'INSERT INTO orders (id, user_id, customer_name, total_price, status) VALUES (?, ?, ?, ?, "Received")';
    db.run(orderSql, [orderId, user_id, customer_name, total_price], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }

      // 2. Transfer Cart Items to Order Items
      const transferSql = `
        INSERT INTO order_items (order_id, item_id, quantity)
        SELECT ?, menu_item_id, quantity
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        WHERE c.user_id = ?
      `;
      db.run(transferSql, [orderId, user_id], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        // 3. Clear Cart
        db.run('DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = ?)', [user_id], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          db.run('COMMIT');
          res.json({ success: true, orderId });
        });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
