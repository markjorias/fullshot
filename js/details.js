/* details.js - Item Details Dynamic Loading */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');

  if (!itemId) {
    window.location.href = 'menu.html';
    return;
  }

  const detailsContainer = document.querySelector('.details-layout');
  let currentBasePrice = 0;

  async function fetchItemDetails() {
    try {
      const response = await fetch(`/api/menu/${itemId}`);
      if (!response.ok) throw new Error('Item not found');
      const item = await response.json();
      
      currentBasePrice = item.price;
      document.title = `${item.name} | Half Shot Coffee`;
      
      renderDetails(item);
    } catch (error) {
      console.error('Error fetching item details:', error);
      detailsContainer.innerHTML = '<p>Error loading item details. <a href="menu.html">Return to Menu</a></p>';
    }
  }

  function parseOptions(data) {
    if (!data) return [];
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      if (typeof data === 'string' && data.trim()) {
        return data.split(',').map(label => ({ label: label.trim(), price: 0 }));
      }
      return [];
    }
  }

  async function renderDetails(item) {
    const detailsContent = document.querySelector('.details-content');
    const detailsImage = document.querySelector('.details-image img');

    // Set Image
    detailsImage.src = item.image_url || 'https://via.placeholder.com/600x600';
    detailsImage.alt = item.name;

    // Set Info
    detailsContent.querySelector('.section-label').textContent = item.category;
    detailsContent.querySelector('h1').textContent = item.name;
    detailsContent.querySelector('.section-desc').textContent = item.description || 'No description available.';

    // Variations (Override Price)
    const variationSection = detailsContent.querySelector('.variation-section');
    const variationGrid = variationSection.querySelector('.variation-grid');
    const variations = parseOptions(item.variations);
    
    if (variations.length > 0) {
      variationGrid.innerHTML = variations.map((v, i) => 
        `<button class="option-btn ${i === 0 ? 'active' : ''}" data-price="${v.price}">${v.label}${v.price > 0 ? ` (₱${v.price})` : ''}</button>`
      ).join('');
      variationSection.style.display = 'block';
    } else {
      variationSection.style.display = 'none';
    }

    // Sizes (Override Price)
    const sizeSection = detailsContent.querySelector('.size-section');
    const sizeGrid = sizeSection.querySelector('div');
    const sizes = parseOptions(item.sizes);

    if (sizes.length > 0) {
      sizeGrid.innerHTML = sizes.map((s, i) => 
        `<button class="option-btn ${i === 0 ? 'active' : ''}" data-price="${s.price}" style="width: auto; min-width: 136px; padding: 0 20px;">${s.label}${s.price > 0 ? ` (₱${s.price})` : ''}</button>`
      ).join('');
      sizeSection.style.display = 'block';
    } else {
      sizeSection.style.display = 'none';
    }

    // Add-ons (Add to Price)
    const addonsSection = detailsContent.querySelector('.addons-section');
    const addonsGrid = addonsSection.querySelector('div');
    if (item.addons) {
      const addonIds = JSON.parse(item.addons);
      if (addonIds.length > 0) {
        try {
          const menuResponse = await fetch('/api/menu?category=ADD-ONS');
          const allAddons = await menuResponse.json();
          const selectedAddons = allAddons.filter(a => addonIds.includes(a.id));
          
          addonsGrid.innerHTML = selectedAddons.map(a => 
            `<button class="option-btn multi-select" data-price="${a.price}" style="width: auto; padding: 0 20px;">${a.name} (+₱${a.price})</button>`
          ).join('');
          addonsSection.style.display = 'block';
        } catch (err) {
          console.error('Error fetching addons:', err);
          addonsSection.style.display = 'none';
        }
      } else {
        addonsSection.style.display = 'none';
      }
    } else {
      addonsSection.style.display = 'none';
    }

    initInteractions();
    updateTotalPrice();
  }

  function initInteractions() {
    // Option buttons selection logic
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.classList.contains('multi-select')) {
          button.classList.toggle('active');
        } else {
          const parentContainer = button.parentElement;
          parentContainer.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
        }
        updateTotalPrice();
      });
    });

    // Quantity controls logic
    const qtyInput = document.querySelector('.qty-input');
    // Using a simple text-based qty for now based on your HTML
    // You might want to add buttons to your HTML later, but for now we'll support the manual check
    
    // If you add plus/minus buttons in item_details.html, they should call updateTotalPrice()
  }

  function updateTotalPrice() {
    // 1. Start with DB base price
    let activePrice = currentBasePrice;

    // 2. Check Size Override (Priority 1)
    const activeSize = document.querySelector('.size-section .option-btn.active');
    if (activeSize && parseFloat(activeSize.dataset.price) > 0) {
      activePrice = parseFloat(activeSize.dataset.price);
    }

    // 3. Check Variation Override (Priority 2 - More specific)
    const activeVariation = document.querySelector('.variation-section .option-btn.active');
    if (activeVariation && parseFloat(activeVariation.dataset.price) > 0) {
      activePrice = parseFloat(activeVariation.dataset.price);
    }

    // 4. Add Add-ons Surcharges
    let addonsSum = 0;
    const activeAddons = document.querySelectorAll('.addons-section .option-btn.active');
    activeAddons.forEach(btn => {
      addonsSum += parseFloat(btn.dataset.price) || 0;
    });
    
    // 5. Calculate Final with Quantity
    const priceDisplay = document.querySelector('.price-display');
    const qtyInput = document.querySelector('.qty-input');
    const quantity = parseInt(qtyInput.textContent) || 1;
    
    priceDisplay.textContent = `PHP ${((activePrice + addonsSum) * quantity).toFixed(2)}`;
  }

  // Handle quantity button clicks if they exist (based on main.js logic)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('plus') || e.target.classList.contains('minus')) {
      setTimeout(updateTotalPrice, 10); // Small delay to wait for main.js to update text
    }
  });

  fetchItemDetails();
});
