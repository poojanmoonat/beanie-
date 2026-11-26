'use strict';

/**
 * Knot & Loom — Storefront Configuration & Interactive Logic
 * Edit STORE_CONFIG, COLOR_VARIANTS, and PRODUCTS below to customize copy,
 * prices, image paths, and your WhatsApp order phone number.
 */
const STORE_CONFIG = {
  brandName: 'Knot & Loom',
  whatsappNumber: '919876543210', // Replace with your WhatsApp number (country code + number, no +)
  currencySymbol: '₹',
  freeShippingThreshold: 999,
  shippingFee: 79,
  promoCode: 'KNOT10',
  promoDiscountRate: 0.1,
};

const COLOR_VARIANTS = {
  black: {
    id: 'black',
    name: 'Obsidian Black',
    hex: '#191B1E',
    image: 'images/beanie-black.jpg',
  },
  charcoal: {
    id: 'charcoal',
    name: 'Heather Charcoal',
    hex: '#575B62',
    image: 'images/beanie-charcoal.jpg',
  },
  beige: {
    id: 'beige',
    name: 'Oatmeal Stone',
    hex: '#D4C5AE',
    image: 'images/beanie-beige.jpg',
  },
  maroon: {
    id: 'maroon',
    name: 'Oxblood Maroon',
    hex: '#5C1B26',
    image: 'images/beanie-maroon.jpg',
  },
};

const PRODUCTS = [
  {
    id: 'classic-ribbed-cuff',
    name: 'Everyday Ribbed Cuff',
    price: 899,
    material: '60% Merino Wool · 40% Soft Acrylic',
    defaultColor: 'black',
  },
  {
    id: 'city-watch-cap',
    name: 'City Watch Cap',
    price: 949,
    material: '60% Merino Wool · 40% Soft Acrylic',
    defaultColor: 'charcoal',
  },
  {
    id: 'alpine-merino-fold',
    name: 'Alpine Merino Fold',
    price: 999,
    material: '60% Merino Wool · 40% Soft Acrylic',
    defaultColor: 'beige',
  },
  {
    id: 'winter-heritage-rib',
    name: 'Winter Heritage Rib',
    price: 999,
    material: '60% Merino Wool · 40% Soft Acrylic',
    defaultColor: 'maroon',
  },
];

const STORAGE_KEY = 'knot_loom_cart_v1';

/** @type {Record<string, string>} */
const selectedColors = {};
PRODUCTS.forEach((product) => {
  selectedColors[product.id] = product.defaultColor;
});

/** @type {{ items: Array<{ productId: string, colorId: string, qty: number }>, promoApplied: boolean }} */
let cartState = loadCartState();

function loadCartState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { items: [], promoApplied: false };
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.items)) {
      return {
        items: parsed.items.filter(
          (item) =>
            item &&
            typeof item.productId === 'string' &&
            typeof item.colorId === 'string' &&
            typeof item.qty === 'number' &&
            item.qty > 0
        ),
        promoApplied: Boolean(parsed.promoApplied),
      };
    }
  } catch (_err) {
    // Ignore storage access errors in private browsing
  }
  return { items: [], promoApplied: false };
}

function saveCartState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState));
  } catch (_err) {
    // Ignore storage write errors
  }
}

function formatPrice(amount) {
  return `${STORE_CONFIG.currencySymbol}${Math.round(amount).toLocaleString('en-IN')}`;
}

function getFallbackSvgMarkup(label) {
  return `
    <div class="img-fallback" aria-hidden="true">
      <svg class="beanie-fallback-svg" viewBox="0 0 120 100" fill="none">
        <path d="M24 62C24 37 40 20 60 20C80 20 96 37 96 62H24Z" stroke="currentColor" stroke-width="2.5"/>
        <rect x="20" y="60" width="80" height="20" rx="5" stroke="currentColor" stroke-width="2.5"/>
        <circle cx="60" cy="17" r="4" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>${label}</span>
    </div>
  `;
}

/* ==========================================================================
   1. Product Grid & Swatch Switching
   ========================================================================== */
