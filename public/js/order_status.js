/* order_status.js - Dynamic Order Tracking */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  if (!orderId) {
    window.location.href = 'index.html';
    return;
  }

  const itemsList = document.querySelector('.order-items-list');
  const totalPriceEl = document.querySelector('.view-receipt'); // Use this for total for now or update HTML

  async function fetchOrderDetails() {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error('Order not found');
      const order = await response.json();
      
      renderOrder(order);
    } catch (err) {
      console.error('Error fetching order status:', err);
      itemsList.innerHTML = '<p>Error loading order details.</p>';
    }
  }

  function renderOrder(order) {
    // 1. Update Status Steps
    const steps = document.querySelectorAll('.tracking-steps .step');
    const statusMap = {
      'Received': 0,
      'Confirmed': 1,
      'Preparing': 1,
      'Ready': 2,
      'Completed': 3
    };

    const currentIdx = statusMap[order.status] || 0;
    steps.forEach((step, index) => {
      step.classList.remove('active', 'completed');
      if (index < currentIdx) {
        step.classList.add('completed');
      } else if (index === currentIdx) {
        step.classList.add('active');
      }
    });

    // 2. Update Items List
    itemsList.innerHTML = '';
    order.items.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'order-item';
      itemEl.innerHTML = `
        <div class="item-image">
          <img src="${item.image_url || 'assets/images/brand/LOGO-FULL.png'}" alt="${item.name}">
        </div>
        <div class="item-info-row">
          <div class="item-main-info">
            <h3 class="item-name">${item.name}</h3>
            <p class="item-sub-details">${item.category}</p>
            <p class="item-price">PHP ${item.price.toFixed(2)}</p>
          </div>
          <div class="item-quantity-info">
            <span>Quantity: ${item.quantity}</span>
          </div>
        </div>
      `;
      itemsList.appendChild(itemEl);
    });

    // 3. Update Estimated Time
    const readyTimeEl = document.querySelector('.ready-time');
    if (readyTimeEl) {
      const orderDate = new Date(order.created_at);
      const estReady = new Date(orderDate.getTime() + 15 * 60000); // +15 mins
      readyTimeEl.textContent = estReady.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  fetchOrderDetails();
});
