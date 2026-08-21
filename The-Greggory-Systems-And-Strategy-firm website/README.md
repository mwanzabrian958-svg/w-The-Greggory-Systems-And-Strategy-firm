# Website for The Greggory Systems And Strategy Firm

[![Build and Deploy](https://github.com/Brianmwanza-bit/Website-for-The-Greggory-Systems-And-Strategy-firm/actions/workflows/deploy.yml/badge.svg)](https://github.com/Brianmwanza-bit/Website-for-The-Greggory-Systems-And-Strategy-firm/actions/workflows/deploy.yml)

The digital interface of **The Greggory Systems And Strategy Firm**, a global consultancy that leverages expert systems and strategy principles to drive business management, innovation, and successful project delivery across all industries.

## Strategic Features

- **Mission Control (Admin Dashboard)**: A sophisticated management interface designed for high-density data visualization and system oversight.
- **Client Portal (Business Blueprint)**: Provides clients with transparent, live data regarding their projects, tasks, invoices, and communication.
- **Financial Telemetry**: Real-time revenue tracking, expense categorization, and Profit/Loss reporting in KSH.
- **Global Search Relay**: Deep scan database telemetry for personnel, projects, and ledger entries.
- **Integrated Communications**: Built-in SMS and WhatsApp relays for seamless team and client collaboration.

## Core Documentation

- **[Mission Control Summary](ADMIN_PANEL_SUMMARY.md)** - Overview of the Admin Dashboard capabilities.
- **[Client Portal Blueprint](docs/client-portal/README.md)** - Documentation of the client transparency experience.
- **[API Endpoints Guide](ENDPOINTS-GUIDE.md)** - Comprehensive technical documentation for the API relay.
- **[XAMPP Setup Guide](XAMPP-SETUP-GUIDE.md)** - Instructions for local database synchronization.

## Setup & Deployment

### Tactical Prerequisites
- Node.js (v16 or higher)
- XAMPP (Local MySQL Node)
- MongoDB Atlas (Strategic Data Node)

### Initialization (Windows)
Run the automated synchronization script:
```powershell
.\setup-xampp-project.ps1
```

### Manual Node Activation
```bash
# Deploy dependencies
npm install

# Initialize Environment
cp env.example .env

# Synchronize Database
# Import: database/the-greggory-systems-and-strategy-firm-db-main.sql

# Start Frontend & Backend
npm run dev
```

## Technical Architecture

- **UI Framework**: React 18, Vite, TailwindCSS.
- **Design Pattern**: Glassmorphism with Slate/Teal/Indigo aesthetic.
- **Backend Relay**: Express.js with Hardened API Nodes.
- **Data Matrix**: MySQL for relational integrity + MongoDB for strategic scaling.
- **Security Hub**: JWT-based Role-Based Access Control (RBAC).

## License

© 2024 The Greggory Systems And Strategy Firm. All rights reserved.
"Empowering Your Success Through Comprehensive Solutions."
