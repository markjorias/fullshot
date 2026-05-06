const components = {
  header: `
    <header id="main-header" class="header-theme-light">
      <div class="logo">
        <a href="index.html">
          <img src="assets/images/brand/LOGO-LONG-FULL.png" alt="Half Shot Cafe Logo" class="logo-light">
          <img src="assets/images/brand/LOGO-LONG-WHITE.png" alt="Half Shot Cafe Logo" class="logo-dark" style="display: none;">
        </a>
      </div>
      <nav>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="menu.html">Menu</a></li>
          <li><a href="about.html">About</a></li>
        </ul>
      </nav>
      <div class="header-actions">
        <a href="login.html" class="btn btn-primary">Login</a>
        <a href="cart.html" class="cart-icon">
          <svg width="28" height="31" viewBox="0 0 28 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.33333 1L1 6.77778V27C1 27.7662 1.30436 28.501 1.84614 29.0428C2.38791 29.5845 3.12271 29.8889 3.88889 29.8889H24.1111C24.8773 29.8889 25.6121 29.5845 26.1539 29.0428C26.6956 28.501 27 27.7662 27 27V6.77778L22.6667 1H5.33333Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1 6.77778H27" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.7777 12.5556C19.7777 14.0879 19.169 15.5575 18.0855 16.6411C17.0019 17.7246 15.5323 18.3333 13.9999 18.3333C12.4676 18.3333 10.998 17.7246 9.91444 16.6411C8.8309 15.5575 8.22217 14.0879 8.22217 12.5556" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </header>
  `,
  footer: `
    <footer>
      <div class="footer-content">
        <h2 class="tagline">Take your coffee shot at Halfshot Cafe</h2>
        <a href="menu.html" class="btn btn-primary" style="margin-bottom: 40px; border-radius: 0 104px 73px 0;">Menu</a>
        
        <div class="footer-nav">
          <div class="logo">
            <img src="assets/images/brand/LOGO-LONG-WHITE.png" alt="Half Shot Cafe Logo White">
          </div>
          <ul>
            <li><a href="about.html">About</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Promos</a></li>
          </ul>
          <div class="socials">
            <a href="#" class="social-link"><img src="assets/images/icons/facebook.svg" alt="Facebook"></a>
            <a href="#" class="social-link"><img src="assets/images/icons/x.svg" alt="X"></a>
            <a href="#" class="social-link"><img src="assets/images/icons/instagram.svg" alt="Instagram"></a>
          </div>
        </div>
        
        <p class="copyright">© HalfshotCafe. All Rights Reserved.</p>
      </div>
    </footer>
  `
};

function injectComponents() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  if (headerPlaceholder) {
    headerPlaceholder.innerHTML = components.header;
    
    // Auth dynamic UI
    const userStr = localStorage.getItem('user');
    const authBtn = headerPlaceholder.querySelector('.header-actions .btn-primary');
    
    if (userStr && authBtn) {
      const user = JSON.parse(userStr);
      const navLinks = headerPlaceholder.querySelector('nav ul');
      const cartIcon = headerPlaceholder.querySelector('.cart-icon');
      
      if (navLinks) {
        navLinks.innerHTML = `
          <li><a href="index.html">Home</a></li>
          <li><a href="menu.html">Menu</a></li>
          <li><a href="about.html">About</a></li>
        `;
        
        if (user.role !== 'admin') {
          navLinks.innerHTML += '<li><a href="my_orders.html">Orders</a></li>';
        }
      }

      if (user.role === 'admin' && cartIcon) {
        // Replace cart icon with dashboard icon
        cartIcon.href = 'dashboard.html';
        cartIcon.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        `;
      }

      authBtn.textContent = 'Logout';
      authBtn.href = '#';
      authBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.reload();
      });
    }
  }
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = components.footer;
  }

  // Scroll effect for header
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

window.showNotification = function(message, type = 'info') {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  let icon = '';
  if (type === 'success') {
    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34c759" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (type === 'error') {
    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  } else {
    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }

  notification.innerHTML = `
    <div class="notification-icon">${icon}</div>
    <div class="notification-content">
      <p class="notification-message">${message}</p>
    </div>
  `;

  container.appendChild(notification);

  // Auto remove
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 4000);
};

document.addEventListener('DOMContentLoaded', injectComponents);
