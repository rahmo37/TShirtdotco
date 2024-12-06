// This module displays the cart

// importing necessary modules
// Necessary Imports
import { sessionObject } from "../../helper/sessionStorage.js";
import { confirmPopUp } from "../../helper/confirmPopUpHandler.js";
import { successPopUp } from "../../helper/successPopupHandler.js";
import { errorPopUp } from "../../helper/errorPopUpHandler.js";
import { infoPopUp } from "../../helper/informationPopUpHandler.js";

// Declare productSelectionArray at the module level
let productSelectionArray = [];

// Declare coupon codes
const couponCodes = [
  { code: "DISCOUNT5", discount: 5 },
  { code: "DISCOUNT10", discount: 10 },
  { code: "DISCOUNT15", discount: 15 },
  { code: "DISCOUNT20", discount: 20 },
  { code: "DISCOUNT25", discount: 25 },
];

// Variable to hold current discount percentage
let currentDiscountPercentage = 0;

window.onload = async () => {
  await successPopUp.loadModal("../../popups/successPopup.html");
  await errorPopUp.loadModal("../../popups/errorPopup.html");
  await confirmPopUp.loadModal("../../popups/confirmPopUp.html");
  await infoPopUp.loadModal("../../popups/infoPopUp.html");

  init();
};

function init() {
  const outerContainer = document.querySelector(".shop");
  const checkOutContainer = document.querySelector(".right-bar");
  outerContainer.innerHTML = "";
  checkOutContainer.innerHTML = "";

  // Get the productSelectionArray from session storage
  productSelectionArray =
    sessionObject.getData("customerProductSelectionArray") || [];

  if (productSelectionArray.length === 0) {
    outerContainer.innerHTML = `<h3 style="text-align:center">Your cart is empty</h3>`;
    return;
  }

  updateCheckOutSection();

  // Iterate through each product in the selection array
  productSelectionArray.forEach((selectedProduct) => {
    // Generate the HTML for the current product
    const eachProductHtml = generateEachItemHtml(selectedProduct);

    // Append the generated product HTML to the outer container
    outerContainer.appendChild(eachProductHtml);

    // Get the productID from the data attribute
    const productID = eachProductHtml.getAttribute("data-product-id");

    // Select elements within the current product's HTML
    const removeBtn = eachProductHtml.querySelector(".removeBtn");
    const sizeSelector = eachProductHtml.querySelector(".size-selector");
    const quantitySelector =
      eachProductHtml.querySelector(".quantity-selector");
    const subtotalElement = eachProductHtml.querySelector(".subtotal");

    // Add a click event listener to the remove button
    removeBtn.addEventListener("click", () => {
      // Show a confirmation popup for removing the item
      confirmPopUp.showConfirmModal(
        `Remove This Item From The Cart? <br>${selectedProduct.product.productName}`,
        () => {
          // Find the index of the product in the selection array
          const index = productSelectionArray.findIndex(
            (item) => item.product.productID == productID
          );

          if (index !== -1) {
            // Remove the product from the selection array
            productSelectionArray.splice(index, 1);

            // Update the session storage with the new product array
            sessionObject.setData(
              "customerProductSelectionArray",
              productSelectionArray
            );

            // Remove the product's HTML element from the DOM
            eachProductHtml.remove();

            if (productSelectionArray.length === 0) {
              sessionObject.setData(
                "customerProductSelectionArray",
                productSelectionArray
              );
              outerContainer.innerHTML = `<h3 style="text-align:center">Your cart is empty</h3>`;
              checkOutContainer.innerHTML = "";
            } else {
              // Update the totals
              updateCheckOutSection();
            }
          }
        }
      );
    });

    if (sizeSelector) {
      sizeSelector.addEventListener("change", (event) => {
        const newSize = event.target.value;
        // Find the index of the product
        const index = productSelectionArray.findIndex(
          (item) => item.product.productID == productID
        );

        if (index !== -1) {
          productSelectionArray[index].size = newSize;
          sessionObject.setData(
            "customerProductSelectionArray",
            productSelectionArray
          );
        }
      });
    }

    if (quantitySelector) {
      const handleInput = (event) => {
        const newQuantity = parseInt(event.target.value, 10);

        // Find the index of the product
        const index = productSelectionArray.findIndex(
          (item) => item.product.productID == productID
        );

        if (index !== -1) {
          const selectedProduct = productSelectionArray[index];

          // Check for invalid quantity selection
          if (
            newQuantity > selectedProduct.product.stockInfo.currentQuantity ||
            newQuantity < 1 ||
            isNaN(newQuantity)
          ) {
            errorPopUp.showErrorModal(
              `Quantity selected must be between 1 - ${selectedProduct.product.stockInfo.currentQuantity}`
            );

            event.target.value = selectedProduct.quantity;
            return;
          }

          const subtotal = +(
            selectedProduct.product.unitPrice * newQuantity
          ).toFixed(2);
          productSelectionArray[index].subtotal = subtotal;
          productSelectionArray[index].quantity = newQuantity;
          sessionObject.setData(
            "customerProductSelectionArray",
            productSelectionArray
          );
          subtotalElement.textContent = `Sub-Total: $${subtotal.toFixed(2)}`;

          // Update the totals
          updateCheckOutSection();
        }
      };

      quantitySelector.addEventListener("change", handleInput);
    }
  });
}

