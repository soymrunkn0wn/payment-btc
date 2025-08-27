// Zaprite payment configuration
let ZAPRITE_PAYMENT_LINK =
  localStorage.getItem("zaprite_payment_link") ||
  "https://pay.zaprite.com/pl_QLrOjMIZks";
const ZAPRITE_API_BASE = "https://api.zaprite.com";
const USE_CORS_PROXY = localStorage.getItem("use_cors_proxy") === "true";
const CORS_PROXY = "https://api.allorigins.win/raw?url=";
let API_KEY = localStorage.getItem("zaprite_api_key") || "";

// Bitcoin price tracking
let BITCOIN_PRICE_GBP = 0;

// Product configuration
let PRODUCT = {
  name: localStorage.getItem("product_name") || "Top 250 Ranked",
  description:
    localStorage.getItem("product_description") ||
    "Get to top 250 in Black Ops 6 ranked play.",
  price: parseFloat(localStorage.getItem("product_price")) || 99.99,
  currency: localStorage.getItem("product_currency") || "GBP",
};

// DOM elements
const loadingOverlay = document.getElementById("loading-overlay");
const orderStatus = document.getElementById("order-status");
const statusMessage = document.getElementById("status-message");
const orderDetails = document.getElementById("order-details");

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  // Load product info into UI if elements exist
  updateProductDisplay();

  // Clear any existing order status on page load
  clearOrder();

  // Fetch Bitcoin price
  fetchBitcoinPrice();

  // Add click handlers to background icons
  setupBackgroundIconClickHandlers();

  // Setup camo dropdown handler
  setupCamoDropdownHandler();

  // Store camo prices globally for access by updateCamoPrice
  window.camoPrices = {
    "dark-matter": 185.0,
    nebula: 260.0,
    abyss: 260.0,
    "max-level-weapons": 148.0,
  };
});

// Update product display in UI
function updateProductDisplay() {
  const productCards = document.querySelectorAll(".product-card");
  const prices = [99.99, 79.99, 149.99, 199.99]; // Prices for each product card
  const camoPrices = window.camoPrices || {
    "dark-matter": 89.99,
    nebula: 94.99,
    abyss: 84.99,
  };

  productCards.forEach((productCard, index) => {
    const priceEl = productCard.querySelector(".price");
    const camoDropdown = productCard.querySelector(".camo-dropdown");

    // For camo product card (index 1), only update if no camo is selected
    if (index === 1 && camoDropdown) {
      if (!camoDropdown.value) {
        priceEl.innerHTML = `****<span class="btc-price"></span>`;
      }
    } else if (priceEl && BITCOIN_PRICE_GBP > 0) {
      let price = prices[index];
      let btcEquivalent = "";

      if (BITCOIN_PRICE_GBP > 0) {
        btcEquivalent = (() => {
          const sats = Math.round((price / BITCOIN_PRICE_GBP) * 100000000);
          const formattedSats = sats.toLocaleString("en-US").replace(/,/g, " ");
          return ` <img src="./images/bitcoin-logo.png" alt="Bitcoin" class="bitcoin-icon">${formattedSats} <span class="discount-text">(20% off)</span>`;
        })();
        priceEl.innerHTML = `£${price}<span class="btc-price">${btcEquivalent}</span>`;
      } else {
        priceEl.innerHTML = `£${price}<span class="btc-price"></span>`;
      }
    }
  });
}

// Setup camo dropdown handler
function setupCamoDropdownHandler() {
  const camoDropdown = document.querySelector(".camo-dropdown");
  if (camoDropdown) {
    camoDropdown.addEventListener("change", function () {
      const selectedCamo = this.value;
      const productCard = this.closest(".product-card");
      const payButton = productCard.querySelector(".pay-button");
      const priceEl = productCard.querySelector(".price");

      if (selectedCamo === "dark-matter") {
        payButton.setAttribute(
          "data-payment-link",
          "https://pay.zaprite.com/pl_v8M4fFP4DH",
        );
        updateCamoPrice(priceEl, camoPrices["dark-matter"]);
      } else if (selectedCamo === "nebula") {
        payButton.setAttribute(
          "data-payment-link",
          "https://pay.zaprite.com/pl_fq3xcoQDAx",
        );
        updateCamoPrice(priceEl, camoPrices["nebula"]);
      } else if (selectedCamo === "abyss") {
        payButton.setAttribute(
          "data-payment-link",
          "https://pay.zaprite.com/pl_X79LGcCv9O",
        );
        updateCamoPrice(priceEl, camoPrices["abyss"]);
      } else if (selectedCamo === "max-level-weapons") {
        payButton.setAttribute(
          "data-payment-link",
          "https://pay.zaprite.com/pl_PGiT9BhLBd",
        );
        updateCamoPrice(priceEl, camoPrices["max-level-weapons"]);
      } else {
        payButton.removeAttribute("data-payment-link");
        priceEl.innerHTML = `****<span class="btc-price"></span>`;
      }
    });
  }
}

