# Changelog

All notable changes to this project will be documented in this file.

## [2026-05-12] - Security & Backend Modularization

### Added
- `[markjorias]` - Created required `/diagram` and `/report` directories to align with project structure requirements.
- `[markjorias]` - Integrated `dotenv` for secure environment variable management.
- `[markjorias]` - Created a centralized `.env.sample` in the project root for streamlined configuration.
- `[markjorias]` - Added environment variable validation on startup to prevent silent failures.
- `[markjorias]` - Modularized the backend into a dedicated `src/config/db.js` and Express Router files in `src/routes/`.

### Changed
- `[markjorias]` - Refactored `src/server.js` from a monolithic file into a clean entry point using modular routes.
- `[markjorias]` - Updated `db/init_db.js` to utilize `dotenv` and remove hardcoded database defaults.
- `[markjorias]` - Updated `deployment/deploy.azcli` to be root-directory aware, allowing it to fetch variables from the centralized `.env`.

### Removed
- `[markjorias]` - Removed hardcoded database credentials and fallbacks from `src/server.js` and `db/init_db.js`.
- `[markjorias]` - Removed redundant `.env.sample` from the `deployment/` folder.

## [2026-05-11] - Cloud Architecture Optimization

### Added
- `[Asriyo]` - Added infrastructure-as-code scripts (`main.bicep` and `deploy.azcli`) for automated deployment.
- `[Asriyo]` - Added Azure Key Vault for secure database credential storage.
- `[Asriyo]` - Added Application Insights for telemetry and advanced error tracking.
- `[Asriyo]` - Added `convert_sql.py` to automate the migration of SQL schemas from SQLite to PostgreSQL.
- `[Asriyo]` - Created `tutorial.md` documentation covering manual Azure Portal configuration.

### Changed
- `[Asriyo]` - Migrated the project's compute resource from a standalone Virtual Machine to Azure App Service (Standard S1) to support autoscale rules.
- `[Asriyo]` - Replaced the local `coffee_shop.db` (SQLite) database with an Azure Database for PostgreSQL Flexible Server for persistent cloud storage.
- `[Asriyo]` - Refactored `src/server.js` to utilize the `pg` package instead of `sqlite3`, enabling secure and robust cloud database connections.
- `[Asriyo]` - Updated `db/init_db.js` to connect and initialize the PostgreSQL database.
- `[Asriyo]` - Modified SQL schema files (`db/*.sql`) to use `SERIAL PRIMARY KEY` instead of `INTEGER PRIMARY KEY AUTOINCREMENT`.

### Removed
- `[Asriyo]` - Uninstalled the `sqlite3` dependency from `package.json` to reduce package size.
- `[Asriyo]` - Removed the local `.db` file tracking logic.
