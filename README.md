# Trading Platform

A lightweight trading platform built with Node.js, Express, and EJS.

## Features

- User authentication (signup/login)
- User dashboard with account information
- Interactive trade view with animated forex signals
- Secure withdrawal request system
- Admin panel for user management

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Templating**: EJS
- **Backend**: Node.js with Express
- **Database**: JSON files (users.json and withdrawals.json)

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the application:
   ```
   npm start
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Admin Access

Access the admin panel at:
```
http://localhost:3000/admin/login
```

Use the following credentials:
- Email: admin@example.com
- Password: Admin123

## Project Structure

- `app.js` - Main application file
- `routes/` - Express routes
  - `auth.js` - Authentication routes
  - `user.js` - User dashboard routes
  - `admin.js` - Admin panel routes
- `middleware/` - Express middleware
  - `auth.js` - Authentication middleware
- `views/` - EJS templates
- `public/` - Static assets
- `data/` - JSON data storage
  - `users.json` - User records
  - `withdrawals.json` - Withdrawal requests

## License

This project is for demonstration purposes only.