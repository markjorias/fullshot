/* dashboard.js - Admin Dashboard Logic */

document.addEventListener('DOMContentLoaded', () => {
  // --- Access Control ---
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    window.location.href = 'login.html';
    return;
  }
  const user = JSON.parse(userStr);
  if (user.role !== 'admin') {
    showNotification('Access Denied: Admin privileges required.', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
    return;
  }

  // --- Main UI Selectors ---
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');
  const pageTitle = document.getElementById('page-title');
  const addItemBtn = document.getElementById('add-item-btn');
  const menuSearch = document.getElementById('menu-search');
  const menuCategoryFilter = document.getElementById('menu-category-filter');
  const ordersList = document.getElementById('admin-orders-list');
  const addonsSelect = document.getElementById('item-addons');
  const saveFeaturesBtn = document.getElementById('save-features-btn');
  const imageInput = document.getElementById('item-image');
  const imagePreview = document.getElementById('image-preview');
  const uploadZone = document.getElementById('upload-zone');
  const modal = document.getElementById('item-modal');
  const closeModal = document.querySelector('.close-modal');
  const itemForm = document.getElementById('item-form');
  const modalTitle = document.getElementById('modal-title');
  const categorySelect = document.getElementById('item-category');
  const variationsList = document.getElementById('variations-list');
  const sizesList = document.getElementById('sizes-list');
  const addVariationBtn = document.getElementById('add-variation-btn');
  const addSizeBtn = document.getElementById('add-size-btn');

  let allMenuItems = [];
  let currentImageData = '';

  // --- Searchable Dropdown Logic ---
  function initSearchableDropdown(select) {
    if (select.dataset.searchableInit) return;
    select.dataset.searchableInit = "true";

    const wrapper = document.createElement('div');
    wrapper.className = 'searchable-dropdown';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    select.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'searchable-dropdown-input';
    input.placeholder = select.options[0]?.textContent || 'Select...';
    wrapper.appendChild(input);

    const list = document.createElement('div');
    list.className = 'searchable-dropdown-list';
    wrapper.appendChild(list);

    function populateList() {
      list.innerHTML = '';
      Array.from(select.options).forEach((option, index) => {
        if (index === 0 && option.value === "") return; // Skip placeholder
        const item = document.createElement('div');
        item.className = 'searchable-dropdown-item';
        item.textContent = option.textContent;
        item.dataset.value = option.value;
        if (option.selected) {
          item.classList.add('selected');
          input.value = option.textContent;
        }
        item.addEventListener('click', () => {
          select.value = option.value;
          input.value = option.textContent;
          select.dispatchEvent(new Event('change'));
          wrapper.classList.remove('active');
          updateSelected();
        });
        list.appendChild(item);
      });
    }

    function updateSelected() {
      const items = list.querySelectorAll('.searchable-dropdown-item');
      items.forEach(item => {
        if (item.dataset.value === select.value) {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      });
    }

    populateList();

    input.addEventListener('focus', () => {
      wrapper.classList.add('active');
      input.select();
    });

    input.addEventListener('input', () => {
      const filter = input.value.toLowerCase();
      const items = list.querySelectorAll('.searchable-dropdown-item');
      let hasVisible = false;
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(filter)) {
          item.classList.remove('hidden');
          hasVisible = true;
        } else {
          item.classList.add('hidden');
        }
      });
      wrapper.classList.add('active');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('active');
        // Reset input to selected option if nothing matched or empty
        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption) {
          input.value = selectedOption.textContent;
        }
      }
    });

    // Allow external refresh
    select.refreshSearchable = () => {
      populateList();
      const selectedOption = select.options[select.selectedIndex];
      if (selectedOption) {
        input.value = selectedOption.textContent;
      }
    };
  }

  // --- Addons Dropdown Logic ---
  async function populateAddonsDropdown() {
    try {
      const response = await fetch('/api/menu?category=ADD-ONS');
      const addons = await response.json();
      
      addonsSelect.innerHTML = '';
      addons.forEach(addon => {
        const option = document.createElement('option');
        option.value = addon.id;
        option.textContent = `${addon.name} (+PHP ${addon.price.toFixed(2)})`;
        addonsSelect.appendChild(option);
      });
    } catch (err) {
      console.error('Error populating addons:', err);
    }
  }

  // --- Image Handling ---
  if (uploadZone) {
    uploadZone.addEventListener('click', () => imageInput.click());
  }

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        currentImageData = event.target.result;
        imagePreview.innerHTML = `<img src="${currentImageData}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    }
  });

  // --- Navigation Logic ---
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-target');
      
      // Update Sidebar
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Update Sections
      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(target).classList.add('active');

      // Update Header
      pageTitle.textContent = item.querySelector('span').textContent;
      
      // Show/Hide Add Button
      if (target === 'menu-management') {
        addItemBtn.style.display = 'flex';
      } else {
        addItemBtn.style.display = 'none';
      }

      // Populate features if needed
      if (target === 'feature-management') {
        populateFeatureSelectors();
      }

      // Load orders if needed
      if (target === 'order-management') {
        loadAdminOrders();
      }
    });
  });

  // --- Order Management Logic ---
  async function loadAdminOrders() {
    try {
      const response = await fetch('/api/orders');
      const orders = await response.json();
      renderAdminOrders(orders);
    } catch (err) {
      console.error('Error loading orders:', err);
      ordersList.innerHTML = '<p style="padding: 40px; text-align: center; grid-column: 1/-1;">Error loading orders.</p>';
    }
  }

  function renderAdminOrders(orders) {
    ordersList.innerHTML = '';

    if (orders.length === 0) {
      ordersList.innerHTML = '<p style="padding: 40px; text-align: center; grid-column: 1/-1;">No orders found.</p>';
      return;
    }

    orders.forEach(order => {
      const card = document.createElement('div');
      card.className = 'order-admin-card';
      
      const statusClass = order.status.toLowerCase();
      
      card.innerHTML = `
        <div class="order-header">
          <span class="order-id">#${order.id}</span>
          <span class="order-status status-${statusClass}">${order.status}</span>
        </div>
        <div class="order-body">
          <p><strong>Customer:</strong> ${order.customer_name}</p>
          <p><strong>Items:</strong> ${order.items_summary || 'No items'}</p>
          <p class="order-total">Total: PHP ${order.total_price.toFixed(2)}</p>
          <p style="font-size: 12px; color: #888; margin-top: 8px;">${new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div class="order-actions">
          <select class="status-select" data-id="${order.id}">
            <option value="Received" ${order.status === 'Received' ? 'selected' : ''}>Received</option>
            <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
            <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
            <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
          <button class="delete-order-btn" data-id="${order.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            Delete
          </button>
        </div>
      `;
      ordersList.appendChild(card);
    });

    // Add Listeners
    ordersList.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', (e) => updateOrderStatus(select.dataset.id, e.target.value));
    });

    ordersList.querySelectorAll('.delete-order-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteOrder(btn.dataset.id));
    });
  }

  async function updateOrderStatus(id, status) {
    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        loadAdminOrders();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }

  async function deleteOrder(id) {
    if (!confirm(`Are you sure you want to delete order #${id}?`)) return;

    try {
      const response = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (response.ok) {
        loadAdminOrders();
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  }

  // --- Feature Management Logic ---
  async function populateFeatureSelectors() {
    try {
      const [menuResponse, featuredResponse] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/featured')
      ]);
      const menuItems = await menuResponse.json();
      const savedFeatures = await featuredResponse.json();
      
      const selectors = document.querySelectorAll('.feature-select');

      selectors.forEach(select => {
        const section = select.getAttribute('data-section');
        const index = parseInt(select.getAttribute('data-index'));

        select.innerHTML = '<option value="">-- Select Menu Item --</option>';

        menuItems.forEach(item => {
          const option = document.createElement('option');
          option.value = item.id;
          option.textContent = `[${item.category}] ${item.name}`;

          if (savedFeatures[section] && savedFeatures[section][index] == item.id) {
            option.selected = true;
          }

          select.appendChild(option);
        });
      });
    } catch (err) {
      console.error('Error populating features:', err);
    }
  }

  if (saveFeaturesBtn) {
    saveFeaturesBtn.addEventListener('click', async () => {
      const selectors = document.querySelectorAll('.feature-select');
      const featured = {
        bestseller: [],
        snacks: [],
        more_to_try: []
      };

      selectors.forEach(select => {
        const section = select.getAttribute('data-section');
        const index = parseInt(select.getAttribute('data-index'));
        const value = select.value;
        
        if (value) {
          featured[section][index] = parseInt(value);
        } else {
          featured[section][index] = null;
        }
      });
      
      try {
        await fetch('/api/featured', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(featured)
        });
        showNotification('Featured products saved successfully!', 'success');
      } catch (err) {
        console.error('Error saving features:', err);
        showNotification('Failed to save features.', 'error');
      }
    });
  }

  // --- Dynamic Options Logic (Variations & Sizes) ---
  function createOptionRow(type, label = '', price = '') {
    const row = document.createElement('div');
    row.className = 'option-row';
    row.innerHTML = `
      <input type="text" placeholder="${type === 'variation' ? 'e.g. Hot' : 'e.g. 16oz'}" value="${label}" required>
      <input type="number" placeholder="Price" step="0.01" value="${price}" required>
      <button type="button" class="btn-remove-option">&times;</button>
    `;

    row.querySelector('.btn-remove-option').addEventListener('click', () => {
      row.remove();
    });

    return row;
  }

  addVariationBtn.addEventListener('click', () => {
    variationsList.appendChild(createOptionRow('variation'));
  });

  addSizeBtn.addEventListener('click', () => {
    sizesList.appendChild(createOptionRow('size'));
  });

  function getOptionsData(listElement) {
    const rows = listElement.querySelectorAll('.option-row');
    return Array.from(rows).map(row => {
      const inputs = row.querySelectorAll('input');
      return {
        label: inputs[0].value,
        price: parseFloat(inputs[1].value) || 0
      };
    });
  }

  function setOptionsData(listElement, type, data) {
    listElement.innerHTML = '';
    if (!data) return;
    
    try {
      const options = typeof data === 'string' ? JSON.parse(data) : data;
      if (Array.isArray(options)) {
        options.forEach(opt => {
          listElement.appendChild(createOptionRow(type, opt.label, opt.price));
        });
      } else {
        throw new Error('Not an array');
      }
    } catch (e) {
      // Fallback for old comma-separated strings
      if (typeof data === 'string' && data.trim()) {
        data.split(',').forEach(label => {
          listElement.appendChild(createOptionRow(type, label.trim(), ''));
        });
      }
    }
  }

  // --- Modal Logic ---
  if (categorySelect) {
    initSearchableDropdown(categorySelect);
  }

  addItemBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Add Menu Item';
    itemForm.reset();
    populateAddonsDropdown();
    if (categorySelect.refreshSearchable) categorySelect.refreshSearchable();
    document.getElementById('item-id').value = '';
    variationsList.innerHTML = '';
    sizesList.innerHTML = '';
    imagePreview.innerHTML = '';
    currentImageData = '';
    modal.style.display = 'flex';
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // --- Data Management ---
  async function renderMenu() {
    try {
      const response = await fetch('/api/menu');
      allMenuItems = await response.json();
      filterMenu(); // Initial display
    } catch (err) {
      console.error('Error rendering menu:', err);
    }
  }

  function filterMenu() {
    const searchTerm = menuSearch.value.toLowerCase();
    const categoryFilter = menuCategoryFilter.value;

    const filteredItems = allMenuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm);
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    displayMenu(filteredItems);
  }

  function displayMenu(items) {
    const tableBody = document.getElementById('menu-items-table');
    tableBody.innerHTML = '';

    items.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="col-img"><img src="${item.image_url || 'https://via.placeholder.com/50'}" alt="${item.name}"></td>
        <td>${item.name}</td>
        <td class="col-desc">${item.description || ''}</td>
        <td>PHP ${item.price.toFixed(2)}</td>
        <td>${item.category}</td>
        <td class="col-actions">
          <button class="edit-btn" data-id="${item.id}">Edit</button>
          <button class="delete-btn" data-id="${item.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Add event listeners to buttons
    tableBody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editItem(parseInt(btn.dataset.id)));
    });
    tableBody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteItem(parseInt(btn.dataset.id)));
    });
  }

  menuSearch.addEventListener('input', filterMenu);
  menuCategoryFilter.addEventListener('change', filterMenu);

  async function editItem(id) {
    try {
      const response = await fetch('/api/menu');
      const menuItems = await response.json();
      const item = menuItems.find(i => i.id === id);
      
      if (item) {
        await populateAddonsDropdown();
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-desc').value = item.description;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-category').value = item.category;
        
        setOptionsData(variationsList, 'variation', item.variations);
        setOptionsData(sizesList, 'size', item.sizes);
        
        // Select Addons
        if (item.addons) {
          const itemAddons = JSON.parse(item.addons);
          Array.from(addonsSelect.options).forEach(option => {
            option.selected = itemAddons.includes(parseInt(option.value));
          });
        }

        if (categorySelect.refreshSearchable) categorySelect.refreshSearchable();
        
        currentImageData = item.image_url || '';
        if (currentImageData) {
          imagePreview.innerHTML = `<img src="${currentImageData}" alt="Preview">`;
        } else {
          imagePreview.innerHTML = '';
        }
        
        modalTitle.textContent = 'Edit Menu Item';
        modal.style.display = 'flex';
      }
    } catch (err) {
      console.error('Error editing item:', err);
    }
  }

  async function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`/api/menu/${id}`, { method: 'DELETE' });
        renderMenu();
      } catch (err) {
        console.error('Error deleting item:', err);
      }
    }
  }

  itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('item-id').value;
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-desc').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;
    
    const variations = JSON.stringify(getOptionsData(variationsList));
    const sizes = JSON.stringify(getOptionsData(sizesList));
    
    const addons = Array.from(addonsSelect.selectedOptions).map(opt => parseInt(opt.value));
    const image_url = currentImageData;

    const itemData = { name, description, price, category, image_url, variations, sizes, addons };

    try {
      if (id) {
        await fetch(`/api/menu/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
      } else {
        await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
      }

      modal.style.display = 'none';
      renderMenu();
    } catch (err) {
      console.error('Error saving item:', err);
    }
  });

  function showNotification(message, type = 'info') {
    // Basic implementation if no custom toast exists
    alert(`${type.toUpperCase()}: ${message}`);
  }

  // Initial Render
  renderMenu();
});
