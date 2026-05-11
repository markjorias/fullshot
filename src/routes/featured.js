const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Featured Products logic
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM featured_items');
    
    const featured = {
      bestseller: [],
      snacks: [],
      more_to_try: []
    };

    result.rows.forEach(row => {
      featured[row.section] = JSON.parse(row.item_ids);
    });

    if (req.query.full === 'true') {
      const allIds = [].concat(...Object.values(featured));
      if (allIds.length === 0) {
        return res.json(featured);
      }

      const placeholders = allIds.map((_, i) => `$${i + 1}`).join(',');
      const itemsResult = await db.query(`SELECT * FROM menu_items WHERE id IN (${placeholders})`, allIds);
      const items = itemsResult.rows;

      const fullFeatured = {
        bestseller: featured.bestseller.map(id => items.find(i => i.id === id)).filter(Boolean),
        snacks: featured.snacks.map(id => items.find(i => i.id === id)).filter(Boolean),
        more_to_try: featured.more_to_try.map(id => items.find(i => i.id === id)).filter(Boolean)
      };
      res.json(fullFeatured);
    } else {
      res.json(featured);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const featured = req.body;
  const sections = Object.keys(featured);
  
  try {
    for (const section of sections) {
      await db.query(
        'INSERT INTO featured_items (section, item_ids) VALUES ($1, $2) ON CONFLICT (section) DO UPDATE SET item_ids = EXCLUDED.item_ids',
        [section, JSON.stringify(featured[section])]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