function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const colorList = Object.values(COLOR_VARIANTS);

  grid.innerHTML = PRODUCTS.map((product) => {
    const activeColorId = selectedColors[product.id] || product.defaultColor;
    const activeColor = COLOR_VARIANTS[activeColorId] || colorList[0];

    const swatchesHtml = colorList
      .map((color) => {
        const isSelected = color.id === activeColor.id;
        return `
          <button
            type="button"
            class="swatch-btn"
            data-product-id="${product.id}"
            data-color-id="${color.id}"
            aria-label="Select ${color.name} for ${product.name}"
            aria-pressed="${isSelected ? 'true' : 'false'}"
            title="${color.name}"
          >
            <span class="swatch-dot" style="background-color: ${color.hex};"></span>
          </button>
        `;
      })
      .join('');

    return `
      <article class="product-card" data-product-card="${product.id}">
        <div class="img-frame product-img-frame">
          <img
            src="${activeColor.image}"
            alt="${product.name} beanie in ${activeColor.name}"
            referrerpolicy="no-referrer"
            loading="lazy"
            decoding="async"
            data-product-img="${product.id}"
            onerror="this.closest('.img-frame').classList.add('is-fallback')"
          />
          ${getFallbackSvgMarkup(product.name)}
        </div>

        <div class="product-meta-top">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price tabular-nums">${formatPrice(product.price)}</p>
        </div>
        <p class="product-material">${product.material}</p>

        <div class="swatch-row">
          <span class="swatch-label" data-color-label="${product.id}">${activeColor.name}</span>
          <div class="swatch-group" role="group" aria-label="Color options for ${product.name}">
            ${swatchesHtml}
          </div>
        </div>

        <button
          type="button"
          class="btn btn-primary btn-full add-to-cart-btn"
          data-add-product="${product.id}"
        >
          Add to Cart
        </button>
      </article>
    `;
  }).join('');

  grid.addEventListener('click', handleProductGridClick);
}

function handleProductGridClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const swatchBtn = target.closest('.swatch-btn');
  if (swatchBtn instanceof HTMLButtonElement) {
    const productId = swatchBtn.dataset.productId;
    const colorId = swatchBtn.dataset.colorId;
    if (productId && colorId) {
      updateProductSwatch(productId, colorId);
    }
    return;
  }

  const addBtn = target.closest('.add-to-cart-btn');
  if (addBtn instanceof HTMLButtonElement) {
    const productId = addBtn.dataset.addProduct;
    if (productId) {
      const colorId = selectedColors[productId] || 'black';
      addToCart(productId, colorId);
    }
  }
}

function updateProductSwatch(productId, colorId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  const color = COLOR_VARIANTS[colorId];
  if (!product || !color) return;

  selectedColors[productId] = colorId;

  const card = document.querySelector(`[data-product-card="${productId}"]`);
  if (!card) return;

  const imgEl = card.querySelector(`[data-product-img="${productId}"]`);
  if (imgEl instanceof HTMLImageElement) {
    const frame = imgEl.closest('.img-frame');
    if (frame) frame.classList.remove('is-fallback');
    imgEl.src = color.image;
    imgEl.alt = `${product.name} beanie in ${color.name}`;
  }

  const labelEl = card.querySelector(`[data-color-label="${productId}"]`);
  if (labelEl) {
    labelEl.textContent = color.name;
  }

  card.querySelectorAll('.swatch-btn').forEach((btn) => {
    if (btn instanceof HTMLButtonElement) {
      btn.setAttribute('aria-pressed', btn.dataset.colorId === colorId ? 'true' : 'false');
    }
  });
}

/* ==========================================================================
   2. Cart Logic & WhatsApp Checkout
   ========================================================================== */
function addToCart(productId, colorId) {
  const existing = cartState.items.find(
    (item) => item.productId === productId && item.colorId === colorId
  );
  if (existing) {
    existing.qty += 1;
  } else {
    cartState.items.push({ productId, colorId, qty: 1 });
  }
  saveCartState();
  renderCart();

  const product = PRODUCTS.find((p) => p.id === productId);
  const color = COLOR_VARIANTS[colorId];
  showToast(`Added ${product ? product.name : 'Beanie'} (${color ? color.name : colorId})`);
  openCartDrawer();
}

function changeItemQty(productId, colorId, delta) {
  const idx = cartState.items.findIndex(
    (item) => item.productId === productId && item.colorId === colorId
  );
  if (idx === -1) return;

  cartState.items[idx].qty += delta;
  if (cartState.items[idx].qty <= 0) {
    cartState.items.splice(idx, 1);
  }
  saveCartState();
  renderCart();
}

function removeCartItem(productId, colorId) {
  cartState.items = cartState.items.filter(
    (item) => !(item.productId === productId && item.colorId === colorId)
  );
  saveCartState();
  renderCart();
}

function calculateTotals() {
  let itemCount = 0;
  let subtotal = 0;

  cartState.items.forEach((item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    if (!product) return;
    itemCount += item.qty;
    subtotal += product.price * item.qty;
  });

  const discount = cartState.promoApplied
    ? Math.round(subtotal * STORE_CONFIG.promoDiscountRate)
    : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping =
    itemCount === 0 || discountedSubtotal >= STORE_CONFIG.freeShippingThreshold
      ? 0
      : STORE_CONFIG.shippingFee;
  const total = discountedSubtotal + shipping;

  return { itemCount, subtotal, discount, shipping, total };
}

