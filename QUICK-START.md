# Quick Start Guide - Greggory Foundation Ltd

## One-Command Startup

Run this single command to start everything:

```powershell
npm run dev
```

This will automatically:
1. ✅ Start XAMPP services (Apache + MySQL)
2. ✅ Open phpMyAdmin in your browser
3. ✅ Start the backend API server
4. ✅ Start the frontend development server

## Access URLs

Once started, you can access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **phpMyAdmin**: http://localhost/phpmyadmin/index.php?route=/database/structure&db=greggory_foundation_db_main

## Other Commands

### Start only frontend and backend (if XAMPP already running)
```powershell
npm run dev:simple
```

### Start only XAMPP services
```powershell
npm run start:xampp
```

### Open phpMyAdmin manually
```powershell
npm run open:phpmyadmin
```

### Start only backend
```powershell
npm run dev:backend
```

### Start only frontend
```powershell
npm run dev:frontend
```

## Troubleshooting

### XAMPP services won't start
- Open XAMPP Control Panel manually
- Start Apache and MySQL from there
- Then run `npm run dev:simple` to start just the app

### Port conflicts
If you see port conflicts, check:
- Apache uses port 80
- MySQL uses port 3306
- Backend uses port 8080
- Frontend uses port 5173

Change ports in `.env` file if needed.

### Database connection errors
1. Ensure MySQL is running in XAMPP
2. Check `.env` file has correct database credentials
3. Run `node test-db-connection.js` to test connection

## Stopping the Application

Press `Ctrl + C` in the terminal to stop all services.

Note: XAMPP services will continue running. Stop them from XAMPP Control Panel if needed.
