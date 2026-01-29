// Main application file - Trading Platform
const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { MongoClient } = require('mongodb');

// const uri = "mongodb+srv://webberaxel4:%3CBabatunde%4020.%3E@fortiv.sctageg.mongodb.net/fortiv_db";

// const client = new MongoClient(uri, {
//   tls: true,
//   retryWrites: true
// });

// async function connectToMongo() {
//   try {
//     await client.connect();
//     console.log("✅ Connected to MongoDB");
//     app.locals.db = client.db("fortiv_db");
//   } catch (err) {
//     console.error("❌ MongoDB connection failed:", err);
//   }
// }

// connectToMongo();





// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize data files if they don't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize users.json if it doesn't exist
const usersPath = path.join(dataDir, 'users.json');
if (!fs.existsSync(usersPath)) {
  fs.writeFileSync(usersPath, JSON.stringify([]));
}

// Initialize withdrawals.json if it doesn't exist
const withdrawalsPath = path.join(dataDir, 'withdrawals.json');
if (!fs.existsSync(withdrawalsPath)) {
  fs.writeFileSync(withdrawalsPath, JSON.stringify([]));
}

// Initialize deposits.json if it doesn't exist
const depositsPath = path.join(dataDir, 'deposits.json');
if (!fs.existsSync(depositsPath)) {
  fs.writeFileSync(depositsPath, JSON.stringify([]));
}

// Set up middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'trading-platform-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

// Import middleware
const { checkAuthenticated, checkNotAuthenticated } = require('./middleware/auth');

// Set up routes
app.use('/', authRoutes);
app.use('/user', checkAuthenticated, userRoutes);
app.use('/admin', adminRoutes);

// Home route
app.get('/', checkNotAuthenticated, (req, res) => {
  res.render('landing');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});