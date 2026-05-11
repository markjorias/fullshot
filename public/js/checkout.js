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
  
  // --- Pre-fill user data ---
  const editNameInput = document.getElementById('edit-name');
  const displayName = document.getElementById('display-name');
  if (user && editNameInput) {
    const fullName = `${user.first_name} ${user.last_name}`;
    editNameInput.value = fullName;
    if (displayName) displayName.textContent = fullName;
  }

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
          <img src="${item.image_url || 'assets/images/brand/LOGO-FULL.png'}" alt="${item.name}">
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

  // --- Order Type Toggle Logic ---
  const btnDelivery = document.getElementById('btn-delivery');
  const btnDineIn = document.getElementById('btn-dine-in');
  const addressFields = document.getElementById('edit-address-fields');
  const displayOrderType = document.getElementById('display-order-type');
  const addressInfo = document.getElementById('display-address-info');
  
  let selectedOrderType = 'Delivery';

  if (btnDelivery && btnDineIn) {
    btnDelivery.addEventListener('click', () => {
      btnDelivery.classList.add('active');
      btnDineIn.classList.remove('active');
      addressFields?.classList.remove('hidden');
      selectedOrderType = 'Delivery';
    });

    btnDineIn.addEventListener('click', () => {
      btnDineIn.classList.add('active');
      btnDelivery.classList.remove('active');
      addressFields?.classList.add('hidden');
      selectedOrderType = 'Dine In';
    });
  }

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
      if (displayName) displayName.textContent = name;
      
      if (displayOrderType) {
        displayOrderType.textContent = selectedOrderType;
        if (selectedOrderType === 'Dine In') {
          displayOrderType.classList.remove('hidden');
          addressInfo?.classList.add('hidden');
        } else {
          displayOrderType.classList.add('hidden');
          addressInfo?.classList.remove('hidden');
        }
      }

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
