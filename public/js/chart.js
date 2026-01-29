// Chart JavaScript for Trading Platform

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get chart canvas element
  const chartCanvas = document.getElementById('forexChart');
  const chartLoading = document.getElementById('chartLoading');
  const timeframeSelector = document.getElementById('timeframeSelector');
  
  if (!chartCanvas) return;
  
  // Set canvas size and context
  const ctx = chartCanvas.getContext('2d');
  chartCanvas.width = chartCanvas.parentElement.clientWidth;
  chartCanvas.height = 350;
  
  // Chart settings
  const settings = {
    padding: 40,
    gridLines: 5,
    dataPoints: 100,
    animated: true,
    animationSpeed: 30,
    timeframe: '1d'
  };
  
  // Colors
  const colors = {
    line: '#3b82f6',
    grid: '#e5e7eb',
    text: '#6b7280',
    green: '#10b981',
    red: '#ef4444',
    greenLight: 'rgba(16, 185, 129, 0.1)',
    redLight: 'rgba(239, 68, 68, 0.1)'
  };
  
  // Generate random price data
  const generateData = (points, timeframe) => {
    const data = [];
    let baseValue = 1.0850;
    const volatility = {
      '1h': 0.0005,
      '4h': 0.0010,
      '1d': 0.0020,
      '1w': 0.0050
    };
    
    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * volatility[timeframe];
      baseValue += change;
      
      // Add occasional trend to make it more realistic
      if (i % 10 === 0) {
        baseValue += (Math.random() - 0.5) * volatility[timeframe] * 3;
      }
      
      data.push({
        value: baseValue,
        timestamp: new Date(Date.now() - (points - i) * getTimeframeMs(timeframe))
      });
    }
    
    return data;
  };
  
  // Helper to convert timeframe to milliseconds
  const getTimeframeMs = (timeframe) => {
    switch (timeframe) {
      case '1h': return 60 * 60 * 1000 / settings.dataPoints;
      case '4h': return 4 * 60 * 60 * 1000 / settings.dataPoints;
      case '1d': return 24 * 60 * 60 * 1000 / settings.dataPoints;
      case '1w': return 7 * 24 * 60 * 60 * 1000 / settings.dataPoints;
      default: return 24 * 60 * 60 * 1000 / settings.dataPoints;
    }
  };
  
  // Format timestamp based on timeframe
  const formatTimestamp = (timestamp, timeframe) => {
    const date = new Date(timestamp);
    
    switch (timeframe) {
      case '1h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '4h':
        return `${date.getHours()}:00`;
      case '1d':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case '1w':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };
  
  // Draw chart grid
  const drawGrid = () => {
    const { width, height } = chartCanvas;
    const { padding, gridLines } = settings;
    
    ctx.beginPath();
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    const verticalStep = (width - padding * 2) / 6;
    for (let i = 0; i <= 6; i++) {
      const x = padding + i * verticalStep;
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
    }
    
    // Horizontal grid lines
    const horizontalStep = (height - padding * 2) / gridLines;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + i * horizontalStep;
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
    }
    
    ctx.stroke();
  };
  
  // Draw chart data
  const drawChart = (data, currentPoint = data.length) => {
    if (currentPoint < 2) return;
    
    const { width, height } = chartCanvas;
    const { padding } = settings;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Get min and max values for scaling
    const values = data.slice(0, currentPoint).map(point => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;
    
    // Add some padding to the range
    const paddedMin = minValue - valueRange * 0.1;
    const paddedMax = maxValue + valueRange * 0.1;
    const paddedRange = paddedMax - paddedMin;
    
    // Clear previous drawing
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    drawGrid();
    
    // Draw axis labels
    ctx.font = '12px sans-serif';
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'left';
    
    // Y-axis labels (prices)
    const horizontalStep = chartHeight / settings.gridLines;
    for (let i = 0; i <= settings.gridLines; i++) {
      const y = padding + i * horizontalStep;
      const value = paddedMax - (i / settings.gridLines) * paddedRange;
      ctx.fillText(value.toFixed(4), 5, y + 4);
    }
    
    // X-axis labels (timestamps)
    const visibleData = data.slice(0, currentPoint);
    const xStep = chartWidth / 6;
    for (let i = 0; i <= 6; i++) {
      const index = Math.floor((i / 6) * (visibleData.length - 1));
      const x = padding + i * xStep;
      const point = visibleData[index];
      if (point) {
        const timestamp = formatTimestamp(point.timestamp, settings.timeframe);
        ctx.textAlign = 'center';
        ctx.fillText(timestamp, x, height - 5);
      }
    }
    
    // Calculate line points
    const points = visibleData.map((point, index) => {
      const x = padding + (index / (visibleData.length - 1)) * chartWidth;
      const normalizedValue = (point.value - paddedMin) / paddedRange;
      const y = height - padding - (normalizedValue * chartHeight);
      return { x, y };
    });
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw area under the line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.lineTo(points[0].x, height - padding);
    ctx.closePath();
    
    // Determine if chart is going up or down overall
    const isUp = points[0].y > points[points.length - 1].y;
    ctx.fillStyle = isUp ? colors.greenLight : colors.redLight;
    ctx.fill();
    
    // Draw dots at each data point
    points.forEach((point, i) => {
      if (i % 10 === 0 || i === points.length - 1) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.line;
        ctx.fill();
      }
    });
  };
  
  // Initialize and animate chart
  const initChart = () => {
    // Show loading
    if (chartLoading) {
      chartLoading.style.display = 'flex';
    }
    
    // Get selected timeframe
    const timeframe = timeframeSelector ? timeframeSelector.value : settings.timeframe;
    settings.timeframe = timeframe;
    
    // Generate data for the selected timeframe
    const data = generateData(settings.dataPoints, timeframe);
    
    // Simulate loading delay for realism
    setTimeout(() => {
      if (chartLoading) {
        chartLoading.style.display = 'none';
      }
      
      if (settings.animated) {
        // Animate chart drawing
        let currentPoint = 2;
        const animate = () => {
          drawChart(data, currentPoint);
          currentPoint++;
          
          if (currentPoint <= data.length) {
            setTimeout(animate, settings.animationSpeed);
          }
        };
        
        animate();
      } else {
        // Draw chart without animation
        drawChart(data);
      }
    }, 1000);
  };
  
  // Initialize chart
  initChart();
  
  // Handle timeframe change
  if (timeframeSelector) {
    timeframeSelector.addEventListener('change', initChart);
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    chartCanvas.width = chartCanvas.parentElement.clientWidth;
    initChart();
  });
});