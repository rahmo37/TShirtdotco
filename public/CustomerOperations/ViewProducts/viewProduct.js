// This module displays a product detail

// Importing necessary modules
import { sessionObject } from "../../helper/sessionStorage.js";
import { successPopUp } from "../../helper/successPopupHandler.js";
import { confirmPopUp } from "../../helper/confirmPopUpHandler.js";
import { errorPopUp } from "../../helper/errorPopUpHandler.js";
import { infoPopUp } from "../../helper/informationPopUpHandler.js";

window.onload = async () => {
  // Load all the necessary popup modals
  await successPopUp.loadModal("../../popups/successPopup.html");
  await errorPopUp.loadModal("../../popups/errorPopup.html");
  await confirmPopUp.loadModal("../../popups/confirmPopUp.html");
  await infoPopUp.loadModal("../../popups/infoPopUp.html");

  // Initialize after modals are loaded
  init();
};

function init() {
  const clickedProduct = sessionObject.getData("clickedProduct");
  const productSelectionArray =
    sessionObject.getData("customerProductSelectionArray") || [];

  if (!clickedProduct) {
    errorPopUp.showErrorModal(
      "You Must Select a Product First to View Its Details",
      () => {
        window.location.href = "../Home/home.html";
      }
    );
    return; // Exit the function if no product is selected
  }

  const productSelectedIndexOutsideListener = productSelectionArray.findIndex(
    (product) => {
      return clickedProduct.productID === product.productID;
    }
  );

  const productDetails = document.getElementById("proDetails");

  // Generate Product details
  productDetails.innerHTML = generateProductHtml(
    clickedProduct,
    productSelectedIndexOutsideListener
  );

  // Re-select the add to cart button after updating the HTML
  const addToCartBtn = document.getElementById("add-to-cart-btn");

  // Add event click listener to add to cart button
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      // Check if the product is already selected
      const productSelectedIndexInsideListener =
        productSelectionArray.findIndex((product) => {
          return clickedProduct.productID === product.productID;
        });

      // Grab the size selected
      let size = "";
      const sizeSelector = document.getElementById("size-selector");
      if (sizeSelector) {
        size = sizeSelector.value;
      }

      // Grab the quantity selector element
      const quantitySelector = document.getElementById("quantity-selector");
      if (!quantitySelector) {
        errorPopUp.showErrorModal("Quantity selector not found.");
        return;
      }

      // Get the max quantity of this product
      const maxQuantity = Number(quantitySelector.getAttribute("max"));

      // Get the selected quantity
      const selectedQuantity = Number(quantitySelector.value);

      // Check for invalid quantity selection
      if (selectedQuantity > maxQuantity || selectedQuantity < 1) {
        errorPopUp.showErrorModal(
          `Quantity selected must be between 1 - ${maxQuantity}`
        );
        return;
      }

      // Calculate the subtotal
      const subtotal = +(clickedProduct.unitPrice * selectedQuantity).toFixed(
        2
      );

      // Set or push the product details, subtotal, and quantity
      if (productSelectedIndexInsideListener === -1) {
        productSelectionArray.push({
          productID: clickedProduct.productID,
          product: clickedProduct,
          subtotal,
          quantity: selectedQuantity,
          size,
        });
        addToCartBtn.style.backgroundColor = "orange";
        addToCartBtn.innerHTML = "Update Cart";
      } else {
        productSelectionArray[productSelectedIndexInsideListener] = {
          productID: clickedProduct.productID,
          product: clickedProduct,
          subtotal,
          quantity: selectedQuantity,
          size,
        };
      }

      // Update the session storage array
      sessionObject.setData(
        "customerProductSelectionArray",
        productSelectionArray
      );

      successPopUp.showSuccessModal(
        productSelectedIndexInsideListener === -1
          ? "Product Added To Cart"
          : "Product Information Updated In The Cart"
      );

      console.log(productSelectionArray);
    });
  }
}

function generateProductHtml(product, selectedIndex) {
  let selectSize = "<p>No size Available</p>";
  if (
    product.categoryName &&
    product.categoryName.toLowerCase() !== "accessories"
  ) {
    selectSize = `
      <select id="size-selector">
        <option>Medium</option>
        <option>Large</option>
        <option>XL</option>
        <option>XXL</option>
        <option>Small</option>
      </select>
    `;
  }

  let quantityInput = "";
  let addToCartButton = "";

  if (product.stockInfo && product.stockInfo.currentQuantity > 0) {
    quantityInput = `
      <input type="number" value="1" min="1" max="${product.stockInfo.currentQuantity}" id="quantity-selector" />
    `;

    addToCartButton = `
      <button 
        class="normal" 
        id="add-to-cart-btn" 
        style="background-color: ${selectedIndex === -1 ? "" : "orange"}">
        ${selectedIndex === -1 ? "Add To Cart" : "Update Cart"}
      </button>
    `;
  } else {
    quantityInput = `
      <p style="color: red; font-weight: bold;">Out of Stock</p>
    `;
    addToCartButton = "";
  }

  return `
    <div class="single-pro-image">
      <img src="../../shirtImg/${product.imageUrl}" width="100%" id="MainImg" />
    </div>
    <div class="single-pro-details">
      <h6>${product.categoryName}</h6>
      <h4>${product.productName}</h4>
      <div class="star view-product-rating">
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
      </div>

      ${
        selectedIndex === -1
          ? ""
          : "<p style='color: green;'>This product is currently in the cart</p>"
      }
      <h2>$${product.unitPrice}</h2>
      ${selectSize}
      ${quantityInput}
      ${addToCartButton}
      <h5>Product Description</h5>
      <span>
        ${product.productDescription}
      </span>
      <h5>Color</h5>
      <span>
        ${product.color.charAt(0).toUpperCase() + product.color.slice(1)}
      </span>
      <h5>Available Quantity</h5>
      <span style="color:${
        product.stockInfo && product.stockInfo.currentQuantity <= 10
          ? "orange"
          : "green"
      }; font-weight: bold">
        ${product.stockInfo ? product.stockInfo.currentQuantity : 0}
      </span>
    </div>
  `;
}


