// Animations JavaScript for Trading Platform

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get chart illustration element
  const chartIllustration = document.querySelector('.chart-illustration');
  
  if (!chartIllustration) return;
  
  // Create animated chart lines
  const createChartAnimation = () => {
    // Clear existing chart content
    chartIllustration.innerHTML = '';
    
    // Create chart line elements
    for (let i = 0; i < 10; i++) {
      const line = document.createElement('div');
      line.className = 'chart-line';
      
      // Randomize height and position
      const height = 40 + Math.random() * 120;
      const left = i * 10;
      
      // Apply styles
      line.style.height = `${height}px`;
      line.style.left = `${left}%`;
      line.style.width = '5px';
      line.style.position = 'absolute';
      line.style.bottom = '0';
      line.style.backgroundColor = '#3b82f6';
      line.style.opacity = 0.7;
      line.style.borderRadius = '2px 2px 0 0';
      
      // Add animation
      line.style.animation = `barAnimation 1.5s ease-in-out infinite`;
      line.style.animationDelay = `${i * 0.1}s`;
      
      // Add to chart
      chartIllustration.appendChild(line);
    }
    
    // Add animation keyframes
    if (!document.getElementById('chartAnimationStyle')) {
      const style = document.createElement('style');
      style.id = 'chartAnimationStyle';
      style.textContent = `
        @keyframes barAnimation {
          0%, 100% { height: var(--height); }
          50% { height: calc(var(--height) * 1.2); }
        }
      `;
      document.head.appendChild(style);
    }
  };
  
  // Initialize chart animation
  createChartAnimation();
});