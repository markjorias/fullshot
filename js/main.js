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
});
