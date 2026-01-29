// Admin JavaScript for Trading Platform

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Handle success message fadeout
  const successAlert = document.querySelector('.alert-success');
  
  if (successAlert) {
    setTimeout(() => {
      successAlert.style.opacity = '0';
      setTimeout(() => {
        successAlert.style.display = 'none';
      }, 500);
    }, 3000);
  }
});