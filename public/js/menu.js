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
      
      const imageUrl = item.image_url || 'assets/images/brand/LOGO-FULL.png';
      const imageHtml = `<img src="${imageUrl}" alt="${item.name}">`;

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

    // Add event listeners to buttons
    menuGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.id;
        const userStr = localStorage.getItem('user');
        
        if (!userStr) {
          showNotification('Please sign in to add items to your cart.', 'info');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
          return;
        }

        const user = JSON.parse(userStr);

        try {
          const response = await fetch(`/api/cart/${user.id}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              menu_item_id: itemId,
              quantity: 1
            })
          });

          if (response.ok) {
            showNotification('Item added to cart!', 'success');
          } else {
            const res = await response.json();
            showNotification(res.error || 'Failed to add item to cart.', 'error');
          }
        } catch (err) {
          console.error('Error adding to cart:', err);
        }
      });
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
