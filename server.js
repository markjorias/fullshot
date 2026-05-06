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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
