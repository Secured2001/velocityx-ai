// Trade functionality
document.addEventListener('DOMContentLoaded', () => {
  const canTrade = document.querySelector('[data-can-trade]')?.dataset.canTrade === 'true';
  const startTradeBtn = document.getElementById('startTradeBtn');
  const tradeModal = document.getElementById('tradeModal');
  const successModal = document.getElementById('successModal');
  const errorModal = document.getElementById('errorModal');
  const amountInput = document.getElementById('tradeAmount');
  const signalSelect = document.getElementById('signalSelect');
  
  const userBalanceElements = document.querySelectorAll('.user-balance');
  const userBalance = userBalanceElements.length ? parseFloat(userBalanceElements[0].textContent.replace('$', '')) : 0;
  
 
  
  if (startTradeBtn) {
    startTradeBtn.disabled = !canTrade;
    
    startTradeBtn.addEventListener('click', () => {
      showModal('tradeModal');
    });
  }
  
  window.confirmTrade = async () => {
    const amount = parseFloat(amountInput.value);
    const selectedSignal = signalSelect.value;
    
    if (!selectedSignal) {
      showModal('errorModal', 'Error', 'Please select a trading signal');
      return;
    }
    
    if (isNaN(amount) || amount < 10) {
      showModal('errorModal', 'Invalid Amount', 'Minimum trade amount is $10.00');
      return;
    }
    
    if (amount > userBalance) {
      showModal('errorModal', 'Insufficient Balance', 'You do not have enough balance for this trade.');
      return;
    }
    
    try {
      // Send trade request to server
      const response = await fetch('/user/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          signal: selectedSignal
        })
      });
      
      if (!response.ok) {
        throw new Error('Trade failed');
      }
      
      const data = await response.json();
      
      // Update all balance displays on the page
      const newBalance = data.newBalance;
      userBalanceElements.forEach(element => {
        element.textContent = `$${newBalance.toFixed(2)}`;
      });
      
      // Close trade modal and show success message
      closeModal('tradeModal');
      showSuccessMessage();
      
    } catch (error) {
      showModal('errorModal', 'Error', 'Failed to process trade. Please try again.');
    }
  };
  
  window.closeModal = (modalId) => {
    document.getElementById(modalId).classList.remove('show');
  };
  
  function showModal(modalId, title, message) {
    const modal = document.getElementById(modalId);
    if (modal) {
      const titleEl = modal.querySelector('.modal-title');
      const messageEl = modal.querySelector('.modal-message');
      
      if (titleEl && title) titleEl.textContent = title;
      if (messageEl && message) messageEl.textContent = message;
      
      modal.classList.add('show');
    }
  }
  
  function showSuccessMessage() {
    const modal = document.getElementById('successModal');
    const content = `
      <div class="success-message">
        <i class="fas fa-check-circle"></i>
        <h3>Trading Initiated!</h3>
        <p>Check your email for updates. You'll receive a notification within 24 hours regarding your profit.</p>
        <button onclick="closeModal('successModal')" class="btn btn-primary">OK</button>
      </div>
    `;
    
    modal.querySelector('.modal-content').innerHTML = content;
    modal.classList.add('show');
  }
});

