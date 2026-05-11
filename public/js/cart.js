/* cart.js - Dynamic Cart Management */

document.addEventListener('DOMContentLoaded', () => {
  const cartList = document.querySelector('.cart-items-list');
  const subtotalLabel = document.querySelector('.summary-row span');
  const totalPriceLabel = document.querySelector('.total-price');
  const checkoutBtn = document.querySelector('.btn-checkout');
  const selectAllCheckbox = document.getElementById('select-all-checkbox');
  const selectAllLabel = document.querySelector('label[for="select-all-checkbox"]');

  let cartData = [];

  async function fetchCart() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      showNotification('Please sign in to view your cart.', 'info');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      return;
    }

    const user = JSON.parse(userStr);

    try {
      const response = await fetch(`/api/cart/${user.id}`);
      cartData = await response.json();
      renderCart();
    } catch (err) {
      console.error('Error fetching cart:', err);
      cartList.innerHTML = '<p>Error loading cart items.</p>';
    }
  }

  function renderCart() {
    cartList.innerHTML = '';
    
    if (cartData.length === 0) {
      cartList.innerHTML = '<div style="padding: 40px; text-align: center;"><p>Your cart is empty.</p><a href="menu.html" class="text-accent" style="font-weight: 700;">Browse Menu</a></div>';
      updateSummary(0);
      selectAllLabel.textContent = 'SELECT ALL (0)';
      return;
    }

    let total = 0;
    cartData.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <div class="item-checkbox">
          <input type="checkbox" checked data-id="${item.id}">
        </div>
        <div class="item-image">
          <img src="${item.image_url || 'assets/images/brand/LOGO-FULL.png'}" alt="${item.name}">
        </div>
        <div class="item-details">
          <div class="item-info">
            <span class="item-tag">${item.category}</span>
            <h3 class="item-name font-display">${item.name.toUpperCase()}</h3>
            ${item.variation ? `<p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Variation: ${item.variation}</p>` : ''}
            <div class="item-quantity">
              <label>QUANTITY</label>
              <div class="quantity-controls">
                <button class="qty-btn minus" data-id="${item.id}">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn plus" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
          <div class="item-actions">
            <button class="remove-btn" data-id="${item.id}">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5H17M2 5L3 17C3 18.1046 3.89543 19 5 19H13C14.1046 19 15 18.1046 15 17L16 5M6 5V2C6 1.44772 6.44772 1 7 1H11C11.5523 1 12 1.44772 12 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <span class="item-price">PHP ${itemTotal.toFixed(2)}</span>
          </div>
        </div>
      `;
      cartList.appendChild(cartItem);
    });

    selectAllLabel.textContent = `SELECT ALL (${cartData.length})`;
    updateSummary(total);
    attachListeners();
  }

  function updateSummary(total) {
    subtotalLabel.textContent = `SUBTOTAL (${cartData.length} ITEMS)`;
    totalPriceLabel.textContent = `PHP ${total.toFixed(2)}`;
  }

  function attachListeners() {
    // Remove Item
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        try {
          const response = await fetch(`/api/cart/item/${id}`, { method: 'DELETE' });
          if (response.ok) {
            cartData = cartData.filter(i => i.id != id);
            renderCart();
          }
        } catch (err) {
          console.error('Error removing item:', err);
        }
      });
    });

    // Quantity Buttons
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const item = cartData.find(i => i.id == id);
        if (!item) return;

        let newQty = item.quantity;
        if (btn.classList.contains('plus')) {
          newQty++;
        } else if (btn.classList.contains('minus') && newQty > 1) {
          newQty--;
        } else {
          return; // Don't update if minus clicked at 1
        }

        try {
          const response = await fetch(`/api/cart/item/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQty })
          });

          if (response.ok) {
            item.quantity = newQty;
            renderCart();
          }
        } catch (err) {
          console.error('Error updating quantity:', err);
        }
      });
    });
  }

  // Checkout Logic
  checkoutBtn.addEventListener('click', () => {
    if (cartData.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    window.location.href = 'checkout.html';
  });

  fetchCart();
});
