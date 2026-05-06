/* 
  init_db.js - Example Node.js script to initialize the SQLite database
  Requirement: npm install sqlite3
*/

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./coffee_shop.db');

function runSqlFile(filePath) {
    const sql = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    db.exec(sql, (err) => {
        if (err) {
            console.error(`Error executing ${filePath}:`, err.message);
        } else {
            console.log(`Successfully executed ${filePath}`);
        }
    });
}

db.serialize(() => {
    console.log('Initializing Database...');
    runSqlFile('schema_menu.sql');
    runSqlFile('schema_orders.sql');
    runSqlFile('schema_users.sql');
});

db.close();
