const state = {
  menu: [],
  cart: {},
  category: "All",
  search: "",
  vegOnly: false,
  sort: "recommended",
  coupon: ""
};

const $ = (selector) => document.querySelector(selector);
const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(amount);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

async function loadMenu() {
  const grid = $("#menu-grid");
  try {
    const response = await fetch("/api/menu");
    if (!response.ok) throw new Error("Could not load the menu.");
    const data = await response.json();
    state.menu = data.items;
    $("#menu-item-count").textContent = state.menu.length;
    renderMenu();
  } catch (error) {
    grid.innerHTML = `<div class="load-error"><strong>Oops, the menu did not load.</strong><p>${escapeHtml(error.message)} Make sure the Node.js server is running.</p><button class="button button-outline" id="retry-menu" type="button">Try again</button></div>`;
    $("#retry-menu")?.addEventListener("click", loadMenu);
  }
}

function getVisibleMenu() {
  let items = [...state.menu];
  if (state.category !== "All") items = items.filter((item) => item.category === state.category);
  if (state.vegOnly) items = items.filter((item) => item.isVeg);
  if (state.search.trim()) {
    const query = state.search.trim().toLowerCase();
    items = items.filter((item) => `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query));
  }
  if (state.sort === "price-low") items.sort((a, b) => a.price - b.price);
  if (state.sort === "price-high") items.sort((a, b) => b.price - a.price);
  if (state.sort === "rating") items.sort((a, b) => b.rating - a.rating);
  if (state.sort === "recommended") items.sort((a, b) => Number(b.isPopular) - Number(a.isPopular));
  return items;
}

function renderMenu() {
  const grid = $("#menu-grid");
  const items = getVisibleMenu();
  $("#menu-item-count").textContent = items.length;
  $("#empty-state").classList.toggle("hidden", items.length !== 0);
  grid.classList.toggle("hidden", items.length === 0);

  grid.innerHTML = items.map((item, index) => `
    <article class="food-card" style="--card-index:${index % 8}">
      <div class="food-image-wrap">
        <img class="food-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" referrerpolicy="no-referrer">
        <span class="food-badge ${item.isPopular ? "popular-badge" : ""}">${item.isPopular ? "★ FAN FAVOURITE" : escapeHtml(item.category.toUpperCase())}</span>
        <span class="diet-indicator ${item.isVeg ? "veg-indicator" : "nonveg-indicator"}" title="${item.isVeg ? "Vegetarian" : "Non-vegetarian"}"><span></span></span>
      </div>
      <div class="food-card-body">
        <div class="food-card-topline"><span class="food-category">${escapeHtml(item.category)}</span><span class="food-rating">★ ${Number(item.rating).toFixed(1)}</span></div>
        <h3>${escapeHtml(item.name)}</h3>
        <p class="food-description">${escapeHtml(item.description)}</p>
        <div class="food-card-bottom"><div><strong class="food-price">${money(item.price)}</strong><small>⏱ ${escapeHtml(item.prepTime)}</small></div><button class="add-button" data-add="${escapeHtml(item.id)}" type="button" aria-label="Add ${escapeHtml(item.name)} to cart"><span>+</span> Add</button></div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".food-image").forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("image-load-failed");
      image.alt = "Food image unavailable — check your internet connection";
    }, { once: true });
  });
}

function cartEntries() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => {
      const product = state.menu.find((item) => item.id === id);
      return product ? { ...product, quantity, lineTotal: product.price * quantity } : null;
    })
    .filter(Boolean);
}

function calculatePreview() {
  const items = cartEntries();
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const couponValid = state.coupon === "FOODIE10" && subtotal >= 199;
  const discount = couponValid ? Math.round(subtotal * 0.10) : 0;
  const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 29;
  const tax = Math.round((subtotal - discount) * 0.05);
  return { subtotal, discount, deliveryFee, tax, total: subtotal - discount + deliveryFee + tax };
}

function updateCartCount() {
  const count = Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0);
  $("#header-cart-count").textContent = count;
  $("#drawer-item-count").textContent = `(${count})`;
  $("#header-cart-count").classList.toggle("has-items", count > 0);
}

