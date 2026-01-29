// Auth JavaScript for Trading Platform

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  
  if (!signupForm) return;
  
  // Password validation
  const validatePassword = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password);
  };
  
  // Form submission validation
  signupForm.addEventListener('submit', (e) => {
    const passwordInput = document.getElementById('password');
    
    if (passwordInput && !validatePassword(passwordInput.value)) {
      e.preventDefault();
      alert('Password must be at least 8 characters and include an uppercase letter');
    }
  });
});