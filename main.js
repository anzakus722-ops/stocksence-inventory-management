/* =============================================
   INVENTORY MANAGEMENT UI - main.js
   VUA-SEN182 | Group 5
   ============================================= */

// ---- Sidebar Toggle (Mobile) ----
function initSidebar() {
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlayBg = document.getElementById('overlayBg');

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
    overlayBg.classList.toggle('visible');
  });

  if (overlayBg) {
    overlayBg.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlayBg.classList.remove('visible');
    });
  }
}

// ---- Modal Helpers ----
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

function initModals() {
  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // Close buttons
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').classList.remove('open');
    });
  });
}

// ---- Product Search & Filter (products.html) ----
function initProductFilter() {
  const searchInput = document.getElementById('productSearch');
  const categoryFilter = document.getElementById('categoryFilter');
  const stockFilter = document.getElementById('stockFilter');
  const cards = document.querySelectorAll('.product-card[data-name]');
  const emptyState = document.getElementById('emptyState');

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const cat   = categoryFilter ? categoryFilter.value : 'all';
    const stock = stockFilter ? stockFilter.value : 'all';
    let visible = 0;

    cards.forEach(card => {
      const name     = card.dataset.name.toLowerCase();
      const category = card.dataset.category;
      const status   = card.dataset.stock;

      const matchSearch = name.includes(query);
      const matchCat    = cat === 'all' || category === cat;
      const matchStock  = stock === 'all' || status === stock;

      if (matchSearch && matchCat && matchStock) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.style.display = visible === 0 ? 'block' : 'none';
    }
  }

  if (searchInput)    searchInput.addEventListener('input', applyFilters);
  if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
  if (stockFilter)    stockFilter.addEventListener('change', applyFilters);
}

// ---- View Product Modal (products.html) ----
function viewProduct(name, category, price, qty, status, sku, emoji) {
  document.getElementById('mp-emoji').textContent    = emoji;
  document.getElementById('mp-name').textContent     = name;
  document.getElementById('mp-category').textContent = category;
  document.getElementById('mp-price').textContent    = '$' + price;
  document.getElementById('mp-qty').textContent      = qty + ' units';
  document.getElementById('mp-sku').textContent      = sku;

  const statusEl = document.getElementById('mp-status');
  statusEl.textContent = status;
  statusEl.className   = 'badge ' +
    (status === 'In Stock' ? 'badge-green' :
     status === 'Low Stock' ? 'badge-yellow' : 'badge-red');

  openModal('productModal');
}

// ---- Delete Confirm Modal ----
function confirmDelete(name) {
  const msg = document.getElementById('deleteProductName');
  if (msg) msg.textContent = '"' + name + '"';
  openModal('deleteModal');
}

// ---- Add Product Form (add-product.html) ----
function initAddProductForm() {
  const form = document.getElementById('addProductForm');
  if (!form) return;

  // Live emoji preview
  const categorySelect = document.getElementById('productCategory');
  const previewEmoji   = document.getElementById('previewEmoji');
  const categoryEmojis = {
    electronics: '💻', clothing: '👗', food: '🍎',
    furniture: '🪑', sports: '⚽', beauty: '💄',
    books: '📚', tools: '🔧', other: '📦'
  };
  if (categorySelect && previewEmoji) {
    categorySelect.addEventListener('change', () => {
      previewEmoji.textContent = categoryEmojis[categorySelect.value] || '📦';
    });
  }

  // Price formatting
  const priceInput = document.getElementById('productPrice');
  if (priceInput) {
    priceInput.addEventListener('blur', () => {
      const val = parseFloat(priceInput.value);
      if (!isNaN(val)) priceInput.value = val.toFixed(2);
    });
  }

  // Stock bar preview
  const qtyInput    = document.getElementById('productQty');
  const maxQtyInput = document.getElementById('productMaxQty');
  const stockFill   = document.getElementById('stockBarFill');
  const stockLabel  = document.getElementById('stockBarLabel');
  function updateStockBar() {
    if (!qtyInput || !maxQtyInput || !stockFill) return;
    const qty    = parseInt(qtyInput.value)    || 0;
    const maxQty = parseInt(maxQtyInput.value) || 100;
    const pct    = Math.min((qty / maxQty) * 100, 100);
    stockFill.style.width = pct + '%';
    stockFill.style.background =
      pct > 50 ? '#22c55e' : pct > 20 ? '#f59e0b' : '#ef4444';
    if (stockLabel) stockLabel.textContent = Math.round(pct) + '% of max stock';
  }
  if (qtyInput)    qtyInput.addEventListener('input', updateStockBar);
  if (maxQtyInput) maxQtyInput.addEventListener('input', updateStockBar);

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateForm(form)) {
      openModal('successModal');
      form.reset();
      if (previewEmoji) previewEmoji.textContent = '📦';
      updateStockBar();
    }
  });
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(input => {
    input.style.borderColor = '';
    if (!input.value.trim()) {
      input.style.borderColor = '#ef4444';
      valid = false;
    }
  });
  return valid;
}

// ---- Dashboard Topbar Search ----
function initTopbarSearch() {
  const input = document.querySelector('.topbar-search-input');
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      window.location.href = 'products.html?q=' + encodeURIComponent(input.value.trim());
    }
  });
}

// ---- Pre-fill search from URL (products.html) ----
function prefillSearch() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const input = document.getElementById('productSearch');
  if (q && input) {
    input.value = q;
    input.dispatchEvent(new Event('input'));
  }
}

// ---- Init on DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initModals();
  initProductFilter();
  initAddProductForm();
  initTopbarSearch();
  prefillSearch();
});