function generateEachItemHtml(selectedProduct) {
  let selectSize = "<p>No size Available</p>";

  if (
    selectedProduct.product.categoryName &&
    selectedProduct.product.categoryName.toLowerCase() !== "accessories"
  ) {
    const sizes = ["Small", "Medium", "Large", "XL", "XXL"];

    selectSize = `
      <select class="size-selector">
        ${sizes
          .map(
            (size) => `
                  <option value="${size}" ${
              size.toLowerCase() === selectedProduct.size.toLowerCase()
                ? "selected"
                : ""
            }>${size}</option>
                `
          )
          .join("")}
      </select>
    `;
  }

  const eachItemHtml = `<img src="../../shirtImg/${
    selectedProduct.product.imageUrl
  }" alt="" />
                <div class="content">
                  <h4>${selectedProduct.product.productName}</h4>
                  <h5 class="subtotal">Sub-Total: $${selectedProduct.subtotal.toFixed(
                    2
                  )}</h5>
                  ${selectSize}
                  <p class="unit"><input class="quantity-selector" type="number" value="${
                    selectedProduct.quantity
                  }" min="1" max="${
    selectedProduct.product.stockInfo.currentQuantity
  }" /></p>
                  <p class="btn-area">
                    <i class="fa fa-trash">
                      <span class="btn2 removeBtn">Remove</span>
                    </i>
                  </p>
                </div>`;
  const productWrapper = document.createElement("div");
  productWrapper.classList.add("box");
  productWrapper.innerHTML = eachItemHtml;

  // Set data-product-id attribute
  productWrapper.setAttribute(
    "data-product-id",
    selectedProduct.product.productID
  );

  return productWrapper;
}

function calculateTotals(discountPercentage = 0) {
  const totalAmount = productSelectionArray.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );
  const discountAmount = +(totalAmount * (discountPercentage / 100)).toFixed(2);
  const adjustedTotal = +(totalAmount - discountAmount).toFixed(2);
  return { totalAmount, discountAmount, adjustedTotal };
}

function generateCheckOutSectionHtml() {
  const { totalAmount, discountAmount, adjustedTotal } = calculateTotals(
    currentDiscountPercentage
  );

  const checkOutSectionWrapper = document.createElement("div");
  checkOutSectionWrapper.classList.add("checkout-section");

  checkOutSectionWrapper.innerHTML = `
    <p><span>Total Amount</span> <span>$${totalAmount.toFixed(2)}</span></p>
    <hr />
    <div class="discount-section">
      <input type="text" class="coupon-code-input" placeholder="Enter Coupon Code" />
      <button class="apply-coupon-btn">Apply</button>
    </div>
    <hr />
    <p><span>Discount (${currentDiscountPercentage}%)</span> <span style="color:tomato">-$${discountAmount.toFixed(
    2
  )}</span></p>
    <hr />
    <p><span>Adjusted Total Amount</span> <span style="color:green">$${adjustedTotal.toFixed(
      2
    )}</span></p>
    <hr />
    <a href="#" class="proceed-to-checkout-btn">Proceed To Checkout</a>
  `;

  // Add event listener for the apply button
  const applyCouponBtn =
    checkOutSectionWrapper.querySelector(".apply-coupon-btn");
  const couponCodeInput =
    checkOutSectionWrapper.querySelector(".coupon-code-input");

  applyCouponBtn.addEventListener("click", () => {
    const enteredCode = couponCodeInput.value.trim().toUpperCase();
    const coupon = couponCodes.find((c) => c.code === enteredCode);

    if (coupon) {
      currentDiscountPercentage = coupon.discount;
      updateCheckOutSection();
    } else {
      infoPopUp.showInfoModal("Code did not match");
      currentDiscountPercentage = 0; // reset discount if code invalid
      updateCheckOutSection();
    }
  });

  // Add event listener for the "Proceed To Checkout" button
  const proceedToCheckoutBtn = checkOutSectionWrapper.querySelector(
    ".proceed-to-checkout-btn"
  );

  proceedToCheckoutBtn.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default link behavior

    // Calculate totals again to ensure they're up-to-date
    const { totalAmount, adjustedTotal } = calculateTotals(
      currentDiscountPercentage
    );

    const orderSummary = {};

    // Add the totalAmount and discountPercentage to the productSelectionArray
    orderSummary.totalAmount = +totalAmount.toFixed(2);
    orderSummary.adjustedTotalAmount = +adjustedTotal.toFixed(2);
    orderSummary.discountPercentage = currentDiscountPercentage;
    orderSummary.tax = +(adjustedTotal * 0.08).toFixed(2);
    orderSummary.grandTotal = +(adjustedTotal + orderSummary.tax).toFixed(2);

    sessionObject.setData("orderSummary", orderSummary);

    // Save the updated array to session storage
    sessionObject.setData(
      "customerProductSelectionArray",
      productSelectionArray
    );

    console.log(productSelectionArray);

    window.location.href = "../FinalizeOrder/finalizeOrder.html";
  });

  return checkOutSectionWrapper;
}

function updateCheckOutSection() {
  const checkOutContainer = document.querySelector(".right-bar");
  checkOutContainer.innerHTML = "";
  checkOutContainer.appendChild(generateCheckOutSectionHtml());
}
