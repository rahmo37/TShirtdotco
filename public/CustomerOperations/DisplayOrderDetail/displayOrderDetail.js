// This module initializes the home page

// Necessary Imports
import { fetchHandler } from "../../helper/fetchHandler.js";
import { urlObject } from "../../helper/urls.js";
import { sessionObject } from "../../helper/sessionStorage.js";
import { confirmPopUp } from "../../helper/confirmPopUpHandler.js";
import { successPopUp } from "../../helper/successPopupHandler.js";
import { errorPopUp } from "../../helper/errorPopUpHandler.js";
import { infoPopUp } from "../../helper/informationPopUpHandler.js";

window.onload = async () => {
  // Load all the necessary popup modals
  await successPopUp.loadModal("../../popups/successPopup.html");
  await errorPopUp.loadModal("../../popups/errorPopup.html");
  await confirmPopUp.loadModal("../../popups/confirmPopUp.html");
  await infoPopUp.loadModal("../../popups/infoPopUp.html");

  init();
};

function init() {
  const selectedOrder = sessionObject.getData("orderSelected") || {};
  const selectCustomer = sessionObject.getData("customer") || {};
  const leftContainer = document.querySelector(".left-column");
  const rightContainer = document.querySelector(".right-column");
  leftContainer.innerHTML = "";
  rightContainer.innerHTML = "";
  appendGeneratedInfo(leftContainer, generateShippingInfo(selectCustomer));
  appendGeneratedInfo(leftContainer, generateProductInfo(selectedOrder.items));
  appendGeneratedInfo(rightContainer, generateOrderSummary(selectedOrder));

  const cancelOrderBtn = document.getElementById("cancel-order");
  cancelOrderBtn.addEventListener("click", () => {
    confirmPopUp.showConfirmModal(
      "Are you sure you want to cancel the order?",
      () => {
        cancelOrder(selectedOrder.orderID);
      }
    );
  });
}

function appendGeneratedInfo(outerContainer, infoHtml) {
  const containerDiv = document.createElement("div");
  containerDiv.innerHTML = infoHtml;
  outerContainer.appendChild(containerDiv);
  return containerDiv;
}

function generateShippingInfo(selectCustomer) {
  const customerAddress =
    selectCustomer.customerBio.address.street +
    ", " +
    selectCustomer.customerBio.address.city +
    ", " +
    selectCustomer.customerBio.address.country;
  return `
      <div class="section">
        <h3>Shipping Information</h3>
        <p><strong>Customer Name: </strong>${
          selectCustomer.customerBio.firstName +
          " " +
          selectCustomer.customerBio.lastName
        }</p>
        <p><strong>Phone Number:</strong> ${selectCustomer.phone}</p>
        <p><strong>Email:</strong> ${selectCustomer.email}</p>
        <p>
          <strong>Shipping Address:</strong> ${customerAddress}
        </p>
    </div>
  `;
}

function generateProductInfo(selectedProducts) {
  console.log(selectedProducts);
  let productsHtml = "";
  selectedProducts.forEach((productDetail) => {
    productsHtml += eachProductHtml(productDetail);
  });
  return `
      <div class="section product-information">
        <h3>Product Information</h3>
        <div class="table-responsive product-table">
          <table>
            <thead>
              <tr>
                <th style="width: 70%">Product</th>
                <th>Each</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <!-- Product Rows -->
              ${productsHtml}
            </tbody>
          </table>
        </div>
      </div>`;
}

function eachProductHtml(product) {
  console.log(product);
  return `<tr>
  <td class="product-cell">
    <img
      src="../../../../shirtImg/${product.imageUrl || "no-photo.png"}"
      alt="Product Image"
    />
    <div class="product-details">
      <p><strong>Name: </strong> ${product.productName}</p>
    </div>
  </td>
  <td class="unit-price align-middle">$${product.unitPrice}</td>
  <td class="qty align-middle">${product.quantity}</td>
  <td class="subtotal align-middle">$${product.subtotal}</td>
</tr>`;
}

function generateOrderSummary(orderObject) {
  let totalAmount = orderObject.totalPrice || 0;
  const discountPercentage = orderObject.discountInPercentage || 0;
  const discountAmount =
    totalAmount && discountPercentage
      ? (totalAmount * discountPercentage) / 100
      : 0.0;
  totalAmount += discountAmount;

  const hasDiscount =
    orderObject.discountInPercentage !== undefined &&
    orderObject.discountInPercentage !== null &&
    orderObject.discountInPercentage !== 0;

  const dot = getStatusDot(orderObject.orderStatus);

  return `
  <div class="section order-summary">
    <h3>Order Summary</h3>
    <table>
      <tr>
        <td><strong>Order Status:</strong></td>
        <td>${dot} ${orderObject.orderStatus}</td>
      </tr>
      <tr>
        <td><strong>Total Amount:</strong></td>
        <td>$${totalAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <td><strong>Discount:</strong></td>
        <td>
          <div class="discount-container">
            <p class="pt-3" style="color: tomato">($${discountAmount.toFixed(
              2
            )})</p>
          </div>
        </td>
      </tr>
      ${
        hasDiscount
          ? `<tr>
              <td><strong>Adjusted Amount:</strong></td>
              <td style="border-top: 2px solid #6c757d; font-size: 22px;">$${orderObject.totalPrice.toFixed(
                2
              )}</td>
            </tr>`
          : ""
      }
      <tr>
        <td><strong>Tax:</strong></td>
        <td>$${orderObject.tax.toFixed(2)}</td>
      </tr>
      <tr>
        <td><strong>Grand Total:</strong></td>
        <td id="grand-total">$${orderObject.grandTotal.toFixed(2)}</td>
      </tr>
      ${
        orderObject.orderStatus.toLowerCase() === "processing" ||
        orderObject.orderStatus.toLowerCase() === "shipped"
          ? `<tr>
               <td colspan="2" style="text-align: center;">
                 <button class="btn btn-primary" id="cancel-order" style="background-color: #f73430; border: none; margin-left: 180px">Cancel Order</button>
               </td>
             </tr>`
          : ""
      }
    </table>
  </div>`;
}

const getStatusDot = (status) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "&#128994;"; // Green dot
    case "processing":
      return "&#128992;"; // Orange dot
    case "cancelled":
      return "&#128308;"; // Red dot
    case "shipped":
      return "&#128309;"; // Blue dot
    default:
      return "&#128309;"; // Default red dot for unknown statuses
  }
};

function cancelOrder(id) {
  try {
    const requestInfo = {
      url: urlObject.cancelOrder + id,
      method: fetchHandler.methods.patch,
    };
    const data = fetchHandler.sendRequest(requestInfo);
    successPopUp.showSuccessModal("Order cancelled", () => {
      window.location.href = "../ViewOrders/viewOrders.html";
    });
  } catch (error) {
    errorPopUp.showErrorModal(error.message);
  }
}
