/* checkout.js - Checkout Flow Logic */

document.addEventListener('DOMContentLoaded', () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(userStr);
  const placeOrderBtn = document.getElementById('place-order-btn');
  const summaryItemsContainer = document.getElementById('checkout-summary-items');
  const subtotalVal = document.querySelector('.subtotal');
  const totalVal = document.querySelector('.total-price');

  let currentCart = [];

  async function fetchCheckoutSummary() {
    try {
      const response = await fetch(`/api/cart/${user.id}`);
      currentCart = await response.json();
      
      if (currentCart.length === 0) {
        alert('Your cart is empty.');
        window.location.href = 'menu.html';
        return;
      }

      renderSummary();
    } catch (err) {
      console.error('Error fetching checkout data:', err);
    }
  }

  function renderSummary() {
    summaryItemsContainer.innerHTML = '';
    let subtotal = 0;
    
    currentCart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      const itemEl = document.createElement('div');
      itemEl.className = 'summary-item';
      itemEl.innerHTML = `
        <div class="item-img">
          <img src="${item.image_url || 'https://via.placeholder.com/64'}" alt="${item.name}">
        </div>
        <div class="item-info">
          <h3 class="item-name">${item.name} ${item.size ? `(${item.size})` : ''}</h3>
          <p class="item-desc">${item.variation || ''} x${item.quantity}</p>
        </div>
        <div class="item-price">PHP ${itemTotal.toFixed(2)}</div>
      `;
      summaryItemsContainer.appendChild(itemEl);
    });

    if (subtotalVal) subtotalVal.textContent = `PHP ${subtotal.toFixed(2)}`;
    if (totalVal) totalVal.textContent = `PHP ${subtotal.toFixed(2)}`; 
  }

  // --- UI Interactivity (Payment & Shipping) ---
  const paymentOptions = document.querySelectorAll('.payment-option');
  const cardFormSection = document.getElementById('card-form-section');

  paymentOptions.forEach(option => {
    option.addEventListener('click', () => {
      paymentOptions.forEach(opt => {
        opt.classList.remove('selected');
        const check = opt.querySelector('.check-mark');
        if (check) check.remove();
      });
      option.classList.add('selected');
      const checkMark = document.createElement('div');
      checkMark.className = 'check-mark';
      checkMark.textContent = '✓';
      option.appendChild(checkMark);

      if (option.dataset.method === 'card') {
        cardFormSection?.classList.remove('hidden');
      } else {
        cardFormSection?.classList.add('hidden');
      }
    });
  });

  const editBtn = document.getElementById('edit-shipping-btn');
  const displaySection = document.getElementById('shipping-display');
  const editFormSection = document.getElementById('shipping-edit-form');
  const cancelBtn = document.getElementById('cancel-shipping-btn');
  const saveBtn = document.getElementById('save-shipping-btn');

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      displaySection.classList.add('hidden');
      editFormSection.classList.remove('hidden');
      editBtn.classList.add('hidden');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      displaySection.classList.remove('hidden');
      editFormSection.classList.add('hidden');
      editBtn.classList.remove('hidden');
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = document.getElementById('edit-name').value;
      document.getElementById('display-name').textContent = name;
      displaySection.classList.remove('hidden');
      editFormSection.classList.add('hidden');
      editBtn.classList.remove('hidden');
    });
  }

  // --- Place Order ---
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const orderData = {
        user_id: user.id,
        customer_name: document.getElementById('display-name').textContent || `${user.first_name} ${user.last_name}`,
        total_price: parseFloat(totalVal.textContent.replace('PHP ', ''))
      };

      try {
        const response = await fetch('/api/orders/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        const result = await response.json();
        if (response.ok) {
          alert('Order placed successfully!');
          window.location.href = `order_status.html?id=${result.orderId}`;
        } else {
          alert('Checkout failed: ' + result.error);
        }
      } catch (err) {
        console.error('Error placing order:', err);
      }
    });
  }

  fetchCheckoutSummary();
});
