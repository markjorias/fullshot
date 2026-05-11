/* 
  init_db.js - PostgreSQL Database Initialization
  Requirement: npm install pg

  Automatically resolves Azure Key Vault references for DB_PASS using
  the App Service Managed Identity — no manual password injection needed.
*/

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');
const fs = require('fs');

/**
 * If DB_PASS is an Azure Key Vault reference (set by Bicep),
 * SSH sessions won't auto-resolve it. This function detects that
 * and fetches the real secret using the Managed Identity IMDS endpoint.
 */
async function resolveDbPassword() {
  const raw = process.env.DB_PASS || '';

  if (!raw.startsWith('@Microsoft.KeyVault(')) {
    return raw; // Already a plain-text password (local dev or direct setting)
  }

  console.log('Detected Key Vault reference — resolving via Managed Identity...');

  const vaultMatch = raw.match(/VaultName=([^;)]+)/);
  const secretMatch = raw.match(/SecretName=([^;)]+)/);

  if (!vaultMatch || !secretMatch) {
    throw new Error('Could not parse Key Vault reference: ' + raw);
  }

  const vaultName = vaultMatch[1];
  const secretName = secretMatch[1];

  // Step 1: Get an access token from the Managed Identity endpoint (IMDS)
  const tokenUrl =
    'http://169.254.169.254/metadata/identity/oauth2/token' +
    '?api-version=2018-02-01&resource=https://vault.azure.net';

  const tokenRes = await fetch(tokenUrl, { headers: { Metadata: 'true' } });
  if (!tokenRes.ok) {
    throw new Error(`Failed to get Managed Identity token: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const { access_token } = await tokenRes.json();

  // Step 2: Call Key Vault REST API with the token
  const secretUrl = `https://${vaultName}.vault.azure.net/secrets/${secretName}?api-version=7.3`;
  const secretRes = await fetch(secretUrl, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  if (!secretRes.ok) {
    throw new Error(`Failed to fetch Key Vault secret: ${secretRes.status} ${await secretRes.text()}`);
  }
  const { value } = await secretRes.json();
  console.log('Key Vault secret resolved successfully.');
  return value;
}

async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
  try {
    await client.query(sql);
    console.log(`Successfully executed ${filePath}`);
  } catch (err) {
    console.error(`Error executing ${filePath}:`, err.message);
  }
}

async function init() {
  const dbPassword = await resolveDbPassword();

  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: dbPassword,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
  });

  console.log('Connecting to database...');
  await client.connect();
  console.log('Initializing Database...');
  await runSqlFile(client, 'schema_menu.sql');
  await runSqlFile(client, 'schema_users.sql');
  await runSqlFile(client, 'schema_orders.sql');
  if (fs.existsSync(path.join(__dirname, 'schema_feedback.sql'))) {
    await runSqlFile(client, 'schema_feedback.sql');
  }

  // Seed the migrated data
  if (fs.existsSync(path.join(__dirname, 'seed_data.sql'))) {
    console.log('Migrating data from coffee_shop.db...');
    await runSqlFile(client, 'seed_data.sql');
  }

  await client.end();
  console.log('Done.');
}

init().catch(err => {
  console.error('Fatal error during initialization:', err.message);
  process.exit(1);
});
