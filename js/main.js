/* main.js - General Interactivity */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Half Shot Coffee site initialized.');

  // --- Featured Products Loader ---
  async function loadFeaturedItems() {
    try {
      const response = await fetch('/api/featured?full=true');
      const featured = await response.json();

      // 1. Populate Bestseller Section (Drinks)
      const drinkSection = document.getElementById('featured-drinks-section');
      if (drinkSection && featured.bestseller && featured.bestseller.length > 0) {
        renderFeaturedSection(drinkSection, featured.bestseller);
      }

      // 2. Populate Our Snacks Section
      const snackSection = document.getElementById('featured-snacks-section');
      if (snackSection && featured.snacks && featured.snacks.length > 0) {
        renderFeaturedSection(snackSection, featured.snacks);
      }

      // 3. Populate More to Try Section
      const moreSection = document.getElementById('featured-more-grid');
      if (moreSection && featured.more_to_try && featured.more_to_try.length > 0) {
        moreSection.innerHTML = '';
        featured.more_to_try.forEach(item => {
          const card = document.createElement('div');
          card.className = 'menu-card';
          card.innerHTML = `
            <div class="menu-card-bg">
              <img src="${item.image_url || 'https://via.placeholder.com/300'}" alt="${item.name}">
              <div class="menu-card-overlay"></div>
            </div>
            <div class="menu-card-content">
              <div class="menu-card-info">
                <h4>${item.name}</h4>
                <p>${item.description || ''}</p>
                <span class="price">PHP ${item.price.toFixed(2)}</span>
              </div>
              <button class="add-btn" data-id="${item.id}"><img src="assets/images/icons/plus.svg" alt="Add"></button>
            </div>
          `;
          moreSection.appendChild(card);
        });
      }

    } catch (err) {
      console.error('Error loading featured items:', err);
    }
  }

  function renderFeaturedSection(section, items) {
    const tabContainer = section.querySelector('.selection-tabs');
    const imageElement = section.querySelector('.bestseller-image img');
    const titleElement = section.querySelector('.section-title');
    const descElement = section.querySelector('.section-desc');

    if (!tabContainer || !imageElement) return;

    tabContainer.innerHTML = '';
    items.forEach((item, index) => {
      const tab = document.createElement('span');
      tab.className = 'tab' + (index === 0 ? ' active' : '');
      tab.textContent = item.name.toUpperCase();
      
      tab.addEventListener('click', () => {
        section.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update Image and Text
        imageElement.src = item.image_url || 'https://via.placeholder.com/500';
        imageElement.alt = item.name;
        // Optionally update title/desc if desired, but request specifically mentioned image
      });

      tabContainer.appendChild(tab);
    });

    // Set initial state (first item)
    if (items[0]) {
      imageElement.src = items[0].image_url || 'https://via.placeholder.com/500';
      imageElement.alt = items[0].name;
    }
  }

  loadFeaturedItems();

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

  // Handle option button selection (Variation, Size, Add-ons)
  const optionButtons = document.querySelectorAll('.option-btn');
  optionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const section = button.closest('div');
      if (section) {
        section.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      }
    });
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
