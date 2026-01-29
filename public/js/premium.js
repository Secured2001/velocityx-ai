(function(){
  // Defensive guards
  if(typeof window === 'undefined') return;
  // IntersectionObserver for reveal
  function setupReveal(){
    try{
      const els = document.querySelectorAll('.reveal');
      if(!els || els.length===0) return;
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(ent=>{
          if(ent.isIntersecting){ ent.target.classList.add('in-view'); io.unobserve(ent.target);} 
        });
      },{threshold:0.12});
      els.forEach(el=>io.observe(el));
    }catch(e){/* ignore */}
  }

  // Count-up animation
  function animateCounts(){
    try{
      const counts = document.querySelectorAll('[data-count]');
      counts.forEach(el=>{
        if(el.__countStarted) return; el.__countStarted = true;
        const target = Number(el.getAttribute('data-count')||0);
        const duration = Number(el.getAttribute('data-duration')||1200);
        let start = null; const startVal = 0;
        function step(ts){ if(!start) start=ts; const progress=Math.min(1,(ts-start)/duration); const cur = Math.floor(progress*target); el.textContent = (el.getAttribute('data-prefix')||'') + cur.toLocaleString(); if(progress<1) requestAnimationFrame(step); else el.textContent = (el.getAttribute('data-prefix')||'') + target.toLocaleString(); }
        requestAnimationFrame(step);
      });
    }catch(e){}
  }

  // simple icon small animation toggles
  function initIconAnimations(){
    try{
      document.querySelectorAll('.icon-animate').forEach(el=>{ el.classList.add('pulse'); });
    }catch(e){}
  }

  // Small DOM-ready helper
  function domReady(cb){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',cb); else cb(); }

  domReady(function(){ setupReveal(); animateCounts(); initIconAnimations();
    // re-run counts when new reveals happen
    try{
      const io2 = new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting){ animateCounts(); io2.unobserve(e.target); } }); },{threshold:0.2});
      document.querySelectorAll('[data-count]').forEach(el=>io2.observe(el));
    }catch(e){}
  });
})();

/* ===================================
   PREMIUM FINTECH INTERACTIONS
   VelocityX Trading Platform
   =================================== */