function renderCart() {
  const entries = cartEntries();
  const content = $("#cart-content");
  const summary = $("#cart-summary");
  updateCartCount();

  if (entries.length === 0) {
    content.innerHTML = `<div class="cart-empty"><span>🛍️</span><h3>Your cart is taking a nap.</h3><p>Add something delicious to wake it up.</p><button class="button button-primary" id="start-ordering" type="button">Explore menu</button></div>`;
    summary.classList.add("hidden");
    $("#coupon-message").textContent = "";
    return;
  }

  content.innerHTML = entries.map((item) => `
    <div class="cart-item" data-cart-item="${escapeHtml(item.id)}">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
      <div class="cart-item-info"><strong>${escapeHtml(item.name)}</strong><small>${money(item.price)} each</small><div class="quantity-control"><button type="button" data-quantity="minus" data-id="${escapeHtml(item.id)}" aria-label="Decrease ${escapeHtml(item.name)} quantity">−</button><span>${item.quantity}</span><button type="button" data-quantity="plus" data-id="${escapeHtml(item.id)}" aria-label="Increase ${escapeHtml(item.name)} quantity">+</button></div></div>
      <div class="cart-item-end"><strong>${money(item.lineTotal)}</strong><button class="remove-item" data-remove="${escapeHtml(item.id)}" type="button" aria-label="Remove ${escapeHtml(item.name)}">Remove</button></div>
    </div>
  `).join("");
  summary.classList.remove("hidden");
  renderBill();
}

function renderBill() {
  const bill = calculatePreview();
  const rows = [
    ["Item total", money(bill.subtotal)],
    ["Discount", bill.discount ? `− ${money(bill.discount)}` : money(0), bill.discount ? "discount-row" : ""],
    ["Delivery fee", bill.deliveryFee ? money(bill.deliveryFee) : "FREE", bill.deliveryFee ? "" : "free-row"],
    ["Taxes & charges (5%)", money(bill.tax)]
  ];
  $("#bill-lines").innerHTML = rows.map(([label, value, className = ""]) => `<div class="bill-line ${className}"><span>${label}</span><strong>${value}</strong></div>`).join("") + `<div class="bill-line bill-total"><span>To pay</span><strong>${money(bill.total)}</strong></div>`;
  $("#checkout-total").textContent = money(bill.total);
  const couponMessage = $("#coupon-message");
  if (state.coupon === "FOODIE10" && couponMessage) {
    couponMessage.textContent = bill.discount > 0
      ? "Lovely! 10% discount applied."
      : "Add items worth ₹199 to unlock your 10% discount.";
    couponMessage.className = bill.discount > 0
      ? "coupon-message success-message"
      : "coupon-message error-message";
  }
}

function addToCart(id) {
  const product = state.menu.find((item) => item.id === id);
  if (!product) return;
  state.cart[id] = Math.min((state.cart[id] || 0) + 1, 20);
  renderCart();
  showToast(`${product.name} added to your cart`);
}

function changeQuantity(id, direction) {
  if (!state.cart[id]) return;
  const next = state.cart[id] + (direction === "plus" ? 1 : -1);
  if (next <= 0) delete state.cart[id];
  else if (next <= 20) state.cart[id] = next;
  else showToast("Maximum 20 of each item per order.");
  renderCart();
}

