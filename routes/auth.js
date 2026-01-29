// Authentication routes for Trading Platform
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { checkAuthenticated, checkNotAuthenticated } = require('../middleware/auth');

// Helper function to read/write JSON files
const usersPath = path.join(__dirname, '../data/users.json');

const getUsers = () => {
  const data = fs.readFileSync(usersPath, 'utf8');
  return JSON.parse(data);
};

const saveUsers = (users) => {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
};

// referrals helper
const referralsPath = path.join(__dirname, '../data/referrals.json');
const getReferrals = () => {
  try {
    if (!fs.existsSync(referralsPath)) fs.writeFileSync(referralsPath, JSON.stringify([]));
    return JSON.parse(fs.readFileSync(referralsPath, 'utf8'));
  } catch (e) { return []; }
};
const saveReferrals = (list) => { fs.writeFileSync(referralsPath, JSON.stringify(list, null, 2)); };

// Sign up GET route
router.get('/signup', checkNotAuthenticated, (req, res) => {
  res.render('auth/signup', { error: null });
});

// Sign up POST route
router.post('/signup', checkNotAuthenticated, async (req, res) => {
  try {
    const { fullName, email, password, country } = req.body;
    
    // Basic validation
    if (!fullName || !email || !password || !country) {
      return res.render('auth/signup', { 
        error: 'All fields are required',
        formData: req.body
      });
    }
    
    // Password validation (min 8 chars, must include uppercase)
    if (password.length < 8 || !/[A-Z]/.test(password)) {
      return res.render('auth/signup', { 
        error: 'Password must be at least 8 characters and include an uppercase letter',
        formData: req.body
      });
    }
    
    // Check if user already exists
    const users = getUsers();
    const existingUser = users.find(user => user.email === email);
    
    if (existingUser) {
      return res.render('auth/signup', { 
        error: 'Email already registered',
        formData: req.body
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      fullName,
      email,
      password: hashedPassword,
      country,
      balance: 0.00,
      referralEarnings: 0.00,
      referralsCount: 0,
      referrals: [],
      canTrade: false,
      createdAt: new Date().toISOString()
    };
    
    // Save the user
    users.push(newUser);
    // handle web referrer if provided via query or body
    const referrerId = req.body.referrer || req.query.ref || req.body.referrerId;
    if (referrerId) {
      const refUserIndex = users.findIndex(u => u.id === referrerId);
      if (refUserIndex !== -1) {
        const bonus = 10.00; // signup referral bonus
        users[refUserIndex].referralsCount = (users[refUserIndex].referralsCount || 0) + 1;
        users[refUserIndex].referrals = users[refUserIndex].referrals || [];
        users[refUserIndex].referrals.push(newUser.id);
        users[refUserIndex].referralEarnings = (users[refUserIndex].referralEarnings || 0) + bonus;
        users[refUserIndex].balance = (users[refUserIndex].balance || 0) + bonus;

        // record referral event
        const referrals = getReferrals();
        referrals.push({ id: uuidv4(), referrerId: users[refUserIndex].id, referredId: newUser.id, amount: bonus, type: 'signup', createdAt: new Date().toISOString() });
        saveReferrals(referrals);
      }
      // mark referredBy on the new user record
      const newIdx = users.findIndex(u => u.id === newUser.id);
      if (newIdx !== -1) users[newIdx].referredBy = referrerId;
    }

    saveUsers(users);
    
    // Redirect to login
    req.session.flashMessage = 'Account created successfully! Please log in.';
    res.redirect('/login');
  } catch (error) {
    console.error('Signup error:', error);
    res.render('auth/signup', { 
      error: 'An error occurred. Please try again.',
      formData: req.body
    });
  }
});

// JSON API sign up route for AJAX flows
router.post('/api/auth/signup', checkNotAuthenticated, async (req, res) => {
  try {
    const { username, fullName, email, phone, country, password } = req.body;

    if (!fullName || !email || !password || !country || !username) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 8 || !/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters and include an uppercase letter' });
    }

    const users = getUsers();
    const existingUser = users.find(user => user.email === email || user.username === username);
    if (existingUser) {
      return res.status(409).json({ error: 'Email or username already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: uuidv4(),
      username,
      fullName,
      email,
      phone: phone||'',
      password: hashedPassword,
      country,
      role: 'user',
      status: 'active',
      balance: 0.00,
      referralEarnings: 0.00,
      referralsCount: 0,
      referrals: [],
      canTrade: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    // handle referrer if provided in payload
    const referrerId = req.body.referrer || req.body.referrerId || req.query.ref;
    if (referrerId) {
      const refUserIndex = users.findIndex(u => u.id === referrerId);
      if (refUserIndex !== -1) {
        const bonus = 10.00;
        users[refUserIndex].referralsCount = (users[refUserIndex].referralsCount || 0) + 1;
        users[refUserIndex].referrals = users[refUserIndex].referrals || [];
        users[refUserIndex].referrals.push(newUser.id);
        users[refUserIndex].referralEarnings = (users[refUserIndex].referralEarnings || 0) + bonus;
        users[refUserIndex].balance = (users[refUserIndex].balance || 0) + bonus;

        const referrals = getReferrals();
        referrals.push({ id: uuidv4(), referrerId: users[refUserIndex].id, referredId: newUser.id, amount: bonus, type: 'signup', createdAt: new Date().toISOString() });
        saveReferrals(referrals);
      }
      const newIdx = users.findIndex(u => u.id === newUser.id);
      if (newIdx !== -1) users[newIdx].referredBy = referrerId;
    }

    saveUsers(users);

    // initialize session
    req.session.userId = newUser.id;

    return res.status(201).json({ success: true, redirect: '/user/dashboard', user: { id: newUser.id, username: newUser.username, email: newUser.email, country: newUser.country, createdAt: newUser.createdAt, status: newUser.status } });
  } catch (err) {
    console.error('API signup error:', err);
    return res.status(500).json({ error: 'An error occurred' });
  }
});

// Login GET route
router.get('/login', checkNotAuthenticated, (req, res) => {
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  
  res.render('auth/login', { 
    error: null, 
    message: flashMessage
  });
});

// Login POST route
router.post('/login', checkNotAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.render('auth/login', { 
        error: 'Email and password are required',
        formData: { email }
      });
    }
    
    // Find user
    const users = getUsers();
    const user = users.find(user => user.email === email);
    
    if (!user) {
      return res.render('auth/login', { 
        error: 'Invalid email or password',
        formData: { email }
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.render('auth/login', { 
        error: 'Invalid email or password',
        formData: { email }
      });
    }
    
    // Set user session
    req.session.userId = user.id;
    
    // Redirect to dashboard
    res.redirect('/user/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', { 
      error: 'An error occurred. Please try again.',
      formData: { email: req.body.email }
    });
  }
});

// Admin login GET route
router.get('/admin/login', (req, res) => {
  res.render('admin/login', { error: null });
});

// Admin login POST route
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  // Hardcoded admin credentials
  if (email === 'admin@example.com' && password === 'Admin123') {
    req.session.isAdmin = true;
    return res.redirect('/admin/dashboard');
  }
  
  res.render('admin/login', { 
    error: 'Invalid admin credentials',
    formData: { email }
  });
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;