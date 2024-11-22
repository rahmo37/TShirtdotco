// This module displays the order summary, and finalizes the order

import { fetchHandler } from "../../../../helper/fetchHandler.js";
import { urlObject } from "../../../../helper/urls.js";
import { errorPopUp } from "../../../../helper/errorPopUpHandler.js";
import { successPopUp } from "../../../../helper/successPopupHandler.js";
import { confirmPopUp } from "../../../../helper/confirmPopUpHandler.js";
import { infoPopUp } from "../../../../helper/informationPopUpHandler.js";
import { loader } from "../../../../helper/loadPageDynamically.js";
import { applyFadeEffect } from "../../../../helper/applyFadeEffect.js";
import { sessionObject } from "../../../../helper/sessionStorage.js";

(function () {
  // The main outer container
  const mainContentArea = document.getElementById("outer-main-container");

  // Collect the data from the session storage
  const selectedProducts = sessionObject.getData("itemsArray");
  const selectCustomer = sessionObject.getData("customerObject");

  // Check if the product and the customer is already selected
  if (
    !selectedProducts ||
    selectedProducts.length === 0 ||
    !selectCustomer ||
    isEmptyObject(selectCustomer)
  ) {
    errorPopUp.showErrorModal(
      "You must select product(s) and a customer before finalizing the order",
      () => {
        navigateBack(mainContentArea);
      }
    );
    return;
  }

  // This will hold the order instance
  let orderObject = {};

  // This function builds the order instance
  function buildTheOrder(discountInPercent = 0) {
    // constance tax amount
    const TAX_RATE = 0.08;

    // Total amount from product subtotal before any discount applied
    let totalAmount = selectedProducts.reduce((acc, product) => {
      return acc + product.subtotal;
    }, 0);

    // Tax  amount
    const tax = Math.round(totalAmount * TAX_RATE * 100) / 100;

    // Total amount after discount applied
    totalAmount = +(
      totalAmount -
      totalAmount * (discountInPercent / 100)
    ).toFixed(2);

    // Adding everything to get the grand total
    const grandTotal = +(totalAmount + tax).toFixed(2);

    // Constructing the items array for the order
    const items = selectedProducts.map(({ productId, subtotal, quantity }) => {
      return { productID: productId, subtotal, quantity };
    });

    // This is the order instance
    orderObject = {
      customerID: selectCustomer.customerID,
      totalPrice: totalAmount,
      tax,
      grandTotal,
      items,
    };

    // Adding discount if exists
    if (
      +discountInPercent &&
      +discountInPercent > 0 &&
      +discountInPercent <= 100
    ) {
      orderObject.discountInPercentage = discountInPercent;
    } else {
      delete orderObject.discountInPercentage;
    }
  }

  buildTheOrder();
  init();

  function init() {
    // Gather all elements
    const leftContainer = document.querySelector(".left-column");
    const rightContainer = document.querySelector(".right-column");
    const backBtn = document.getElementById("back-btn");
    const placeOrderBtn = document.getElementById("place-order");

    attachEventListeners({
      mainContentArea,
      backBtn,
      placeOrderBtn,
    });

    displayOrderInformation(leftContainer, rightContainer);
  }

  function attachEventListeners({ mainContentArea, backBtn, placeOrderBtn }) {
    if (backBtn) {
      backBtn.removeEventListener("click", handleBackBtnClick);
      backBtn.addEventListener("click", handleBackBtnClick);
    }

    if (placeOrderBtn) {
      placeOrderBtn.removeEventListener("click", handlePlaceOrderClick);
      placeOrderBtn.addEventListener("click", handlePlaceOrderClick);
    }
  }

  function handleBackBtnClick() {
    navigateBack(mainContentArea);
  }

  function handlePlaceOrderClick() {
    try {
      confirmPopUp.showConfirmModal(
        "Are you sure you want to place the order?",
        async () => {
          try {
            const data = await placeOrder();
            if (data) {
              successPopUp.showSuccessModal("Order Created Successfully", () => {
                sessionObject.removeData("itemsArray");
                sessionObject.removeData("customerObject");
                navigateToDisplayOrder(mainContentArea);
              });
            }
          } catch (error) {
            errorPopUp.showErrorModal(error.message);
          }
        }
      );
    } catch (error) {
      errorPopUp.showErrorModal(error.message);
    }
  }

  function displayOrderInformation(leftContainer, rightContainer) {
    leftContainer.innerHTML = "";
    rightContainer.innerHTML = "";
    appendGeneratedInfo(leftContainer, generateShippingInfo());
    appendGeneratedInfo(leftContainer, generateProductInfo());
    appendGeneratedInfo(rightContainer, generateOrderSummary());

    applyDiscount();
  }

  function applyDiscount() {
    const discountBtn = document.getElementById("discountBtn");
    const discountInput = document.getElementById("discountInput");
    discountBtn.addEventListener("click", () => {
      const discountValue = discountInput.value;
      if (!isNaN(discountValue) && discountValue > 0 && discountValue <= 100) {
        buildTheOrder(discountValue);
        init();
      } else {
        errorPopUp.showErrorModal(
          "Enter a valid value for the discount amount. Must be between 1 to 100"
        );
      }
    });
  }

  function generateShippingInfo() {
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

  function generateProductInfo() {
    let productsHtml = "";
    selectedProducts.forEach((productDetail) => {
      productsHtml += eachProductHtml(productDetail);
    });
    selectedProducts;
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

  function generateOrderSummary() {
    const totalAmount = selectedProducts.reduce((acc, product) => {
      return acc + product.subtotal;
    }, 0);
    let discountAmount = totalAmount - orderObject.totalPrice;
    return `<div class="section order-summary">
          <h3>Order Summary</h3>
          <table>
            <tr>
              <td><strong>Total Amount:</strong></td>
              <td>$${+totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Discount:</strong></td>
              <td>
                <div class="discount-container">
                  <input
                    type="number"
                    class="form-control discount-input"
                    id="discountInput"
                    value="${orderObject.discountInPercentage || 0}"
                  />%
                  <button class="btn btn-secondary btn-sm" id="discountBtn">Apply</button>
                  <p class="pt-3" style="color: tomato">($${
                    +discountAmount.toFixed(2) || "0.00"
                  })</p>
                </div>
              </td>
              ${
                orderObject.discountInPercentage
                  ? `<tr>
                    <td><strong>Adjusted Amount:</strong></td>
                    <td style="border-top: 2px solid #6c757d; font-size: 22px;">$${orderObject.totalPrice}</td>
                  </tr>
                  `
                  : ""
              }
            </tr>
            <tr>
              <td><strong>Tax:</strong></td>
              <td>$${orderObject.tax}</td>
            </tr>
            <tr>
              <td><strong>Grand Total:</strong></td>
              <td id="grand-total">$${orderObject.grandTotal}</td>
            </tr>
          </table>
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
        <p><strong>Product Id: </strong> ${productDetail.productId}</p>
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

  function appendGeneratedInfo(outerContainer, infoHtml) {
    const containerDiv = document.createElement("div");
    containerDiv.innerHTML = infoHtml;
    outerContainer.appendChild(containerDiv);
    return containerDiv;
  }

  function navigateBack(mainContentArea) {
    loadPageWithFade({
      htmlUrl:
        "../ManageOrders/CreateOrders/SelectCustomer/selectCustomer.html",
      cssUrl: "../ManageOrders/CreateOrders/SelectCustomer/selectCustomer.css",
      jsUrl: "../ManageOrders/CreateOrders/SelectCustomer/selectCustomer.js",
      targetElement: mainContentArea,
    });
  }

  function navigateToDisplayOrder(mainContentArea) {
    loadPageWithFade({
      htmlUrl: "../ManageOrders/DisplayOrders/displayOrders.html",
      cssUrl: "../employee_functions.css",
      jsUrl: "../ManageOrders/DisplayOrders/displayOrders.js",
      targetElement: mainContentArea,
    });
  }

  function loadPageWithFade({ htmlUrl, cssUrl, jsUrl, targetElement }) {
    try {
      applyFadeEffect(() => {
        loader.removeJs();
        loader.removeCss();
        loader.loadPageContent({
          htmlUrl,
          cssUrl,
          jsUrl,
          targetElement,
        });
      }, targetElement);
    } catch (error) {
      console.error("Error loading page:", error);
    }
  }

  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  }

  async function placeOrder() {
    try {
      const requestInfo = {
        url: urlObject.placeOrder,
        method: fetchHandler.methods.post,
        data: orderObject,
      };
      const data = await fetchHandler.sendRequest(requestInfo);
      const newOrder = data.data;
      return newOrder;
    } catch (error) {
      throw error;
    }
  }
})();
