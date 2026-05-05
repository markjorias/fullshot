const components = {
  header: `
    <header id="main-header" class="header-theme-light">
      <div class="logo">
        <a href="index.html">
          <img src="https://www.figma.com/api/mcp/asset/3e22e7dc-8965-40e0-8c73-c07eba2145e9" alt="Half Shot Cafe Logo" class="logo-light">
          <img src="https://www.figma.com/api/mcp/asset/a192e1ca-9755-4046-8a06-bcda4e079988" alt="Half Shot Cafe Logo" class="logo-dark" style="display: none;">
        </a>
      </div>
      <nav>
        <ul>
          <li><a href="about.html">About</a></li>
          <li><a href="#">Promos</a></li>
          <li><a href="#">Reservation</a></li>
        </ul>
      </nav>
      <div class="header-actions">
        <a href="menu.html" class="btn btn-primary">Menu</a>
        <div class="cart-icon">
          <img src="assets/images/icons/cart.svg" alt="Cart">
        </div>
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
            <img src="https://www.figma.com/api/mcp/asset/a192e1ca-9755-4046-8a06-bcda4e079988" alt="Half Shot Cafe Logo White">
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

document.addEventListener('DOMContentLoaded', injectComponents);