function updateCamoPrice(priceEl, price) {
  if (BITCOIN_PRICE_GBP > 0) {
    const btcEquivalent = (() => {
      const sats = Math.round((price / BITCOIN_PRICE_GBP) * 100000000);
      const formattedSats = sats.toLocaleString("en-US").replace(/,/g, " ");
      return ` <img src="./images/bitcoin-logo.png" alt="Bitcoin" class="bitcoin-icon">${formattedSats} <span class="discount-text">(20% off)</span>`;
    })();
    priceEl.innerHTML = `£${price}<span class="btc-price">${btcEquivalent}</span>`;
  } else {
    priceEl.innerHTML = `£${price}<span class="btc-price"></span>`;
  }

  // Store the current price in a data attribute to prevent reset
  priceEl.setAttribute("data-camo-price", price);
}

// Toggle payment info visibility
function toggleInfo() {
  const paymentInfo = document.querySelector(".payment-info");
  const isVisible = paymentInfo.style.display !== "none";
  paymentInfo.style.display = isVisible ? "none" : "block";
}

// Toggle configuration panel
function toggleConfig() {
  const configPanel = document.getElementById("config-panel");
  if (configPanel) {
    const isVisible = configPanel.style.display !== "none";
    configPanel.style.display = isVisible ? "none" : "block";

    // Populate current values
    if (!isVisible) {
      document.getElementById("payment-link").value = ZAPRITE_PAYMENT_LINK;
      document.getElementById("product-name").value = PRODUCT.name;
      document.getElementById("product-description").value =
        PRODUCT.description;
      document.getElementById("product-price").value = PRODUCT.price;
      document.getElementById("product-currency").value = PRODUCT.currency;
    }
  }
}

// Save configuration
function saveConfig() {
  const paymentLink = document.getElementById("payment-link").value.trim();
  const productName = document.getElementById("product-name").value.trim();
  const productDescription = document
    .getElementById("product-description")
    .value.trim();
  const productPrice = parseFloat(
    document.getElementById("product-price").value,
  );
  const productCurrency = document
    .getElementById("product-currency")
    .value.trim();

  if (!paymentLink.includes("pay.zaprite.com")) {
    alert("Please enter a valid Zaprite payment link");
    return;
  }

  if (
    !productName ||
    !productDescription ||
    isNaN(productPrice) ||
    productPrice <= 0
  ) {
    alert("Please fill in all product details correctly");
    return;
  }

  // Save to localStorage
  localStorage.setItem("zaprite_payment_link", paymentLink);
  localStorage.setItem("product_name", productName);
  localStorage.setItem("product_description", productDescription);
  localStorage.setItem("product_price", productPrice);
  localStorage.setItem("product_currency", productCurrency);

  // Update current values
  ZAPRITE_PAYMENT_LINK = paymentLink;
  PRODUCT.name = productName;
  PRODUCT.description = productDescription;
  PRODUCT.price = productPrice;
  PRODUCT.currency = productCurrency;

  // Update UI
  updateProductDisplay();

  // Hide config panel
  document.getElementById("config-panel").style.display = "none";

  alert("Configuration saved successfully!");

  // Refresh Bitcoin price display
  fetchBitcoinPrice();
}

// Show loading overlay
function showLoading() {
  loadingOverlay.style.display = "flex";
}

// Hide loading overlay
function hideLoading() {
  loadingOverlay.style.display = "none";
}

// Show status message
function showStatus(type, message, details = null) {
  statusMessage.className = `status-message ${type}`;
  statusMessage.textContent = message;

  if (details) {
    orderDetails.innerHTML = details;
    orderDetails.style.display = "block";
  } else {
    orderDetails.style.display = "none";
  }

  orderStatus.style.display = "block";

  // Scroll to status
  orderStatus.scrollIntoView({ behavior: "smooth" });
}

// Use existing Zaprite payment link
function createOrderFromPaymentLink() {
  // Create a mock order object for consistency with the rest of the code
  const mockOrder = {
    id: "pl_KUIRi9yAOX",
    checkout_url: ZAPRITE_PAYMENT_LINK,
    amount: PRODUCT.price,
    currency: PRODUCT.currency,
    status: "pending",
    created_at: new Date().toISOString(),
    name: PRODUCT.name,
    description: PRODUCT.description,
  };

  // Save to localStorage for tracking
  localStorage.setItem("current_order", JSON.stringify(mockOrder));

  console.log("Using existing payment link:", ZAPRITE_PAYMENT_LINK);
  return Promise.resolve(mockOrder);
}

