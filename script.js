const bar = document.getElementById('bar');
const closeBtn = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
  bar.addEventListener('click', () => {
    nav.classList.add('active');
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    nav.classList.remove('active');
  });
}

// Select all dropdowns in mobile navbar
const dropdowns = document.querySelectorAll("#navbar .dropdown");

dropdowns.forEach(dropdown => {
  const a = dropdown.querySelector("a");
  if (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      dropdown.classList.toggle("active");
    });
  }
});

// Simple cart stored in localStorage
const CART_KEY = 'fftraders_cart';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + (i.qty || 0), 0);
  const el = document.querySelector('.cart-count');
  if (el) el.textContent = count;
}

function addToCart(item) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === item.id);
  if (idx > -1) {
    cart[idx].qty += item.qty;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  updateCartCount();
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartCount();
}

function setQty(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, Math.floor(qty) || 1);
  saveCart(cart);
  updateCartCount();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

function renderCartPage() {
  const cartItemsEl = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  if (!cartItemsEl || !subtotalEl || !totalEl) return;

  const cart = getCart();
  if (cart.length === 0) {
    const emptyCart = document.getElementById('empty-cart');
    const cartSection = document.getElementById('cart');
    const cartTotals = document.getElementById('cart-totals');
    if (emptyCart) emptyCart.style.display = '';
    if (cartSection) cartSection.style.display = 'none';
    if (cartTotals) cartTotals.style.display = 'none';
    return;
  } else {
    const emptyCart = document.getElementById('empty-cart');
    const cartSection = document.getElementById('cart');
    const cartTotals = document.getElementById('cart-totals');
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartSection) cartSection.style.display = '';
    if (cartTotals) cartTotals.style.display = '';
  }

  cartItemsEl.innerHTML = '';
  let subtotal = 0;
  cart.forEach(item => {
    const price = parseFloat(item.price) || 0;
    const qty = item.qty || 1;
    const lineTotal = price * qty;
    subtotal += lineTotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding: 15px;">
        <button class="remove-btn" data-id="${item.id}" style="background:#ff3b30;color:#fff;border:none;padding:6px 10px;border-radius:4px;cursor:pointer">✕</button>
      </td>
      <td style="padding: 15px; display:flex; gap:12px; align-items:center;">
        ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.name)}" style="width:80px;height:80px;object-fit:cover;border-radius:6px;">` : ''}
        <div>${escapeHtml(item.name)}</div>
      </td>
      <td style="padding: 15px; color:#0A98E0; font-weight:600;">$${price.toFixed(2)}</td>
      <td style="padding:15px;">
        <input class="qty-input" data-id="${item.id}" type="number" value="${qty}" min="1" style="width:60px;padding:6px;border:1px solid #ccc;border-radius:4px;">
      </td>
      <td style="padding: 15px; color:#0A98E0; font-weight:600;">$${lineTotal.toFixed(2)}</td>
    `;
    cartItemsEl.appendChild(tr);
  });

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  const shipping = 10.00;
  totalEl.textContent = `$${(subtotal + shipping).toFixed(2)}`;

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = btn.dataset.id;
      removeFromCart(id);
      renderCartPage();
    });
  });

  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', e => {
      const id = input.dataset.id;
      const val = parseInt(input.value, 10);
      setQty(id, val);
      renderCartPage();
    });
  });
}

/* Toast Helper */
function ensureToastElement() {
  let t = document.getElementById('add-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'add-toast';
    t.className = 'toast';
    t.innerHTML = '<span class="icon">✓</span><span class="msg"></span><button class="close" aria-label="Close">✕</button>';
    document.body.appendChild(t);
    t.querySelector('.close').addEventListener('click', () => {
      t.classList.remove('show');
      clearTimeout(t._hideTimeout);
    });
  }
  return t;
}

function showToast(message, type = 'success', duration = 2000) {
  const t = ensureToastElement();
  t.className = 'toast ' + type;
  t.querySelector('.msg').textContent = message;
  void t.offsetWidth;
  t.classList.add('show');
  clearTimeout(t._hideTimeout);
  t._hideTimeout = setTimeout(() => {
    t.classList.remove('show');
  }, duration);
}

/* Custom Alert Modal */
function showCustomAlert(title, message, icon = '✓', callback = null) {
  const modal = document.getElementById('custom-alert-modal');
  const titleEl = document.getElementById('alert-title');
  const messageEl = document.getElementById('alert-message');
  const iconEl = document.getElementById('alert-icon');
  const closeBtn = document.getElementById('alert-close-btn');

  if (!modal || !titleEl || !messageEl || !iconEl || !closeBtn) {
    console.error('Alert modal elements not found');
    return;
  }

  titleEl.textContent = title;
  messageEl.textContent = message;
  iconEl.textContent = icon;

  modal.classList.add('show');

  const closeHandler = () => {
    modal.classList.remove('show');
    closeBtn.removeEventListener('click', closeHandler);
    if (callback) callback();
  };

  closeBtn.addEventListener('click', closeHandler);
}

/* SINGLE Add-to-Cart Handler (ONLY ONE) */
let addToCartProcessing = false;

document.addEventListener('click', function (e) {
  if (addToCartProcessing) return;

  const btn = e.target.closest('.add-to-cart');
  if (!btn) return;

  addToCartProcessing = true;
  e.preventDefault();
  e.stopPropagation();

  const id = btn.dataset.id;
  const name = btn.dataset.name || 'Product';
  const price = parseFloat(btn.dataset.price) || 0;
  const image = btn.dataset.image || '';
  const qty = 1;

  addToCart({ id, name, price, image, qty });

  const original = btn.innerHTML;
  btn.innerHTML = '<i class="fal fa-check"></i> Added';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = original;
    btn.disabled = false;
    addToCartProcessing = false;
    showToast(`${name} added to cart`, 'success', 2200);
  }, 900);
}, true);

/* Initialize on page load */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  if (document.getElementById('cart-items')) renderCartPage();
});

/* Checkout Modal Logic */
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutBtn = document.getElementById('close-checkout');
const placeOrderBtn = document.getElementById('place-order-btn');

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    const cart = getCart();
    if (cart.length === 0) {
      showCustomAlert('Empty Cart', 'Your cart is empty! Please add items before checkout.', '🛒');
      return;
    }
    if (checkoutModal) checkoutModal.style.display = 'block';
    const subtotal = cart.reduce((s, i) => s + (parseFloat(i.price) * (i.qty || 1)), 0);
    const totalEl = document.getElementById('checkout-total');
    if (totalEl) totalEl.textContent = `$${(subtotal + 10).toFixed(2)}`;
  });
}

if (closeCheckoutBtn) {
  closeCheckoutBtn.addEventListener('click', () => {
    if (checkoutModal) checkoutModal.style.display = 'none';
  });
}

if (checkoutModal) {
  checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
      checkoutModal.style.display = 'none';
    }
  });
}

if (placeOrderBtn) {
  placeOrderBtn.addEventListener('click', () => {
    const fullNameEl = document.getElementById('full-name');
    const phoneEl = document.getElementById('phone');
    const addressEl = document.getElementById('address');
    const cityEl = document.getElementById('city');

    if (!fullNameEl || !phoneEl || !addressEl || !cityEl) return;

    const fullName = fullNameEl.value.trim();
    const phone = phoneEl.value.trim();
    const address = addressEl.value.trim();
    const city = cityEl.value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    const agreedEl = document.getElementById('agree-terms');
    const agreed = agreedEl ? agreedEl.checked : false;

    if (!fullName || !phone || !address || !city) {
      showCustomAlert('Missing Fields', 'Please fill in all required fields', '⚠️');
      return;
    }
    if (!paymentMethod) {
      showCustomAlert('Payment Method', 'Please select a payment method', '💳');
      return;
    }
    if (!agreed) {
      showCustomAlert('Terms & Conditions', 'Please agree to the terms & conditions', '📋');
      return;
    }

    const order = {
      fullName,
      phone,
      address,
      city,
      paymentMethod: paymentMethod.value,
      items: getCart(),
      total: (getCart().reduce((s, i) => s + (parseFloat(i.price) * (i.qty || 1)), 0) + 10).toFixed(2),
      timestamp: new Date().toISOString()
    };

    console.log('Order placed:', order);

    showCustomAlert(
      '✓ Order Placed Successfully!',
      `Payment Method: ${paymentMethod.value.toUpperCase()}\n\nWe'll contact you at: ${phone}`,
      '✓',
      () => {
        localStorage.removeItem(CART_KEY);
        updateCartCount();
        if (checkoutModal) checkoutModal.style.display = 'none';
        location.reload();
      }
    );
  });
}

// contact form 
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message) {
      showCustomAlert('Missing Information', 'Please fill in all required fields', '⚠️');
      return;
    }

    console.log({
      name,
      email,
      phone: contactForm.phone ? contactForm.phone.value.trim() : '',
      subject: contactForm.subject ? contactForm.subject.value : '',
      message,
      timestamp: new Date().toISOString()
    });

    if (formSuccess) formSuccess.style.display = 'block';
    contactForm.reset();

    setTimeout(() => {
      if (formSuccess) formSuccess.style.display = 'none';
    }, 5000);

    if (formSuccess) formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}