function buildWhatsAppUrl(totals) {
  if (cartState.items.length === 0) {
    return `https://wa.me/${STORE_CONFIG.whatsappNumber}`;
  }

  const lines = [`Hi ${STORE_CONFIG.brandName}! I would like to place an order:`];
  lines.push('');

  cartState.items.forEach((item, index) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    const color = COLOR_VARIANTS[item.colorId];
    if (!product) return;
    const lineTotal = product.price * item.qty;
    lines.push(
      `${index + 1}. ${product.name} — ${color ? color.name : item.colorId} × ${item.qty} (${formatPrice(lineTotal)})`
    );
  });

  lines.push('');
  lines.push(`Subtotal: ${formatPrice(totals.subtotal)}`);
  if (totals.discount > 0) {
    lines.push(`Promo (${STORE_CONFIG.promoCode}): -${formatPrice(totals.discount)}`);
  }
  lines.push(`Shipping: ${totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}`);
  lines.push(`Total: ${formatPrice(totals.total)}`);
  lines.push('');
  lines.push('Please share payment & delivery confirmation.');

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encoded}`;
}

function renderCart() {
  const totals = calculateTotals();

  const headerCount = document.getElementById('header-cart-count');
  const drawerCount = document.getElementById('drawer-cart-count');
  if (headerCount) {
    headerCount.textContent = String(totals.itemCount);
    headerCount.classList.toggle('has-items', totals.itemCount > 0);
  }
  if (drawerCount) {
    drawerCount.textContent = String(totals.itemCount);
  }

  const itemsContainer = document.getElementById('cart-items-container');
  const cartFooter = document.getElementById('cart-footer');
  if (!itemsContainer || !cartFooter) return;

  if (cartState.items.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty">
        <p>Your bag is currently empty.</p>
        <a href="#collection" class="btn btn-secondary btn-sm" id="empty-shop-link">Browse Beanies</a>
      </div>
    `;
    const emptyShopLink = document.getElementById('empty-shop-link');
    if (emptyShopLink) {
      emptyShopLink.addEventListener('click', closeCartDrawer);
    }
    cartFooter.hidden = true;
    return;
  }

  cartFooter.hidden = false;

  itemsContainer.innerHTML = cartState.items
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      const color = COLOR_VARIANTS[item.colorId];
      if (!product || !color) return '';

      return `
        <div class="cart-item">
          <div class="img-frame cart-item-thumb">
            <img
              src="${color.image}"
              alt="${product.name} in ${color.name}"
              referrerpolicy="no-referrer"
              onerror="this.closest('.img-frame').classList.add('is-fallback')"
            />
            ${getFallbackSvgMarkup(color.name)}
          </div>
          <div>
            <h3 class="cart-item-title">${product.name}</h3>
            <p class="cart-item-variant">${color.name}</p>
            <div class="cart-item-controls">
              <div class="qty-stepper" aria-label="Quantity for ${product.name} ${color.name}">
                <button
                  type="button"
                  class="qty-btn"
                  data-qty-action="dec"
                  data-product-id="${item.productId}"
                  data-color-id="${item.colorId}"
                  aria-label="Decrease quantity"
                >−</button>
                <span class="qty-value tabular-nums">${item.qty}</span>
                <button
                  type="button"
                  class="qty-btn"
                  data-qty-action="inc"
                  data-product-id="${item.productId}"
                  data-color-id="${item.colorId}"
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <div class="cart-item-right">
                <span class="cart-item-price tabular-nums">${formatPrice(product.price * item.qty)}</span>
                <button
                  type="button"
                  class="remove-item-btn"
                  data-remove-item="true"
                  data-product-id="${item.productId}"
                  data-color-id="${item.colorId}"
                >Remove</button>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  const subtotalEl = document.getElementById('cart-subtotal');
  const discountLine = document.getElementById('discount-line');
  const discountEl = document.getElementById('cart-discount');
  const shippingEl = document.getElementById('cart-shipping');
  const totalEl = document.getElementById('cart-total');
  const promoBtn = document.getElementById('apply-knot10-btn');
  const whatsappBtn = document.getElementById('whatsapp-checkout-btn');

  if (subtotalEl) subtotalEl.textContent = formatPrice(totals.subtotal);
  if (discountLine && discountEl) {
    discountLine.hidden = totals.discount <= 0;
    discountEl.textContent = `−${formatPrice(totals.discount)}`;
  }
  if (shippingEl) {
    shippingEl.textContent = totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping);
  }
  if (totalEl) totalEl.textContent = formatPrice(totals.total);

  if (promoBtn) {
    promoBtn.classList.toggle('is-active', cartState.promoApplied);
    promoBtn.textContent = cartState.promoApplied
      ? `${STORE_CONFIG.promoCode} applied (10% off) · Click to remove`
      : `Apply welcome code ${STORE_CONFIG.promoCode} (10% off)`;
  }

  if (whatsappBtn instanceof HTMLAnchorElement) {
    whatsappBtn.href = buildWhatsAppUrl(totals);
  }
}

function setupCartDrawer() {
  const openBtn = document.getElementById('open-cart-btn');
  const closeBtn = document.getElementById('close-cart-btn');
  const backdrop = document.getElementById('cart-backdrop');
  const itemsContainer = document.getElementById('cart-items-container');
  const promoBtn = document.getElementById('apply-knot10-btn');

  if (openBtn) openBtn.addEventListener('click', openCartDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (backdrop) backdrop.addEventListener('click', closeCartDrawer);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCartDrawer();
    }
  });

  if (itemsContainer) {
    itemsContainer.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const qtyBtn = target.closest('.qty-btn');
      if (qtyBtn instanceof HTMLButtonElement) {
        const productId = qtyBtn.dataset.productId;
        const colorId = qtyBtn.dataset.colorId;
        const action = qtyBtn.dataset.qtyAction;
        if (productId && colorId && action) {
          changeItemQty(productId, colorId, action === 'inc' ? 1 : -1);
        }
        return;
      }

      const removeBtn = target.closest('[data-remove-item]');
      if (removeBtn instanceof HTMLButtonElement) {
        const productId = removeBtn.dataset.productId;
        const colorId = removeBtn.dataset.colorId;
        if (productId && colorId) {
          removeCartItem(productId, colorId);
        }
      }
    });
  }

  if (promoBtn) {
    promoBtn.addEventListener('click', () => {
      cartState.promoApplied = !cartState.promoApplied;
      saveCartState();
      renderCart();
    });
  }
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  const closeBtn = document.getElementById('close-cart-btn');
  if (drawer && backdrop) {
    drawer.hidden = false;
    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop && !drawer.hidden) {
    drawer.hidden = true;
    backdrop.hidden = true;
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   3. FAQ Accordion
   ========================================================================== */
function setupFaqAccordion() {
  const faqList = document.getElementById('faq-list');
  if (!faqList) return;

  faqList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const trigger = target.closest('.faq-trigger');
    if (!(trigger instanceof HTMLButtonElement)) return;

    const panelId = trigger.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;

    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    faqList.querySelectorAll('.faq-trigger').forEach((btn) => {
      const id = btn.getAttribute('aria-controls');
      const p = id ? document.getElementById(id) : null;
      btn.setAttribute('aria-expanded', 'false');
      if (p) p.hidden = true;
    });

    if (!isExpanded) {
      trigger.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    }
  });
}

/* ==========================================================================
   4. Email Signup Form Validation
   ========================================================================== */
function setupSignupForm() {
  const form = document.getElementById('signup-form');
  const emailInput = document.getElementById('signup-email');
  const feedback = document.getElementById('signup-feedback');
  if (!(form instanceof HTMLFormElement) || !(emailInput instanceof HTMLInputElement) || !feedback) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    feedback.classList.remove('is-error', 'is-success');

    if (!email) {
      feedback.textContent = 'Please enter your email address.';
      feedback.classList.add('is-error');
      emailInput.focus();
      return;
    }

    if (!emailPattern.test(email)) {
      feedback.textContent = 'Please enter a valid email address (e.g. name@domain.com).';
      feedback.classList.add('is-error');
      emailInput.focus();
      return;
    }

    cartState.promoApplied = true;
    saveCartState();
    renderCart();

    feedback.textContent = `Welcome! Use code ${STORE_CONFIG.promoCode} for 10% off — automatically applied to your bag.`;
    feedback.classList.add('is-success');
    emailInput.value = '';
    showToast(`10% discount (${STORE_CONFIG.promoCode}) activated`);
  });
}

/* ==========================================================================
   5. Toast & Subtle Scroll Reveal
   ========================================================================== */
let toastTimeoutId = 0;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;

  if (toastTimeoutId) {
    window.clearTimeout(toastTimeoutId);
  }
  toastTimeoutId = window.setTimeout(() => {
    toast.hidden = true;
  }, 2600);
}

function setupScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('js-reveal-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );

  items.forEach((item) => observer.observe(item));
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCart();
  setupCartDrawer();
  setupFaqAccordion();
  setupSignupForm();
  setupScrollReveal();
});