function initTradingChart() {
  const chartCanvas = document.getElementById('tradingChart');
  const traderOverlay = document.getElementById('traderOverlay');

  if (!chartCanvas || !traderOverlay) return;

  const ctx = chartCanvas.getContext('2d');

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: generateTimeLabels(40),
      datasets: [{
        label: 'EUR/USD',
        data: generatePriceData(40),
        borderColor: '#00c7ff',
        backgroundColor: 'rgba(0, 199, 255, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#00f7ff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#a0aec0' } },
        x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#a0aec0', maxRotation: 0 } }
      }
    },
    plugins: [{
      afterDraw: chart => {
        traderOverlay.innerHTML = '';
        const meta = chart.getDatasetMeta(0);

        // const names = [
        //   'Alice', 'Raj', 'Chen', 'Maria', 'Liam', 'Zara', 'Noah', 'Emily', 'John', 'Mei',
        //   'Victor', 'Sandra', 'Ahmed', 'Yuki', 'Carlos', 'Anna', 'Leo', 'Grace', 'Isaac', 'Sophie',
        //   'Omar', 'Julia', 'Arjun', 'Daisy', 'Tyler', 'Natalie', 'Ibrahim', 'Fatima', 'Mateo', 'Elena',
        //   'James', 'Amara', 'Max', 'Nia', 'Ethan', 'Tina', 'Hassan', 'Ruby', 'Lucas', 'Chloe'
        // ];

        meta.data.forEach((point, index) => {
          // const name = names[index % names.length];
          const amount = `$${(Math.random() * 900 + 100).toFixed(0)}`;
          const bubble = document.createElement('div');
          bubble.className = 'trader-bubble';
          bubble.style.left = `${point.x}px`;
          bubble.style.top = `${point.y}px`;
          bubble.style.setProperty('--delay', `${(index % 10) * 0.2}s`);
          bubble.style.backgroundImage = `url('https://i.pravatar.cc/40?img=${index + 1}')`;

          const info = document.createElement('span');
          info.innerText = `${amount}`;
          bubble.appendChild(info);
          traderOverlay.appendChild(bubble);
        });
      }
    }]
  });

  setInterval(() => {
    const data = chart.data.datasets[0].data;
    data.shift();
    data.push(generateNextPrice(data[data.length - 1]));

    const labels = chart.data.labels;
    labels.shift();
    labels.push(generateNextTimeLabel());

    chart.update('none');
  }, 2000);

  // Responsive chart resizing
  new ResizeObserver(() => chart.resize()).observe(chartCanvas);
}

function generateTimeLabels(count) {
  const labels = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * 60000);
    labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  }
  return labels;
}

function generatePriceData(count) {
  const data = [];
  let price = 1.0850;
  for (let i = 0; i < count; i++) {
    price += (Math.random() - 0.5) * 0.0010;
    data.push(price);
  }
  return data;
}

function generateNextPrice(lastPrice) {
  return lastPrice + (Math.random() - 0.5) * 0.0010;
}

function generateNextTimeLabel() {
  const time = new Date();
  return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

window.addEventListener('DOMContentLoaded', initTradingChart);

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});
const thoughtBubbleZone = document.getElementById('thoughtBubbleZone');

const thoughts = [
  { text: "Feeling confident!", emoji: "😎" },
  { text: "AI's got this.", emoji: "🤖" },
  { text: "Holding steady...", emoji: "🧘" },
  { text: "Risk? Calculated.", emoji: "🧠" },
  { text: "Vibes align. Entry made.", emoji: "✨" },
  { text: "Technicals say yes.", emoji: "📊" },
  { text: "Market whispering again...", emoji: "🌌" },
  { text: "Momentum is spicy 🌶️", emoji: "🔥" },
];

function createThoughtBubble() {
  const bubble = document.createElement('div');
  bubble.className = 'thought-bubble';

  const randomIndex = Math.floor(Math.random() * thoughts.length);
  const confidence = Math.floor(Math.random() * 41) + 60; // 60–100%
  const avatarId = Math.floor(Math.random() * 40) + 1;

  const avatar = document.createElement('img');
  avatar.src = `https://i.pravatar.cc/40?img=${avatarId}`;

  const content = document.createElement('span');
  content.innerText = `"${thoughts[randomIndex].text}" ${thoughts[randomIndex].emoji} • ${confidence}%`;

  bubble.appendChild(avatar);
  bubble.appendChild(content);

  // Random X position
  bubble.style.left = `${Math.random() * 80 + 5}%`;

  thoughtBubbleZone.appendChild(bubble);

  // Remove after animation ends
  setTimeout(() => {
    bubble.remove();
  }, 6000);
}

// Create a new thought every 3 seconds
setInterval(createThoughtBubble, 3000);