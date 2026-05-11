/* 
  init_db.js - PostgreSQL Database Initialization
  Requirement: npm install pg
*/

require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
});

async function runSqlFile(filePath) {
    const sql = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    try {
        await client.query(sql);
        console.log(`Successfully executed ${filePath}`);
    } catch (err) {
        console.error(`Error executing ${filePath}:`, err.message);
    }
}

async function init() {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Initializing Database...');
    await runSqlFile('schema_users.sql'); 
    await runSqlFile('schema_menu.sql');
    await runSqlFile('schema_orders.sql');
    if (fs.existsSync(path.join(__dirname, 'schema_feedback.sql'))) {
      await runSqlFile('schema_feedback.sql');
    }
    
    // Seed the migrated data
    if (fs.existsSync(path.join(__dirname, 'seed_data.sql'))) {
      console.log('Migrating data from coffee_shop.db...');
      await runSqlFile('seed_data.sql');
    }
    
    await client.end();
    console.log('Done.');
}

init();
