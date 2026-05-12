# Deliverable 2: Deployment Documentation

# Azure Cloud Deployment Documentation (Method A)

This documentation details the infrastructure-as-code (IaC) deployment for the Fullshot project. We utilize **Azure Bicep** and **Azure CLI** to ensure a repeatable, secure, and production-ready environment.

---

## 1. Resource Mapping
This project satisfies the requirements of Deliverable 2 through the following architecture:

| Requirement | Azure Resource | Specification |
| :--- | :--- | :--- |
| **1. Resource Group** | `rg-fullshot-project` | Logical container deployed in **East Asia**. |
| **2. Core Compute** | `Azure App Service` | Hosted on **S1 Plan (Linux)** with Autoscale enabled (2+ instances). |
| **3. Data Resource** | `PostgreSQL Flexible Server` | **B1ms tier** with 32GB Premium SSD storage. |
| **4. Security Control** | `Key Vault + Managed Identity` | Passwordless authentication using System-Assigned Identity. |

---

## 2. Local Environment Setup
Before deploying to the cloud, prepare your local environment to handle application dependencies and testing.

1. **Install Node.js & NPM:**
   Ensure you have Node.js (v18+) installed. Verify with:
   ```bash
   node -v
   npm -v
Initialize Dependencies:
Install required packages (Express, PG-Client, Dotenv, etc.):

Bash
npm install


3. **Configure Environment Variables:**
   Create a `.env` file in the root directory for local testing. **Note:** This file is excluded from Git via `.gitignore` for security.
   ```text
   PORT=3000
   DB_HOST=localhost
   DB_USER=admin
   DB_PASSWORD=your_secure_password
   
3. Infrastructure Deployment (Azure CLI)
Prerequisites
Azure CLI (v2.40.0+)

Azure for Students Subscription

Provider Registration:

Bash
az provider register --namespace Microsoft.AlertsManagement
Deployment Steps
Login to Azure:

Bash
az login


2. **Set Deployment Variables:**
   To avoid hardcoding secrets in scripts, set your database password in your terminal session:
   ```bash
   export DB_PASSWORD='YourSecurePassword123!'
   
Execute Deployment Script:
Run the orchestration script which handles Resource Group creation and Bicep deployment:

Bash
cd deployment
chmod +x deploy.azcli
./deploy.azcli


---

## 4. Cloud Optimizations & Security

### 🛡️ Advanced Security
*   **Zero-Secret Architecture:** We utilize **Managed Identities**. The App Service identity is granted the `Key Vault Secrets User` role via Bicep.
*   **Runtime Resolution:** The application fetches the `DB_PASS` secret directly from Key Vault at runtime using `@Microsoft.KeyVault` references, ensuring no passwords exist in the application source code.

### 📈 Scalability & Fault Tolerance
*   **Autoscale:** The App Service is configured with autoscale rules to scale out automatically if CPU utilization exceeds 70% for over 10 minutes.
*   **High Availability:** Minimum of 2 instances are maintained to ensure availability during platform maintenance or localized failures.

---

## 5. Post-Deployment Verification

Once the script finishes, verify the deployment:

1. **Initialize Database:**
   Access the App Service SSH terminal or run the initialization script locally if remote access is configured:
   ```bash
   node db/init_db.js
Check Scaling Status:
Verify the SKU and instance count via CLI:

Bash
az webapp show --name <your-app-name> --resource-group rg-fullshot-project --query "sku"


---

## 6. Troubleshooting
*   **Key Vault Name Conflict:** Azure Key Vault names must be globally unique. If a vault with the same name was recently deleted, run `az keyvault purge --name <vault-name>`.
*   **RBAC Propagation:** If the application cannot pull secrets immediately after deployment, wait 5 minutes for Azure RBAC roles to propagate and then restart the App Service.
---
**References:**
* [Bicep Deployment Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-script-develop?tabs=CLI)
* [Maintainer CHANGELOG](../CHANGELOG.md)
