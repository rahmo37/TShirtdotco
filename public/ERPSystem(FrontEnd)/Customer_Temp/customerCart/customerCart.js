import { sessionObject } from "../../helper/sessionStorage.js";
import { urlObject } from "../../helper/urls.js";
import { fetchHandler } from "../../helper/fetchHandler.js";

async function createOrder(orderData) {
  try {
    const requestInfo = {
      url: urlObject.createOrder,
      method: fetchHandler.methods.post,
      data: orderData,
    };

    const data = await fetchHandler.sendRequest(requestInfo);
    console.log("Order added successfully:", data);

    localStorage.removeItem("cart");
    loadCart(); // Refresh the cart UI
  } catch (error) {
    console.error("Error adding new Order:", error.message);
  }
}

// Load and display customer data
async function loadCustomerData() {
  try {
    const customerData = sessionObject.getData("customer");
    const customerInfoElement = document.getElementById("customer-info");
    customerInfoElement.innerHTML = `
      <strong>Delivering to ${customerData.customerBio.firstName} ${customerData.customerBio.lastName}</strong><br>
      ${customerData.customerBio.address.street}, ${customerData.customerBio.address.city}, ${customerData.customerBio.address.country}<br>
    `;
  } catch (error) {
    console.error("Error retrieving customer data:", error.message);
  }
}

// Load and display cart items
function loadCart() {
  const cartProductsContainer = document.getElementById("cart-products");
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  if (cartItems.length === 0) {
    cartProductsContainer.innerHTML = `
      <div class="d-flex justify-content-center align-items-center w-100">
        <p><strong>Your cart is empty.</strong></p>
      </div>
    `;
    updateCheckoutSummary(0, 0, 0); // Reset totals
    return;
  }

  cartProductsContainer.innerHTML = ""; // Clear previous content

  // Display cart items
  cartItems.forEach((item, index) => {
    const itemRow = document.createElement("div");
    itemRow.className = "row align-items-center mb-3";

    itemRow.innerHTML = `
      <div class="col-2">
        <img src="../../img/${item.image}" class="img-fluid rounded" alt="${
      item.name
    }" />
      </div>
      <div class="col-6 text-start">
        <p>${item.name} | <span class="fst-italic">${
      item.description || "No description available"
    }</span></p>
      </div>
      <div class="col-2">
        <select class="form-select quantity-dropdown" data-index="${index}">
          ${generateQuantityOptions(item.quantity)}
        </select>
      </div>
      <div class="col-2">
        <p class="item-total-price">$${(item.price * item.quantity).toFixed(
          2
        )}</p>
      </div>
    `;

    cartProductsContainer.appendChild(itemRow);
  });

  quantityListeners();
  calculateTotals();
}

// Generate quantity dropdown options
function generateQuantityOptions(currentQuantity) {
  let options = "";
  for (let i = 0; i <= 99; i++) {
    options += `<option value="${i}" ${
      i === currentQuantity ? "selected" : ""
    }>${i}</option>`;
  }
  return options;
}

//  quantity change listeners
function quantityListeners() {
  const quantityDropdowns = document.querySelectorAll(".quantity-dropdown");

  quantityDropdowns.forEach((dropdown) => {
    dropdown.addEventListener("change", (event) => {
      const index = event.target.dataset.index;
      const newQuantity = parseInt(event.target.value, 10);

      if (newQuantity === 0) {
        removeFromCart(index);
      } else {
        updateQuantity(index, newQuantity);
      }
    });
  });
}

// Update cart item quantity
function updateQuantity(index, newQuantity) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity = newQuantity;
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// Remove cart item
function removeFromCart(index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// Calculate and update checkout totals
function calculateTotals() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const subtotal = parseFloat(
    cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2)
  );
  const tax = parseFloat((subtotal * 0.08875).toFixed(2));
  const grandTotal = parseFloat((subtotal + tax).toFixed(2));

  updateCheckoutSummary(subtotal, tax, grandTotal);
}

// Update checkout summary
function updateCheckoutSummary(subtotal, tax, grandTotal) {
  document.getElementById(
    "checkout-subtotal"
  ).textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("checkout-tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById(
    "checkout-grandtotal"
  ).textContent = `$${grandTotal.toFixed(2)}`;
}

// checkout button functionality
document.getElementById("checkout-button").addEventListener("click", () => {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const customerID = sessionObject.getData("customer").customerID;

  if (cartItems.length === 0) {
    alert(
      "Your cart is empty. Please add items before proceeding to checkout."
    );
    return; // Prevent further execution
  }

  const order = {
    items: cartItems.map((item) => ({
      productID: item.id,
      quantity: item.quantity,
      subtotal: parseFloat((item.price * item.quantity).toFixed(2)), // Ensure two decimal points
    })),
    customerID: customerID,
    totalPrice: parseFloat(
      cartItems
        .reduce((total, item) => total + item.price * item.quantity, 0)
        .toFixed(2)
    ),
    tax: parseFloat(
      (
        cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ) * 0.08875
      ).toFixed(2)
    ),
    grandTotal: parseFloat(
      (
        cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ) +
        cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ) *
          0.08875
      ).toFixed(2)
    ),
  };

  createOrder(order);
  console.log("Order Data:", order);
  alert("Proceeding to checkout...");
});

// Load customer data and cart items on page load
window.onload = function () {
  loadCustomerData();
  loadCart();
};
