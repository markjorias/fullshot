# Deliverable 2: Deployment Documentation

This repository utilizes **Method A (Code)** for infrastructure deployment, using Azure Bicep and the Azure CLI. This approach ensures a repeatable, version-controlled, and secure environment.

## Table of Contents
- [1. Resource Mapping](#1-resource-mapping)
- [2. Infrastructure as Code (Bicep) Specifications](#2-infrastructure-as-code-bicep-specifications)
- [3. Local Environment Setup](#3-local-environment-setup)
- [4. Deployment Instructions](#4-deployment-instructions)
- [5. Cloud Optimizations & Security](#5-cloud-optimizations--security)
- [6. Post-Deployment & Verification](#6-post-deployment--verification)
- [7. Troubleshooting](#7-troubleshooting)

---

## 1. Resource Mapping
The following table maps the deployed infrastructure to the specific requirements of Deliverable 2:

| Requirement | Azure Resource | Specification |
| :--- | :--- | :--- |
| **1. Resource Group** | `rg-fullshot-project` | Logical container for all project assets, deployed in `eastasia`. |
| **2. Core Compute** | Azure App Service | Hosted on an **S1 Plan** with **2+ instances** (Autoscale enabled) for high availability. |
| **3. Data Resource** | PostgreSQL Flexible Server | Burstable B1ms tier with 32GB Premium SSD storage. |
| **4. Security Control** | Azure Key Vault + Managed Identity | Passwordless authentication using RBAC and System-Assigned Identity. |

---

## 2. Infrastructure as Code (Bicep) Specifications

### Bicep Parameters
The `main.bicep` template utilizes the following parameters for flexible deployment:
* `location`: The Azure region (defaults to Resource Group location).
* `baseName`: Unique prefix for resource naming to avoid global DNS conflicts.
* `dbAdminUsername`: The administrator login for the PostgreSQL server.
* `dbAdminPassword`: (Secure) The database password, automatically injected into Key Vault.

### Security Implementation
We have implemented **Advanced Security Controls** by eliminating hardcoded credentials:
1. **Managed Identity**: The App Service is assigned a unique identity in Azure AD.
2. **Key Vault RBAC**: Bicep creates a role assignment granting the App Service identity the `Key Vault Secrets User` role.
3. **Runtime Resolution**: The application fetches the `DB_PASS` secret directly from Key Vault at runtime using the `@Microsoft.KeyVault` reference syntax.

---

## 3. Local Environment Setup

To run the application locally for development and testing:

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory based on `.env.sample`.
4. **Local Database**:
   Ensure you have a local PostgreSQL instance running and update the `.env` file with your local database credentials.
5. **Start the Application**:
   ```bash
   npm start
   ```

---

## 4. Deployment Instructions

### Prerequisites
* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (v2.40.0+)
* Active **Azure for Students** subscription.
* **One-Time Provider Registration**:
  ```bash
  az provider register --namespace Microsoft.AlertsManagement
  ```

### Deployment Steps
1. **Environment Setup**: Ensure your `.env` file in the project root contains a secure `DB_PASSWORD`.
2. **Authentication**:
   ```bash
   az login
   ```
3. **Execute Deployment Script**:
   ```bash
   cd deployment
   bash deploy.azcli
   ```
   *The script creates the Resource Group and triggers the Bicep orchestration.*

---

## 5. Cloud Optimizations & Security

### 🛡️ Advanced Security
* **Zero-Secret Architecture**: We utilize Managed Identities. The App Service identity is granted the Key Vault Secrets User role via Bicep.
* **Runtime Resolution**: The application fetches the `DB_PASS` secret directly from Key Vault at runtime using `@Microsoft.KeyVault` references, ensuring no passwords exist in the application source code.

### 📈 Scalability & Fault Tolerance
* **Autoscale**: The App Service is configured with autoscale rules to scale out automatically if CPU utilization exceeds 70% for over 10 minutes.
* **High Availability**: Minimum of 2 instances are maintained to ensure availability during platform maintenance or localized failures.

---

## 6. Post-Deployment & Verification

### Database Initialization
Once the infrastructure is ready, initialize the schema via the Azure SSH terminal:
```bash
# Navigate to application root and run init script
node db/init_db.js
```

### Verification Commands
Use these commands to verify the state of your deployment:
```bash
# List all resources in the group
az resource list --resource-group rg-fullshot-project --output table

# Check App Service scale status
az webapp show --name <app-name> --resource-group rg-fullshot-project --query "sku"
```

---

## 7. Troubleshooting
| Symptom | Resolution |
| :--- | :--- |
| `MissingSubscriptionRegistration` | Register the `AlertsManagement` provider as shown in Prerequisites. |
| Key Vault Name Conflict | Purge the soft-deleted vault using `az keyvault purge --name <vault-name>`. |
| `DB_PASS` not resolving | Wait 5 minutes for RBAC propagation and restart the App Service. |

---
**References:**
* [Bicep Deployment Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-script-develop?tabs=CLI)
* [Maintainer CHANGELOG](../CHANGELOG.md)