// Legacy function for API-based order creation (kept for debugging)
async function createOrder() {
  console.warn("API order creation disabled - using payment link instead");
  return createOrderFromPaymentLink();
}

// Get order status from Zaprite API
async function getOrderStatus(orderId) {
  try {
    const apiUrl = USE_CORS_PROXY
      ? `${CORS_PROXY}${encodeURIComponent(ZAPRITE_API_BASE + "/v1/orders/" + orderId)}`
      : `${ZAPRITE_API_BASE}/v1/orders/${orderId}`;
    const headers = {
      Authorization: `Bearer ${API_KEY}`,
    };

    // Add CORS proxy headers if needed
    if (USE_CORS_PROXY) {
      headers["X-Requested-With"] = "XMLHttpRequest";
    }

    const response = await fetch(apiUrl, {
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const order = await response.json();
    return order;
  } catch (error) {
    console.error("Error fetching order status:", error);
    throw error;
  }
}

// Load existing order status from localStorage
function loadOrderStatus() {
  const savedOrder = localStorage.getItem("current_order");
  if (savedOrder) {
    try {
      const order = JSON.parse(savedOrder);
      displayOrderStatus(order);

      // Auto-refresh status if order is pending
      if (order.status === "pending" || order.status === "processing") {
        pollOrderStatus(order.id);
      }
    } catch (error) {
      console.error("Error loading saved order:", error);
      localStorage.removeItem("current_order");
    }
  }
}

// Display order status
function displayOrderStatus(order) {
  let statusType, statusText, detailsHtml;

  switch (order.status) {
    case "paid":
    case "completed":
      statusType = "success";
      statusText = "✅ Payment Successful!";
      break;
    case "pending":
    case "processing":
      statusType = "pending";
      statusText = "⏳ Payment Pending...";
      break;
    case "expired":
      statusType = "error";
      statusText = "⏰ Payment Expired";
      break;
    case "cancelled":
      statusType = "error";
      statusText = "❌ Payment Cancelled";
      break;
    default:
      statusType = "pending";
      statusText = `Status: ${order.status}`;
  }

  // Create details HTML
  detailsHtml = `
        <h4>Order Details</h4>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Amount:</strong> $${order.amount} ${order.currency}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Created:</strong> ${new Date(order.created_at).toLocaleString()}</p>
    `;

  // Add payment URL if available and order is pending
  if (
    order.checkout_url &&
    (order.status === "pending" || order.status === "processing")
  ) {
    detailsHtml += `
            <p><strong>Payment Link:</strong>
                <a href="${order.checkout_url}" target="_blank" onclick="openPaymentWindow('${order.checkout_url}')">
                    Complete Payment
                </a>
            </p>
        `;
  }

  showStatus(statusType, statusText, detailsHtml);
}

// Poll order status periodically
function pollOrderStatus(orderId) {
  const pollInterval = setInterval(async () => {
    try {
      const order = await getOrderStatus(orderId);

      // Update saved order
      localStorage.setItem("current_order", JSON.stringify(order));

      // Update display
      displayOrderStatus(order);

      // Stop polling if order is complete
      if (!["pending", "processing"].includes(order.status)) {
        clearInterval(pollInterval);
      }
    } catch (error) {
      console.error("Error polling order status:", error);
      // Continue polling on error, but maybe reduce frequency
    }
  }, 5000); // Poll every 5 seconds

  // Stop polling after 30 minutes
  setTimeout(
    () => {
      clearInterval(pollInterval);
    },
    30 * 60 * 1000,
  );
}

// Open payment in a new window/tab
function openPaymentWindow(url) {
  const paymentWindow = window.open(
    url,
    "zaprite-payment",
    "width=800,height=600,scrollbars=yes",
  );

  // Focus the payment window
  if (paymentWindow) {
    paymentWindow.focus();

    // Check if payment window is closed (user might have completed payment)
    const checkClosed = setInterval(() => {
      if (paymentWindow.closed) {
        clearInterval(checkClosed);
        // Refresh order status
        const savedOrder = localStorage.getItem("current_order");
        if (savedOrder) {
          const order = JSON.parse(savedOrder);
          pollOrderStatus(order.id);
        }
      }
    }, 1000);
  }
}

// Main payment initiation function
async function initiatePayment(event) {
  showLoading();

  try {
    // Check if this is the camo product with a specific payment link
    const payButton = event.target;
    const specificPaymentLink = payButton.getAttribute("data-payment-link");

    let checkoutUrl;
    if (specificPaymentLink) {
      checkoutUrl = specificPaymentLink;
    } else {
      // Use existing payment link for other products
      const order = await createOrderFromPaymentLink();
      checkoutUrl = order.checkout_url;
    }

    if (checkoutUrl) {
      hideLoading();
      openPaymentWindow(checkoutUrl);
    } else {
      throw new Error("No checkout URL available");
    }
  } catch (error) {
    hideLoading();
    console.error("Payment initiation error:", error);
    showStatus("error", `❌ Payment initiation failed: ${error.message}`);
  }
}

// Clear current order (for testing/debugging)
function clearOrder() {
  localStorage.removeItem("current_order");
  orderStatus.style.display = "none";
  console.log("Order cleared from localStorage");
}

// Toggle CORS proxy mode
function toggleCorsProxy() {
  const currentMode = localStorage.getItem("use_cors_proxy") === "true";
  const newMode = !currentMode;
  localStorage.setItem("use_cors_proxy", newMode.toString());

  alert(`CORS Proxy ${newMode ? "ENABLED" : "DISABLED"}. Page will reload.`);
  location.reload();
}

// Add keyboard shortcuts for development
document.addEventListener("keydown", function (e) {
  // Ctrl/Cmd + Shift + C to clear order
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
    clearOrder();
  }

  // Ctrl/Cmd + Shift + I to toggle payment info
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") {
    toggleInfo();
  }

  // Ctrl/Cmd + Shift + P to toggle CORS proxy
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "P") {
    toggleCorsProxy();
  }
});

