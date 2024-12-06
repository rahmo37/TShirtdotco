import { sessionObject } from "../../helper/sessionStorage.js";


getOrdersFromSession()

async function getOrdersFromSession() {
  try {
    // Retrieve orders from the session
    const customerOrders = sessionObject.getData("customerOrders");
    const customerData = sessionObject.getData("customer");


    if (!customerOrders || customerOrders.length === 0) {
      renderNoOrders();
      return;
    }

    console.log(customerOrders)
    renderOrders(customerOrders,customerData);

  } catch (error) {
    console.error("Error retrieving orders from session:", error.message);
  }
}

function renderNoOrders() {
  const container = document.querySelector(".container");
  container.innerHTML = `
    <h2>Your Orders</h2>
    <p>No orders found.</p>
  `;
}

function renderOrders(orders, customer) { 
  const container = document.querySelector(".container");

  container.innerHTML = `
    <h2 class="mb-4">Your Orders</h2>
    <div class="orders-list"></div>
  `;

  const ordersList = container.querySelector(".orders-list");

  orders.forEach(order => {
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const orderWrapper = document.createElement("div");
    orderWrapper.className = "col-md-8 mx-auto"; 
  
    const orderElement = document.createElement("div");
    orderElement.className = "card mb-4";
  
    // Order Header Section
    orderElement.innerHTML = `
      <div class="card-header">
        <div class="row">
          <div class="col-3 text-start fw-bold">
            <span>Order Placed</span>
          </div>
          <div class="col-3 text-start fw-bold">
            <span>Shipping to</span>
          </div>
          <div class="col-2"></div>
          <div class="col-2 fw-bold">
            <span>Quantity</span>
          </div>
          <div class="col-2 fw-bold">
            <span>Total Price</span>
          </div>
        </div>

        <div class="row mt-1">
          <div class="col-3 text-start">
            <span>${new Date(order.orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div class="col-3 text-start">
            <span 
              data-bs-toggle="tooltip" 
              data-bs-placement="bottom"
              data-bs-html="true"
              title="
                <strong>${customer.customerBio.firstName} ${customer.customerBio.lastName}</strong><br>
                ${customer.customerBio.address.street}<br>
                ${customer.customerBio.address.city}, ${customer.customerBio.address.country}">
              <span class="text-primary">${customer.customerBio.firstName} ${customer.customerBio.lastName}</span>
            </span>
          </div>
          <div class="col-2"></div>
          <div class="col-2">
            <span>${totalQuantity}</span>
          </div>
          <div class="col-2">
            <span>$${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  
    // Items Section (Card Body)
    const itemsSection = document.createElement("div");
    itemsSection.className = "card-body";

    // Loop through items and create rows for each
    order.items.forEach(item => {
      const itemRow = document.createElement("div");
      itemRow.className = "row";

      itemRow.innerHTML = `
        <div class="col-2 mb-1">
          <img src="../shirtImg/${item.imageUrl}" class="img-fluid rounded" alt="${item.imageUrl}" style="max-width: 100px; height: auto;" />
        </div>
        <div class="col-6 mb-1 text-start">
          <p>${item.productName} | <span class="fst-italic">${item.productDescription}</span></p>
        </div>
        <div class="col-2 mb-1">
          <p>${item.quantity}</p>
        </div>
        <div class="col-2 mb-1">
          <p>$${item.subtotal}</p>
        </div>
      `;
      
      itemsSection.appendChild(itemRow);
    });

    orderElement.appendChild(itemsSection);
    orderWrapper.appendChild(orderElement);
    ordersList.appendChild(orderWrapper);
  });

// Initialize Bootstrap tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

}


