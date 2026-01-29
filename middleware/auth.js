// Authentication middleware for Trading Platform

/**
 * Middleware to check if user is authenticated
 * Redirects to login page if not authenticated
 */
const checkAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Middleware to check if user is NOT authenticated
 * Redirects to dashboard if already authenticated
 */
const checkNotAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/user/dashboard');
  }
  next();
};

module.exports = { 
  checkAuthenticated, 
  checkNotAuthenticated 
};