// Test with minimal order data
async function createMinimalOrder() {
  if (!API_KEY) {
    alert("Please configure your Zaprite API key first");
    return null;
  }

  try {
    const minimalData = {
      amount: 1.0,
      currency: "USD",
    };

    const apiUrl = USE_CORS_PROXY
      ? `${CORS_PROXY}${encodeURIComponent(ZAPRITE_API_BASE + "/v1/orders")}`
      : `${ZAPRITE_API_BASE}/v1/orders`;

    console.log("Testing with minimal order data:", minimalData);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(minimalData),
    });

    const result = await response.json().catch(() => ({}));
    console.log("Minimal order test result:", result);
    return result;
  } catch (error) {
    console.error("Minimal order test failed:", error);
    return null;
  }
}

// Export functions for debugging (when in browser console)
window.zapriteDebug = {
  clearOrder,
  getOrderStatus,
  createOrder,
  createMinimalOrder,
  toggleCorsProxy,
  API_KEY: () => API_KEY,
  corsProxyEnabled: () => USE_CORS_PROXY,
};

console.log("Zaprite Payment System Loaded");
console.log("Using Payment Link:", ZAPRITE_PAYMENT_LINK);
console.log("Debug functions available at window.zapriteDebug");
console.log("Keyboard shortcuts:");
console.log("  Ctrl+Shift+C (clear order)");
console.log("  Ctrl+Shift+I (toggle payment info)");
console.log("  Ctrl+Shift+P (toggle CORS proxy)");
console.log(
  "Note: Now using existing Zaprite payment link instead of API order creation",
);

// Fetch Bitcoin price in GBP
async function fetchBitcoinPrice() {
  try {
    const response = await fetch(
      "https://api.coinbase.com/v2/exchange-rates?currency=BTC",
    );
    const data = await response.json();

    if (data && data.data && data.data.rates && data.data.rates.GBP) {
      BITCOIN_PRICE_GBP = parseFloat(data.data.rates.GBP);
      console.log(`Bitcoin price: £${BITCOIN_PRICE_GBP.toLocaleString()}`);

      // Update display
      updateProductDisplay();
    }
  } catch (error) {
    console.warn("Could not fetch Bitcoin price:", error);
    BITCOIN_PRICE_GBP = 0;
  }
}

// Refresh Bitcoin price every 5 minutes
setInterval(fetchBitcoinPrice, 5 * 60 * 1000);

// Setup click handlers for background icons
function setupBackgroundIconClickHandlers() {
  // Bitcoin icons
  const bitcoinIcons = document.querySelectorAll(
    ".bitcoin1, .bitcoin2, .bitcoin3, .bitcoin4",
  );
  bitcoinIcons.forEach((icon) => {
    icon.style.cursor = "pointer";
    icon.addEventListener("click", function (e) {
      e.preventDefault();
      window.open("https://bitcoin.org/en/", "_blank");
    });
  });

  // Dollar icons
  const dollarIcons = document.querySelectorAll(".dollar1, .dollar2, .dollar3");
  dollarIcons.forEach((icon) => {
    icon.style.cursor = "pointer";
    icon.addEventListener("click", function (e) {
      e.preventDefault();
      window.open(
        "https://x.com/OppCostApp/status/1952831340597948565/video/1",
        "_blank",
      );
    });
  });
}
