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
  const productSelectionArray =
    sessionObject.getData("customerProductSelectionArray") || [];
  const orderSummary = sessionObject.getData("orderSummary") || {};
  const selectCustomer = sessionObject.getData("customer") || {};
  const leftContainer = document.querySelector(".left-column");
  const rightContainer = document.querySelector(".right-column");

  leftContainer.innerHTML = "";
  rightContainer.innerHTML = "";
  appendGeneratedInfo(leftContainer, generateShippingInfo(selectCustomer));
  appendGeneratedInfo(
    leftContainer,
    generateProductInfo(productSelectionArray)
  );
  appendGeneratedInfo(rightContainer, generateOrderSummary(orderSummary));

  const placeOrderBtn = document.getElementById("place-order");
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", () => {
      placeOrder(productSelectionArray, orderSummary, selectCustomer);
    });
  }
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

function eachProductHtml(productDetail) {
  return `<tr>
  <td class="product-cell">
    <img
      src="../../../../shirtImg/${
        productDetail.product.imageUrl || "no-photo.png"
      }"
      alt="Product Image"
    />
    <div class="product-details">
      <p><strong>Name: </strong> ${productDetail.product.productName}</p>
      <p><strong>Color: </strong> ${productDetail.product.color}</p>
      <p><strong>Category: </strong> ${productDetail.product.categoryName}</p>
    </div>
  </td>
  <td class="unit-price align-middle">$${productDetail.product.unitPrice}</td>
  <td class="qty align-middle">${productDetail.quantity}</td>
  <td class="subtotal align-middle">$${productDetail.subtotal}</td>
</tr>`;
}

function generateOrderSummary(orderObject) {
  const totalAmount = orderObject.totalAmount || 0;
  const discountPercentage = orderObject.discountPercentage || 0;
  const discountAmount =
    totalAmount && discountPercentage
      ? ((totalAmount * discountPercentage) / 100).toFixed(2)
      : "0.00";

  const hasDiscount =
    orderObject.discountPercentage !== undefined &&
    orderObject.discountPercentage !== null &&
    orderObject.discountPercentage !== 0;

  return `<div class="section order-summary">
        <h3>Order Summary</h3>
        <table>
          <tr>
            <td><strong>Total Amount:</strong></td>
            <td>$${totalAmount}</td>
          </tr>
          <tr>
            <td><strong>Discount:</strong></td>
            <td>
              <div class="discount-container">
                <p class="pt-3" style="color: tomato">($${discountAmount})</p>
              </div>
            </td>
          </tr>
          ${
            hasDiscount
              ? `<tr>
                  <td><strong>Adjusted Amount:</strong></td>
                  <td style="border-top: 2px solid #6c757d; font-size: 22px;">$${orderObject.adjustedTotalAmount}</td>
                </tr>`
              : ""
          }
          <tr>
            <td><strong>Tax:</strong></td>
            <td>$${orderObject.tax}</td>
          </tr>
          <tr>
            <td><strong>Grand Total:</strong></td>
            <td id="grand-total">$${orderObject.grandTotal}</td>
          </tr>
          <tr>
            <td>
              <button class="btn btn-primary" id="place-order">Place Order</button>
            </td>
          </tr>
        </table>
      </div>`;
}

async function placeOrder(itemsArray, orderSummary, customer) {
  const newOrder = {};
  const items = itemsArray.map((item) => {
    return {
      productID: item.productID,
      quantity: item.quantity,
      subtotal: item.subtotal,
    };
  });
  newOrder.items = items;
  newOrder.customerID = customer.customerID;
  newOrder.totalPrice = orderSummary.adjustedTotalAmount;
  newOrder.tax = orderSummary.tax;
  newOrder.grandTotal = orderSummary.grandTotal;

  if (
    orderSummary.discountPercentage !== undefined &&
    orderSummary.discountPercentage !== null &&
    orderSummary.discountPercentage !== 0
  ) {
    newOrder.discountInPercentage = orderSummary.discountPercentage;
  }

  const requestInfo = {
    url: urlObject.placeOrder,
    method: fetchHandler.methods.post,
    data: newOrder,
  };

  try {
    const data = await fetchHandler.sendRequest(requestInfo);
    successPopUp.showSuccessModal("Your order has been placed!", () => {
      window.location.href = "../Home/home.html";
      sessionObject.removeData("customerProductSelectionArray");
      sessionObject.removeData("orderSummary");
    });
  } catch (error) {
    errorPopUp.showErrorModal(error.message);
  }
}
