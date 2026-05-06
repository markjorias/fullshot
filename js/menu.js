/* menu.js - Menu filtering and dynamic loading logic */

document.addEventListener('DOMContentLoaded', () => {
  const filterItems = document.querySelectorAll('.filter-item');
  const menuGrid = document.querySelector('.menu-grid');

  async function fetchAndRenderMenu(category = 'All') {
    try {
      const response = await fetch(`/api/menu?category=${encodeURIComponent(category)}`);
      const menuItems = await response.json();
      renderMenu(menuItems);
    } catch (error) {
      console.error('Error fetching menu:', error);
      menuGrid.innerHTML = '<p>Error loading menu items. Please try again later.</p>';
    }
  }

  function renderMenu(items) {
    menuGrid.innerHTML = ''; // Clear current items

    if (items.length === 0) {
      menuGrid.innerHTML = '<p>No items found in this category.</p>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';
      
      const imageUrl = item.image_url || '';
      const imageHtml = imageUrl 
        ? `<img src="${imageUrl}" alt="${item.name}">` 
        : '';

      card.innerHTML = `
        <a href="item_details.html?id=${item.id}">
          <div class="item-image">
            ${imageHtml}
          </div>
        </a>
        <div class="item-info">
          <span class="item-category">${item.category}</span>
          <h4 class="item-name">${item.name}</h4>
          <p class="item-desc">${item.description || 'Available in different sizes & variations'}</p>
          <span class="item-price">PHP ${item.price.toFixed(2)}</span>
        </div>
        <button class="add-to-cart-btn" data-id="${item.id}">
          <img src="assets/images/icons/plus.svg" alt="Add">
        </button>
      `;
      menuGrid.appendChild(card);
    });
  }

  // Initial load
  fetchAndRenderMenu();

  // Filter click handlers
  filterItems.forEach(filter => {
    filter.addEventListener('click', () => {
      // Update active state in UI
      filterItems.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');

      const selectedCategory = filter.querySelector('span').textContent.trim();
      fetchAndRenderMenu(selectedCategory);
    });
  });
});
