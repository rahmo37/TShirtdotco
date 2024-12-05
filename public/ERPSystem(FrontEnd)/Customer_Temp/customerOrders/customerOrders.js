import { sessionObject } from "../../helper/sessionStorage.js";

getOrdersFromSession();

async function getOrdersFromSession() {
  try {
    const customerOrders = sessionObject.getData("customerOrders");
    const customerData = sessionObject.getData("customer");

    if (!customerOrders || customerOrders.length === 0) {
      renderNoOrders();
      return;
    }

    renderOrders(customerOrders, customerData);
  } catch (error) {
    console.error("Error retrieving orders from session:", error.message);
  }
}

function renderNoOrders() {
  document.getElementById("completed-orders-list").innerHTML =
    "<p>No completed orders found.</p>";
  document.getElementById("pending-orders-list").innerHTML =
    "<p>No pending orders found.</p>";
}

function renderOrders(orders, customer) {
  const completedOrders = orders.filter(
    (order) => order.orderStatus === "completed"
  );
  const pendingOrders = orders.filter(
    (order) =>
      order.orderStatus === "processing" || order.orderStatus === "shipped"
  );

  renderOrderList(completedOrders, "completed-orders-list", customer);
  renderOrderList(pendingOrders, "pending-orders-list", customer);
  renderTrackingOrders(pendingOrders, customer); // Render tracking orders
}

function renderTrackingOrders(orders, customer) {
  const container = document.getElementById("tracking-orders-list");
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = "<p>No orders to track.</p>";
    return;
  }

  orders.forEach((order) => {
    const trackingWrapper = document.createElement("div");
    trackingWrapper.className = "card mb-3";

    trackingWrapper.innerHTML = `
                <div class="timeline">
                    <div class="timeline-item left">
                        <div class="timeline-item-content">
                            <h4>Order Placed</h4>
                            <p>Your order has been successfully placed on 11/15/2024.</p>
                            <span>✔</span>
                        </div>
                    </div>
                    <div class="timeline-item right">
                        <div class="timeline-item-content">
                            <h4>Processing</h4>
                            <p>Your order is being prepared for shipment.</p>
                            <span>⌛</span>
                        </div>
                    </div>
                    <div class="timeline-item left">
                        <div class="timeline-item-content">
                            <h4>Shipped</h4>
                            <p>Your order has been shipped and is on its way.</p>
                            <span>🚚</span>
                        </div>
                    </div>
                    <div class="timeline-item right">
                        <div class="timeline-item-content">
                            <h4>Delivered</h4>
                            <p>Your order has been delivered on 11/18/2024.</p>
                            <span>📦</span>
                        </div>
                    </div>
                </div>
    `;

    container.appendChild(trackingWrapper);
  });
}

function renderOrderList(orders, containerId, customer) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = "<p>No orders found.</p>";
    return;
  }

  orders.forEach((order) => {
    const totalQuantity = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const orderWrapper = document.createElement("div");
    orderWrapper.className = "col-md-8 mx-auto";

    const orderElement = document.createElement("div");
    orderElement.className = "card mb-4";

    // Order Header Section
    orderElement.innerHTML = `
      <div class="card-header">
        <div class="row">
          <div class="col-3 text-start fw-bold">Order Placed</div>
          <div class="col-5 text-start fw-bold">Shipped to</div>
          <div class="col-2 fw-bold">Quantity</div>
          <div class="col-2 fw-bold">Total Price</div>
        </div>
        <div class="row mt-1">
          <div class="col-3 text-start">${new Date(
            order.orderDate
          ).toLocaleDateString()}</div>
          <div class="col-3 text-start">
            <span class="text-primary" data-bs-toggle="tooltip" data-bs-placement="bottom"
            title="
            ${customer.customerBio.address.street}
            ${customer.customerBio.address.city},
            ${customer.customerBio.address.country}">
            ${customer.customerBio.firstName} ${customer.customerBio.lastName}
            </span>
          </div>
          <div class="col-2">${totalQuantity}</div>
          <div class="col-2">$${order.totalPrice.toFixed(2)}</div>
        </div>
      </div>
    `;

    // Items Section
    const itemsSection = document.createElement("div");
    itemsSection.className = "card-body";
    order.items.forEach((item) => {
      const itemRow = document.createElement("div");
      itemRow.className = "row";
      itemRow.innerHTML = `
        <div class="col-2 mb-1">
          <img src="../../img/${
            item.imageUrl
          }" class="img-fluid rounded" alt="${item.productName}" />
        </div>
        <div class="col-6 mb-1 text-start">
          <p>${item.productName} | <span class="fst-italic">${
        item.productDescription
      }</span></p>
        </div>
        <div class="col-2 mb-1">${item.quantity}</div>
        <div class="col-2 mb-1">$${item.subtotal.toFixed(2)}</div>
      `;
      itemsSection.appendChild(itemRow);
    });

    orderElement.appendChild(itemsSection);
    orderWrapper.appendChild(orderElement);
    container.appendChild(orderWrapper);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  [...tooltipTriggerList].forEach(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
});
