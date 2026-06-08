const products = {
  wispyangel: { name: "WISPYANGEL", price: 350 },
  "bratz-doll": { name: "BRATZ DOLL", price: 350 },
  "sweet-dreams": { name: "SWEET DREAMS", price: 350 },
  cashmere: { name: "CA$HMERE", price: 350 },
  pressure: { name: "PRESSURE", price: 350 },
  extraaa: { name: "EXTRAAA", price: 350 },
  siren: { name: "SIREN", price: 120 },
  winx: { name: "WINX", price: 120 },
  "hi-honey": { name: "HI HONEY", price: 120 },
  crushhh: { name: "CRUSHHH", price: 120 },
  bundle: { name: "WISPAIR Bundle", price: 550 }
};

/* Theme toggle: dark by default, switchable to light, persisted in localStorage. */
const themeKey = "wispair-theme";
const sunIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>';
const moonIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

function applyTheme(theme) {
  const isLight = theme === "light";
  document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
  const btn = document.querySelector("[data-theme-toggle]");
  if (btn) {
    btn.innerHTML = isLight ? moonIcon : sunIcon;
    btn.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  }
}

function initThemeToggle() {
  let theme = "dark";
  try {
    theme = localStorage.getItem(themeKey) || "dark";
  } catch (e) {}

  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.setAttribute("data-theme-toggle", "");
  button.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    try { localStorage.setItem(themeKey, next); } catch (e) {}
    applyTheme(next);
  });
  document.body.appendChild(button);
  applyTheme(theme);
}

initThemeToggle();

const cartKey = "wispair-order";
let cart = JSON.parse(localStorage.getItem(cartKey) || "{}");

const money = (value) => `R${value.toFixed(2).replace(".", ",")}`;
const cartCountEls = document.querySelectorAll("[data-cart-count]");
const cartItemsEl = document.querySelector("[data-cart-items]");
const cartTotalEl = document.querySelector("[data-cart-total]");
const drawer = document.querySelector("[data-order-drawer]");
const backdrop = document.querySelector("[data-drawer-backdrop]");
const toast = document.querySelector("[data-toast]");

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function cartCount() {
  return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal() {
  return Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderCart() {
  const count = cartCount();
  cartCountEls.forEach((el) => {
    el.textContent = count;
  });

  if (!cartItemsEl || !cartTotalEl) return;

  const items = Object.entries(cart);
  if (!items.length) {
    cartItemsEl.innerHTML = `<div class="empty">Your order bag is empty.</div>`;
  } else {
    cartItemsEl.innerHTML = items.map(([id, item]) => `
      <div class="cart-item">
        <div class="cart-item-top">
          <strong>${item.name}</strong>
          <span>${money(item.price * item.qty)}</span>
        </div>
        <div class="qty-row">
          <button type="button" data-qty="${id}" data-change="-1" aria-label="Decrease ${item.name}">-</button>
          <span>${item.qty}</span>
          <button type="button" data-qty="${id}" data-change="1" aria-label="Increase ${item.name}">+</button>
          <button type="button" class="btn small" data-remove="${id}">Remove</button>
        </div>
      </div>
    `).join("");
  }

  cartTotalEl.textContent = money(cartTotal());
}

function openDrawer() {
  drawer?.classList.add("open");
  backdrop?.classList.add("open");
}

function closeDrawer() {
  drawer?.classList.remove("open");
  backdrop?.classList.remove("open");
}

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.add;
    const product = products[id];
    if (!product) return;
    cart[id] = cart[id] || { ...product, qty: 0 };
    cart[id].qty += 1;
    saveCart();
    renderCart();
    showToast(`${product.name} added to your order`);
  });
});

document.addEventListener("click", (event) => {
  const qtyButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");

  if (qtyButton) {
    const id = qtyButton.dataset.qty;
    const change = Number(qtyButton.dataset.change);
    if (cart[id]) {
      cart[id].qty += change;
      if (cart[id].qty <= 0) delete cart[id];
      saveCart();
      renderCart();
    }
  }

  if (removeButton) {
    delete cart[removeButton.dataset.remove];
    saveCart();
    renderCart();
  }
});

document.querySelectorAll("[data-open-order]").forEach((button) => {
  button.addEventListener("click", openDrawer);
});

document.querySelectorAll("[data-close-order]").forEach((button) => {
  button.addEventListener("click", closeDrawer);
});

backdrop?.addEventListener("click", closeDrawer);

document.querySelector("[data-menu-toggle]")?.addEventListener("click", () => {
  document.querySelector("[data-nav-links]")?.classList.toggle("open");
});

document.querySelector("[data-order-form]")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const items = Object.values(cart);

  if (!items.length) {
    showToast("Add at least one product first.");
    return;
  }

  const lines = [
    "Hi WISPAIR, I would like to place an order:",
    "",
    ...items.map((item) => `${item.qty} x ${item.name} - ${money(item.price * item.qty)}`),
    "",
    `Total: ${money(cartTotal())}`,
    `Name: ${form.get("name")}`,
    `Phone: ${form.get("phone")}`,
    `Delivery / collection notes: ${form.get("notes") || "Not provided"}`
  ];

  const message = lines.join("\n");
  let summary = event.currentTarget.querySelector(".order-summary");
  if (!summary) {
    summary = document.createElement("div");
    summary.className = "order-summary";
    event.currentTarget.append(summary);
  }
  summary.textContent = message;

  // Save order details and open the mock payment page
  try {
    localStorage.setItem("wispair-order-message", message);
    localStorage.setItem("wispair-order-data", JSON.stringify(items));
    window.location.href = "payment.html";
  } catch (err) {
    showToast("Unable to start payment. Please try again.");
  }
});

renderCart();

// If returning from payment page, check payment status
const paymentStatus = localStorage.getItem("wispair-payment-status");
if (paymentStatus === "success") {
  showToast("Payment successful. Order placed.");
  localStorage.removeItem("wispair-payment-status");
  // copy order message to clipboard and open Instagram for final send
  const orderMsg = localStorage.getItem("wispair-order-message");
  if (orderMsg && navigator.clipboard) {
    navigator.clipboard.writeText(orderMsg).catch(() => {});
  }
  window.open("https://www.instagram.com/wispairofficial/", "_blank", "noopener");
  // clear cart and order data
  cart = {};
  saveCart();
  renderCart();
  localStorage.removeItem("wispair-order-message");
  localStorage.removeItem("wispair-order-data");
} else if (paymentStatus === "failed") {
  showToast("Payment failed. Please try again.");
  localStorage.removeItem("wispair-payment-status");
}
