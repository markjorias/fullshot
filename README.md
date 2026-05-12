# Fullshot — Cloud-Native E-Commerce Platform
**CSEC 3 – Cloud Computing (Microsoft Azure) | Final Project**

## Project Overview
Fullshot is a modern e-commerce platform developed as a cloud-native redesign of a traditional coffee shop web application. This project demonstrates the successful migration and optimization of a full-stack application to Microsoft Azure, fulfilling the requirements for Scenario B (E-Commerce Storefront). The platform delivers a complete digital ordering experience—featuring a dynamic product catalog, secure shopping cart functionality, and a robust administrative dashboard—all engineered for high availability, security, and scalability using managed Azure services.

## Table of Contents
1. [Final Project Deliverables](#final-project-deliverables)
2. [Cloud Architecture and Optimizations](#cloud-architecture-and-optimizations)
3. [Repository Structure](#repository-structure)
4. [Technical Stack](#technical-stack)
5. [Project Team](#project-team)
6. [Testing Credentials](#testing-credentials)

---

## Final Project Deliverables

### Deliverable 1: Architecture Diagram
![Fullshot Azure Architecture](./diagram/ArchitectureDiagram.png)

> [Check the full discussion for the diagram here](./diagram/DIAGRAM.md)

### Deliverable 2: Deployment Documentation
Comprehensive setup and Infrastructure as Code (IaC) guides are located in the [deployment](./deployment/) directory. 

#### Quick Start Deployment Guide
**Prerequisites**
* Azure CLI installed and configured.
* Active Azure for Students subscription.
* Registration of the Alerts provider: `az provider register --namespace Microsoft.AlertsManagement`.

**Deployment Execution**
1. **Authentication and Script Execution**
   ```bash
   az login
   cd deployment
   bash deploy.azcli
   ```
2. **Source Code Synchronization**
   Connect the GitHub repository to the App Service instance via the **Deployment Center** in the Azure Portal.
3. **Database Initialization**
   Access the Azure Portal SSH Terminal and execute:
   ```bash
   node db/init_db.js
   ```
For full instructions and troubleshooting, see the [Detailed Deployment Guide](./deployment/DEPLOYMENT.md).

### Deliverable 3: Cost Estimate Report
The following itemized monthly cost estimate is based on the East Asia (Hong Kong) region.

| Azure Service | Configuration Details | Estimated Monthly Cost |
| :--- | :--- | :--- |
| **App Service Plan** | S1 Tier (Linux), 1 Instance Baseline | $69.35 |
| **PostgreSQL Flexible Server** | Burstable B1ms (1 vCore, 2GB RAM) + 32GB Premium SSD | $25.68 |
| **Azure Monitor** | Application Insights + Log Analytics (Free Tier) | $0.00 |
| **Bandwidth** | 5 GB Egress (Free Tier) | $0.00 |
| **Total Estimated Cost** | | **$95.03 / Month** |

For the complete analysis and cost optimization strategies, view the [Full Cost Estimate Report](./report/cost-estimate.md).

### Deliverable 4: Live Demo and Video Presentation
* **Live Application URL:** [https://fullshotixnofupbqwjp2-app.azurewebsites.net//](https://fullshotixnofupbqwjp2-app.azurewebsites.net//)
* **Video Presentation:** [YouTube Unlisted Link Placeholder](https://youtube.com/)

---

## Cloud Architecture and Optimizations
This implementation follows Scenario B (E-Commerce Storefront), prioritizing high availability, security, and scalability.

### Azure Service Stack
| Service | Function |
| :--- | :--- |
| **App Service Plan (S1)** | Core compute farm supporting Linux containers. |
| **App Service** | High-performance Node.js hosting environment. |
| **Database for PostgreSQL** | Managed relational database (Flexible Server). |
| **Key Vault** | Secure storage for sensitive credentials and secrets. |
| **Application Insights** | Telemetry, error tracking, and performance monitoring. |
| **Autoscale Settings** | Rule-based scaling for fault tolerance. |

### Implemented Cloud Optimizations
*   **Scalability (Autoscale Rules)**: Configured the App Service Plan (Standard S1) with autoscale settings to dynamically adjust capacity between 1 and 3 instances. Scaling is triggered by CPU utilization thresholds (>70% for scale-out, <30% for scale-in), ensuring the platform remains responsive during traffic spikes while optimizing costs during idle periods.
*   **Security and DevOps (Managed Identity & Key Vault)**: Implemented a secure, passwordless architecture using **System-Assigned Managed Identity**. The App Service authenticates directly with **Azure Key Vault** to retrieve database credentials at runtime, eliminating the need for hardcoded secrets in the source code or environment variables.
*   **Monitoring and Operations (Application Insights)**: Integrated **Azure Application Insights** and a **Log Analytics Workspace** to provide full-stack observability. This includes real-time telemetry, error tracking, and performance monitoring, enabling proactive identification and resolution of system bottlenecks.
*   **CI/CD Automation (Continuous Deployment)**: Configured the **Azure Deployment Center** to integrate with this GitHub repository. This enables a Continuous Deployment pipeline where every push to the `main` branch automatically triggers a build and deployment, ensuring rapid and reliable delivery of updates.

---

## Repository Structure

```text
Fullshot(Azure)/
├── db/                 # Database initialization and SQL schema files
├── deployment/         # Infrastructure as Code (Bicep) and CLI scripts
├── diagram/            # Architecture diagrams and design documentation
├── public/             # Frontend assets (HTML, CSS, JS, Images)
├── report/             # Project reports and cost estimation
├── src/                # Backend source code (Express API, Routes, Config)
├── .env.sample         # Template for environment variables
├── CHANGELOG.md        # Chronological log of project updates
└── README.md           # Project overview and documentation
```

### Directory Descriptions
* **`db/`**: Contains Node.js scripts to initialize the PostgreSQL database and SQL files defining the schema and seed data.
* **`deployment/`**: Houses Bicep templates for automated infrastructure provisioning and Azure CLI scripts for deployment automation.
* **`diagram/`**: Reserved for professional architecture diagrams as required for Deliverable 1.
* **`public/`**: The web root containing the static frontend, including HTML pages, CSS stylesheets, and client-side JavaScript.
* **`report/`**: Contains the cost estimate report (Deliverable 3) and supporting pricing exports.
* **`src/`**: The core backend application code, modularized into API routes, database configuration, and the main server entry point.

---

## Technical Stack
| Component | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express |
| **Database** | Azure Database for PostgreSQL (Flexible Server) |
| **Infrastructure** | Bicep (IaC), Azure CLI |

---

## Project Team
| Member Name |
| :--- |
| AQUINO, Sean Xander |
| ATIENZA, Lawrence |
| ORIAS, Mark Joseph C. |

---

## Testing Credentials
| Account Role | Email Address | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@halfshot.com` | `adminpassword123` |
| **Standard User** | `test@example.com` | `testpassword123` |
