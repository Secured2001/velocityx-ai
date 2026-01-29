// Withdraw JavaScript for Trading Platform

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  const withdrawForm = document.getElementById('withdrawForm');
  const bitcoinAddressInput = document.getElementById('bitcoinAddress');
  const amountInput = document.getElementById('amount');
  
  if (!withdrawForm) return;
  
  // Basic Bitcoin address validation
  const validateBitcoinAddress = (address) => {
    // This is a very basic validation just for demonstration
    // Real Bitcoin address validation is more complex
    const regex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[ac-hj-np-z02-9]{39,59}$/;
    return regex.test(address);
  };
  
  // Form validation
  withdrawForm.addEventListener('submit', (e) => {
    let isValid = true;
    
    
    // Validate amount
    if (amountInput) {
      const amount = parseFloat(amountInput.value);
      const maxAmount = parseFloat(amountInput.getAttribute('max'));
      
      if (isNaN(amount) || amount <= 0) {
        isValid = false;
        alert('Please enter a valid amount');
      } else if (amount > maxAmount) {
        isValid = false;
        alert(`Amount exceeds available balance of $${maxAmount.toFixed(2)}`);
      }
    }
    
    if (!isValid) {
      e.preventDefault();
    }
  });
});