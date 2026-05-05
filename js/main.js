/* main.js - General Interactivity */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Half Shot Coffee site initialized.');

  // Example: Handle tab switching in Bestseller sections
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const parent = tab.closest('.selection-tabs');
      if (parent) {
        parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      }
    });
  });

  // Adaptive Header Theme
  const header = document.getElementById('main-header');
  const sections = document.querySelectorAll('section[data-header-theme]');
  
  if (header && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-94px 0px 0px 0px', // Header height offset
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const theme = entry.target.getAttribute('data-header-theme');
          header.className = ''; // Clear previous classes
          header.classList.add(`header-theme-${theme}`);
          
          // Re-apply scrolled class if needed
          if (window.scrollY > 50) {
            header.classList.add('scrolled');
          }
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  // Highlight Current Day in Opening Hours
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = days[new Date().getDay()];
  const scheduleRows = document.querySelectorAll('.schedule-row');
  
  scheduleRows.forEach(row => {
    const dayLabel = row.querySelector('span').textContent;
    if (dayLabel === currentDayName) {
      row.classList.add('highlight');
    }
  });

  // Quantity Buttons Logic
  const qtyControls = document.querySelectorAll('.quantity-controls');
  qtyControls.forEach(control => {
    const minusBtn = control.querySelector('.minus');
    const plusBtn = control.querySelector('.plus');
    const qtyVal = control.querySelector('.qty-val');

    minusBtn.addEventListener('click', () => {
      let currentVal = parseInt(qtyVal.textContent);
      if (currentVal > 1) {
        qtyVal.textContent = currentVal - 1;
      }
    });

    plusBtn.addEventListener('click', () => {
      let currentVal = parseInt(qtyVal.textContent);
      qtyVal.textContent = currentVal + 1;
    });
  });
});