function openCart() {
  $("#cart-overlay").classList.add("visible");
  $("#cart-drawer").classList.add("open");
  $("#cart-drawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  $("#close-cart").focus();
}

function closeCart() {
  $("#cart-overlay").classList.remove("visible");
  $("#cart-drawer").classList.remove("open");
  $("#cart-drawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

function applyCoupon() {
  const code = $("#coupon-input").value.trim().toUpperCase();
  const message = $("#coupon-message");
  if (!code) {
    state.coupon = "";
    message.textContent = "Enter a coupon code first.";
    message.className = "coupon-message error-message";
    renderBill();
    return;
  }
  if (code !== "FOODIE10") {
    state.coupon = "";
    message.textContent = "That code isn't valid. Try FOODIE10.";
    message.className = "coupon-message error-message";
  } else if (calculatePreview().subtotal < 199) {
    state.coupon = "FOODIE10";
    message.textContent = "Add items worth ₹199 to unlock your 10% discount.";
    message.className = "coupon-message error-message";
  } else {
    state.coupon = "FOODIE10";
    message.textContent = "Lovely! 10% discount applied.";
    message.className = "coupon-message success-message";
  }
  renderBill();
}

function openCheckout() {
  if (cartEntries().length === 0) return;
  closeCart();
  $("#form-error").textContent = "";
  $("#checkout-total").textContent = money(calculatePreview().total);
  $("#checkout-modal").classList.remove("hidden");
  $("#checkout-modal [name='name']").focus();
}

function closeCheckout() {
  $("#checkout-modal").classList.add("hidden");
}

async function placeOrder(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = $("#place-order-button");
  const errorBox = $("#form-error");
  errorBox.textContent = "";
  if (!form.reportValidity()) return;

  const formData = new FormData(form);
  const customer = Object.fromEntries(formData.entries());
  const payload = {
    customer,
    items: cartEntries().map((item) => ({ id: item.id, quantity: item.quantity })),
    couponCode: state.coupon
  };

  button.disabled = true;
  button.innerHTML = '<span class="button-spinner"></span> Placing your order...';
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error((data.errors || [data.message || "Unable to place your order."]).join(" "));
    }

    closeCheckout();
    $("#success-order-id").textContent = data.order.orderId;
    $("#success-order-total").textContent = money(data.order.bill.total);
    $("#success-modal").classList.remove("hidden");
    state.cart = {};
    state.coupon = "";
    $("#coupon-input").value = "";
    $("#coupon-message").textContent = "";
    form.reset();
    renderCart();
  } catch (error) {
    errorBox.textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    button.disabled = false;
    button.innerHTML = 'Place my order <span>↗</span>';
  }
}

function closeSuccess() {
  $("#success-modal").classList.add("hidden");
  document.querySelector("#menu").scrollIntoView({ behavior: "smooth" });
}

function setCategory(category) {
  state.category = category;
  document.querySelectorAll(".category-chip").forEach((chip) => {
    const selected = chip.dataset.category === category;
    chip.classList.toggle("selected", selected);
    chip.setAttribute("aria-pressed", String(selected));
  });
  renderMenu();
}

function attachEvents() {
  $("#menu-grid").addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    if (addButton) addToCart(addButton.dataset.add);
  });

  $("#menu-search").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderMenu();
  });
  $("#sort-select").addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderMenu();
  });
  $("#veg-only").addEventListener("change", (event) => {
    state.vegOnly = event.target.checked;
    renderMenu();
  });
  $("#category-list").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-category]");
    if (chip) setCategory(chip.dataset.category);
  });
  $("#clear-filters").addEventListener("click", () => {
    state.search = "";
    state.vegOnly = false;
    $("#menu-search").value = "";
    $("#veg-only").checked = false;
    setCategory("All");
  });

  $("#open-cart").addEventListener("click", openCart);
  $("#close-cart").addEventListener("click", closeCart);
  $("#cart-overlay").addEventListener("click", closeCart);
  $("#cart-content").addEventListener("click", (event) => {
    const quantityButton = event.target.closest("[data-quantity]");
    const removeButton = event.target.closest("[data-remove]");
    const exploreButton = event.target.closest("#start-ordering");
    if (quantityButton) changeQuantity(quantityButton.dataset.id, quantityButton.dataset.quantity);
    if (removeButton) {
      delete state.cart[removeButton.dataset.remove];
      renderCart();
    }
    if (exploreButton) closeCart();
  });
  $("#apply-coupon").addEventListener("click", applyCoupon);
  $("#coupon-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyCoupon();
    }
  });
  $("#checkout-button").addEventListener("click", openCheckout);
  $("#close-checkout").addEventListener("click", closeCheckout);
  $("#checkout-form").addEventListener("submit", placeOrder);
  $("#close-success").addEventListener("click", closeSuccess);
  $("#done-button").addEventListener("click", closeSuccess);

  $("#copy-coupon").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("FOODIE10");
      showToast("Coupon FOODIE10 copied!");
    } catch {
      $("#copy-coupon").textContent = "FOODIE10";
      showToast("Use FOODIE10 at checkout.");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
      closeCheckout();
      $("#success-modal").classList.add("hidden");
    }
  });

  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".main-nav a").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

$("#current-year").textContent = new Date().getFullYear();
attachEvents();
renderCart();
loadMenu();
