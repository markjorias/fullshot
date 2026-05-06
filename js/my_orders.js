/* my_orders.js - Fetch and render user orders */

document.addEventListener('DOMContentLoaded', () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(userStr);
  const ordersListContainer = document.getElementById('orders-list');

  async function fetchUserOrders() {
    try {
      const response = await fetch(`/api/orders/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const orders = await response.json();
      renderOrders(orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      ordersListContainer.innerHTML = '<p style="text-align: center; color: red;">Error loading orders. Please try again later.</p>';
    }
  }

  function renderOrders(orders) {
    ordersListContainer.innerHTML = '';

    if (orders.length === 0) {
      ordersListContainer.innerHTML = `
        <div class="no-orders">
          <p>You haven't placed any orders yet.</p>
          <a href="menu.html" class="btn btn-primary">Go to Menu</a>
        </div>
      `;
      return;
    }

    orders.forEach(order => {
      const statusClass = order.status.toLowerCase();
      const orderDate = new Date(order.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const orderCard = document.createElement('a');
      orderCard.href = `order_status.html?id=${order.id}`;
      orderCard.className = 'order-card';
      orderCard.innerHTML = `
        <div class="order-info">
          <p style="color: var(--primary-color); font-weight: 700; margin-bottom: 4px;">#${order.id}</p>
          <h3>Order from ${orderDate}</h3>
          <p>Click to view tracking and details</p>
        </div>
        <div class="order-meta">
          <span class="order-status status-${statusClass}">${order.status}</span>
          <div class="order-total">PHP ${order.total_price.toFixed(2)}</div>
        </div>
      `;
      ordersListContainer.appendChild(orderCard);
    });
  }

  fetchUserOrders();
});
