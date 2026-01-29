// Dashboard JavaScript for Trading Platform

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }
  
  // Logout modal functionality
  const logoutButton = document.getElementById('logoutButton');
  const logoutModal = document.getElementById('logoutModal');
  const confirmLogout = document.getElementById('confirmLogout');
  const cancelLogout = document.getElementById('cancelLogout');
  
  if (logoutButton && logoutModal) {
    // Open modal
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      logoutModal.classList.add('show');
    });
    
    // Close modal on cancel
    if (cancelLogout) {
      cancelLogout.addEventListener('click', () => {
        logoutModal.classList.remove('show');
      });
    }
    
    // Confirm logout
    if (confirmLogout) {
      confirmLogout.addEventListener('click', () => {
        window.location.href = '/logout';
      });
    }
    
    // Close modal when clicking outside
    logoutModal.addEventListener('click', (e) => {
      if (e.target === logoutModal) {
        logoutModal.classList.remove('show');
      }
    });
  }
});

