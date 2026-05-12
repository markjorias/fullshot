# Changelog

All notable changes to this project will be documented in this file.

## [2026-05-12] - Architecture Diagram

### Added
- `[lawrence]` - Added `diagram/ArchitectureDiagram.drawio` — professional Azure architecture diagram for Deliverable 1, illustrating the cloud infrastructure, security boundaries, service connections, and deployment pipeline.

## [2026-05-12] - Security, Backend Modularization & Reporting

### Added
- `[markjorias]` - Created the 'Deliverable 3 - Cost Estimate Report' (`report/cost-estimate.md`), cross-checked and verified against the official Azure Pricing Calculator export (`report/ExportedEstimate.xlsx`) for the East Asia region.
- `[markjorias]` - Added a quick-view 'Itemized Cost Breakdown' table to the root `README.md` for immediate visibility of project costs.
- `[markjorias]` - Added `DB_NAME` environment variable to Bicep template for explicit database targeting.
- `[markjorias]` - Created required `/diagram` and `/report` directories to align with project structure requirements.
- `[markjorias]` - Integrated `dotenv` for secure environment variable management.
- `[markjorias]` - Created a centralized `.env.sample` in the project root for streamlined configuration.
- `[markjorias]` - Added environment variable validation on startup to prevent silent failures.
- `[markjorias]` - Modularized the backend into a dedicated `src/config/db.js` and Express Router files in `src/routes/`.

### Changed
- `[markjorias]` - Expanded `deployment/DEPLOYMENT.md` to include explicit resource mapping, high availability specifications, and advanced security implementation details to meet Deliverable 2 criteria.
- `[markjorias]` - Redesigned the root `README.md` to professional engineering standards, implementing a clickable Table of Contents and explicit mapping for Deliverables 1-4.
- `[markjorias]` - Consolidated high-level deployment steps and "Quick Start" instructions into the root `README.md` under Deliverable 2.
- `[markjorias]` - Enhanced `deployment/README.md` with comprehensive setup instructions, Azure for Students subscription prerequisites, and troubleshooting guides.
- `[markjorias]` - Updated `.gitignore` to exclude deployment artifacts (`.zip`), temporary cost estimation exports (`.csv`, `.xlsx`), and sensitive redeployment guides.
- `[markjorias]` - Refactored `src/server.js` from a monolithic file into a clean entry point using modular routes.
- `[markjorias]` - Updated `db/init_db.js` to utilize `dotenv` and remove hardcoded database defaults.
- `[markjorias]` - Updated `deployment/deploy.azcli` to be root-directory aware, allowing it to fetch variables from the centralized `.env`.

### Removed
- `[markjorias]` - Removed outdated `tutorial.md` and `tutorial_arch_linux.md` documentation files.
- `[markjorias]` - Removed hardcoded database credentials and fallbacks from `src/server.js` and `db/init_db.js`.
- `[markjorias]` - Removed redundant `.env.sample` from the `deployment/` folder.

### Fixed
- `[markjorias]` - Fixed Express 5.x routing crash in `src/server.js` by updating wildcard fallback to regex.
- `[markjorias]` - Fixed ReferenceError in `db/init_db.js` caused by uninitialized `path` module.
- `[markjorias]` - Fixed PostgreSQL incompatible `INSERT OR IGNORE` syntax in `db/schema_menu.sql`; replaced with `ON CONFLICT DO NOTHING`.
- `[markjorias]` - Fixed schema initialization order in `db/init_db.js`; `schema_menu.sql` must run before `schema_users.sql` due to foreign key dependency on `menu_items`.
- `[markjorias]` - Fixed missing `user_id` FK column in `db/schema_orders.sql`; added `user_id INTEGER REFERENCES users(id)` to `CREATE TABLE orders`.
- `[markjorias]` - Fixed missing `role` column in `db/schema_users.sql`; added `role TEXT DEFAULT 'user'` to `CREATE TABLE users` to match seed data.
- `[markjorias]` - Fixed missing `item_price` column in `db/schema_users.sql`; added `item_price REAL` to `CREATE TABLE cart_items` to match seed data.
- `[markjorias]` - Removed stale `ALTER TABLE orders ADD COLUMN user_id` from `db/schema_users.sql`; column is now defined directly in `schema_orders.sql`.
- `[markjorias]` - Fixed duplicate key errors on re-run by rewriting `db/seed_data.sql` with `ON CONFLICT DO NOTHING` on all INSERT statements.
- `[markjorias]` - Removed example INSERT rows from `db/schema_orders.sql`; seed data now lives exclusively in `seed_data.sql`.

## [2026-05-11] - Cloud Architecture Optimization

### Added
- `[markjorias]` - Added infrastructure-as-code scripts (`main.bicep` and `deploy.azcli`) for automated deployment.
- `[markjorias]` - Added Azure Key Vault for secure database credential storage.
- `[markjorias]` - Added Application Insights for telemetry and advanced error tracking.
- `[markjorias]` - Added `convert_sql.py` to automate the migration of SQL schemas from SQLite to PostgreSQL.

### Changed
- `[markjorias]` - Migrated the project's compute resource from a standalone Virtual Machine to Azure App Service (Standard S1) to support autoscale rules.
- `[markjorias]` - Replaced the local `coffee_shop.db` (SQLite) database with an Azure Database for PostgreSQL Flexible Server for persistent cloud storage.
- `[markjorias]` - Refactored `src/server.js` to utilize the `pg` package instead of `sqlite3`, enabling secure and robust cloud database connections.
- `[markjorias]` - Updated `db/init_db.js` to connect and initialize the PostgreSQL database.
- `[markjorias]` - Modified SQL schema files (`db/*.sql`) to use `SERIAL PRIMARY KEY` instead of `INTEGER PRIMARY KEY AUTOINCREMENT`.

### Removed
- `[markjorias]` - Uninstalled the `sqlite3` dependency from `package.json` to reduce package size.
---

## [2026-05-10] - Initial Deployment & CI/CD Integration

### Added
- `[markjorias]` - Successfully completed the initial live deployment of **Fullshot v1** to Azure.
- `[markjorias]` - Integrated infrastructure-as-code foundations for manual deployment tracking.
- `[markjorias]` - `[db branch]` - Implemented OTP verification flow with backend integration and cart visibility logic.

## [2026-05-06] - Core Feature Development

### Added
- `[markjorias]` - Implemented full-stack e-commerce features: shopping cart, secure checkout, and order history tracking.
- `[markjorias]` - Created a comprehensive Admin Dashboard with real-time menu management and analytics.
- `[markjorias]` - Established the core backend infrastructure using Node.js and SQLite.
- `[markjorias]` - Developed the responsive frontend UI with category-based filtering and dynamic product loading.

## [2026-05-05] - Project Initialization

### Added
- `[markjorias]` - `[2a77cb6]` - Initial project scaffolding including responsive layout, global styles, and shared component architecture.
- `[markjorias]` - Established the baseline project structure and asset management system.