(function() {
  'use strict';

  // ===================================
  // REVEAL ANIMATIONS ON SCROLL
  // ===================================
  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach((element) => {
      revealObserver.observe(element);
    });
  }

  // ===================================
  // COUNTER ANIMATION
  // ===================================
  function animateCounter(element, target, duration = 2000, prefix = '', suffix = '') {
    const start = 0;
    const range = target - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      let displayValue = Math.floor(current).toLocaleString();
      element.textContent = prefix + displayValue + suffix;
    }, 16);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          const target = parseInt(entry.target.dataset.count);
          const duration = parseInt(entry.target.dataset.duration) || 2000;
          const prefix = entry.target.dataset.prefix || '';
          const suffix = entry.target.dataset.suffix || '';
          animateCounter(entry.target, target, duration, prefix, suffix);
        }
      });
    }, {
      threshold: 0.5
    });

    counters.forEach((counter) => {
      counterObserver.observe(counter);
    });
  }

  // ===================================
  // LIVE CHART RENDERING
  // ===================================
  function initLiveChart() {
    const canvas = document.getElementById('vxLiveChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let currentTab = 'indices';

    // Set canvas size
    function resizeCanvas() {
      const parent = canvas.parentElement;
      canvas.width = parent.offsetWidth;
      canvas.height = 350;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Market data simulation
    const marketData = {
      indices: {
        name: 'S&P 500',
        color: '#10b981',
        volatility: 0.8,
        trend: 0.02
      },
      fx: {
        name: 'EUR/USD',
        color: '#3b82f6',
        volatility: 1.2,
        trend: -0.01
      },
      crypto: {
        name: 'BTC/USD',
        color: '#f59e0b',
        volatility: 2.5,
        trend: 0.05
      }
    };

    let dataPoints = [];
    let time = 0;

    function generateData() {
      const market = marketData[currentTab];
      const baseValue = 50;

      if (dataPoints.length === 0) {
        for (let i = 0; i < 60; i++) {
          dataPoints.push(baseValue + Math.random() * 20);
        }
      }

      // Shift and add new point
      dataPoints.shift();
      const lastValue = dataPoints[dataPoints.length - 1];
      const change = (Math.random() - 0.5) * market.volatility + market.trend;
      const newValue = Math.max(20, Math.min(80, lastValue + change));
      dataPoints.push(newValue);
      time++;
    }

    function drawGrid() {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
      ctx.lineWidth = 1;

      // Horizontal lines
      for (let i = 0; i <= 5; i++) {
        const y = (canvas.height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Vertical lines
      for (let i = 0; i <= 10; i++) {
        const x = (canvas.width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    }

    function drawChart() {
      const market = marketData[currentTab];
      const padding = 40;
      const chartHeight = canvas.height - padding * 2;
      const chartWidth = canvas.width - padding * 2;
      const step = chartWidth / (dataPoints.length - 1);

      // Draw line
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = market.color;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      dataPoints.forEach((value, index) => {
        const x = padding + index * step;
        const y = canvas.height - padding - (value / 100) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw gradient fill
      ctx.lineTo(canvas.width - padding, canvas.height - padding);
      ctx.lineTo(padding, canvas.height - padding);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, market.color + '40');
      gradient.addColorStop(1, market.color + '00');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw last value indicator
      const lastX = canvas.width - padding;
      const lastY = canvas.height - padding - (dataPoints[dataPoints.length - 1] / 100) * chartHeight;

      ctx.beginPath();
      ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
      ctx.fillStyle = market.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      generateData();
      drawChart();
      animationId = requestAnimationFrame(animate);
    }

    animate();

    // Tab switching
    const tabs = document.querySelectorAll('.vx-chart-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.type || 'indices';
        dataPoints = []; // Reset data for new tab
      });
    });
  }

  // ===================================
  // INSIGHT CARDS EXPAND/COLLAPSE
  // ===================================
  function initInsightCards() {
    const cards = document.querySelectorAll('.vx-insight-card');

    cards.forEach(card => {
      const toggle = card.querySelector('.vx-insight-toggle');
      const expanded = card.querySelector('.vx-insight-expanded');

      if (toggle && expanded) {
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const isActive = expanded.classList.contains('active');

          if (isActive) {
            expanded.classList.remove('active');
            toggle.textContent = 'Read more';
          } else {
            expanded.classList.add('active');
            toggle.textContent = 'Show less';
          }
        });
      }
    });
  }

  // ===================================
  // ICON ANIMATION ON HOVER
  // ===================================
  function initIconAnimations() {
    const iconCircles = document.querySelectorAll('.vx-icon-circle');

    iconCircles.forEach(circle => {
      const card = circle.closest('.vx-why-card');
      if (card) {
        card.addEventListener('mouseenter', () => {
          circle.style.transform = 'scale(1.1) rotate(5deg)';
        });
        card.addEventListener('mouseleave', () => {
          circle.style.transform = 'scale(1) rotate(0deg)';
        });
      }
    });
  }

  // ===================================
  // PLAN CARD INTERACTIONS
  // ===================================
  function initPlanCards() {
    const planCards = document.querySelectorAll('.vx-plan-card');

    planCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        planCards.forEach(c => {
          if (c !== card) {
            c.style.opacity = '0.6';
            c.style.transform = 'scale(0.97)';
          }
        });
      });

      card.addEventListener('mouseleave', function() {
        planCards.forEach(c => {
          c.style.opacity = '1';
          c.style.transform = 'scale(1)';
        });
      });
    });
  }

  // ===================================
  // SPARKLINE MINI CHARTS
  // ===================================
  function drawSparkline(canvas, color = '#3b82f6') {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const data = Array.from({length: 30}, () => Math.random() * 0.6 + 0.2);

    function render() {
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      data.push(Math.max(0, Math.min(1, data.shift() + (Math.random() - 0.5) * 0.1)));

      const step = width / (data.length - 1);
      data.forEach((v, i) => {
        const x = i * step;
        const y = height - v * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
      requestAnimationFrame(render);
    }

    render();
  }

  // ===================================
  // LIVE MARKET DATA TICKER
  // ===================================
  function initMarketTicker() {
    const ticker = document.querySelector('.vx-ticker-inline');
    if (!ticker) return;

    const markets = [
      { name: 'US500', value: 5998.5, change: 0.42 },
      { name: 'BTCUSD', value: 86335.00, change: -1.2 },
      { name: 'XAUUSD', value: 2687.50, change: 0.18 },
      { name: 'EURUSD', value: 1.0845, change: -0.05 }
    ];

    function updateTicker() {
      markets.forEach(market => {
        market.change += (Math.random() - 0.5) * 0.2;
        market.value *= (1 + market.change / 10000);
      });

      const tickerText = markets.map(m => {
        const changeClass = m.change >= 0 ? 'positive' : 'negative';
        const sign = m.change >= 0 ? '+' : '';
        return `<span class="ticker-item-inline"><strong>${m.name}</strong> ${m.value.toFixed(2)} <span class="${changeClass}">${sign}${m.change.toFixed(2)}%</span></span>`;
      }).join(' • ');

      ticker.innerHTML = `LIVE • ${tickerText}`;
    }

    updateTicker();
    setInterval(updateTicker, 3000);
  }

  // ===================================
  // PARALLAX EFFECT FOR HEADERS
  // ===================================
  function initParallax() {
    const sections = document.querySelectorAll('.vx-why-trade-section, .vx-intelligence-section');

    window.addEventListener('scroll', () => {
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const scrolled = window.pageYOffset;

        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const yPos = -(scrolled * 0.3);
          const bg = section.querySelector('.vx-why-header, .vx-intelligence-header');
          if (bg) {
            bg.style.transform = `translateY(${yPos}px)`;
          }
        }
      });
    });
  }

  // ===================================
  // 3D TILT EFFECT ON CARDS
  // ===================================
  function init3DTilt() {
    const cards = document.querySelectorAll('.vx-product-card, .vx-investor-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  // ===================================
  // FLOATING ANIMATION FOR BADGES
  // ===================================
  function initFloatingBadges() {
    const badges = document.querySelectorAll('.vx-why-badge, .vx-leadership-badge, .vx-intelligence-badge, .vx-plans-badge');

    badges.forEach((badge, index) => {
      badge.style.animation = `float 3s ease-in-out infinite`;
      badge.style.animationDelay = `${index * 0.2}s`;
    });
  }

  // ===================================
  // INITIALIZE ALL ON DOM READY
  // ===================================
  function init() {
    try {
      initRevealAnimations();
      initCounters();
      initLiveChart();
      initInsightCards();
      initIconAnimations();
      initPlanCards();
      initMarketTicker();
      initParallax();
      init3DTilt();
      initFloatingBadges();

      // Initialize sparklines if any exist
      document.querySelectorAll('.mini-sparkline').forEach(canvas => {
        drawSparkline(canvas);
      });

      console.log('velocityx-ai Premium features initialized');
    } catch (error) {
      console.error('Error initializing premium features:', error);
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export functions for external use if needed
  window.VelocityXPremium = {
    init,
    initLiveChart,
    drawSparkline,
    animateCounter
  };

})();
