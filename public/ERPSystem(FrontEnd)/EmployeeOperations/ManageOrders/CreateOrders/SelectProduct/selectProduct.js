// This module displays the product table and displays the product detail upon selection

// Importing necessary modules
import { fetchHandler } from "../../../../helper/fetchHandler.js";
import { urlObject } from "../../../../helper/urls.js";
import { errorPopUp } from "../../../../helper/errorPopUpHandler.js";
import { successPopUp } from "../../../../helper/successPopupHandler.js";
import { confirmPopUp } from "../../../../helper/confirmPopUpHandler.js";
import { infoPopUp } from "../../../../helper/informationPopUpHandler.js";
import { filterTable } from "../../../../helper/searchTable.js";
import { loader } from "../../../../helper/loadPageDynamically.js";
import { applyFadeEffect } from "../../../../helper/applyFadeEffect.js";
import { sessionObject } from "../../../../helper/sessionStorage.js";
import { sortTableBySelection } from "../../../../helper/sortBySelection.js";

(function () {
  // This array will hold all the selected products and its information
  const itemsArray = sessionObject.getData("itemsArray");
  let selectedProducts = itemsArray ? itemsArray : [];

  // Products data is cached to avoid multiple http calls
  let cachedProductData = [];

  // Main execution starts here
  init();

  // ! /* Initializes the module */
  async function init() {
    // Gather all elements
    const mainContentArea = document.getElementById("outer-main-container");
    const tableContainer = document.getElementById("table-container");
    const card = document.querySelector(".card");
    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextBtn");
    const searchInput = document.getElementById("searchInput");

    attachEventListeners({
      mainContentArea,
      tableContainer,
      card,
      backBtn,
      nextBtn,
      searchInput,
    });

    if (cachedProductData.length === 0) {
      try {
        cachedProductData = await getInventory();
      } catch (error) {
        // Disable UI elements or show an error message
        console.error("Error fetching inventory:", error);
        searchInput.disabled = true;
        tableContainer.innerHTML =
          "<h3>Unable to load products at this time.</h3>";
        card.innerHTML = "";
        return;
      }
    }
    displayProductsTable(cachedProductData, tableContainer, card);
  }

  function attachEventListeners({
    mainContentArea,
    tableContainer,
    card,
    backBtn,
    nextBtn,
    searchInput,
  }) {
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        filterTable(1);
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (selectedProducts.length > 0) {
          confirmPopUp.showConfirmModal(
            "Are you sure you want to go back? You have selected items, but the order has not been finalized yet!",
            () => {
              navigateBack(mainContentArea);
            }
          );
        } else {
          navigateBack(mainContentArea);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        navigateToNext(mainContentArea);
      });
    }
  }

  /** Fetches inventory data from the API */
  async function getInventory() {
    try {
      const requestInfo = {
        url: urlObject.getInventory,
        method: fetchHandler.methods.get,
      };

      const data = await fetchHandler.sendRequest(requestInfo);
      const inventoryData = data.data;

      // Flatten the inventory data into a product list
      const productData = inventoryData.flatMap((category) =>
        category.products.map((product) => ({
          ...product,
          categoryName: category.categoryName,
          productId: product.productID,
        }))
      );

      return productData;
    } catch (error) {
      errorPopUp.showErrorModal(
        error.message ||
          "An unexpected error occurred while fetching inventory data."
      );
      throw error;
    }
  }

  function displayProductsTable(productData, tableContainer, card) {
    tableContainer.innerHTML = "";

    const table = document.createElement("table");
    table.id = "dataTable";

    // Create the header row
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
      <th>Product ID</th>
      <th>Product Name</th>
      <th>Category</th>
      <th>Subtotal</th>
    `;
    table.appendChild(headerRow);

    // Create the body and append rows dynamically
    const tbody = document.createElement("tbody");
    productData.forEach((product) => {
      const alreadySelectedProduct = selectedProducts.find((eachProduct) => {
        return eachProduct.productId === product.productId;
      });
      const productRow = document.createElement("tr");
      productRow.style.backgroundColor = alreadySelectedProduct
        ? "#00FF0033"
        : "";
      productRow.innerHTML = `
        <td>${alreadySelectedProduct ? "&#9989;" : ""} ${product.productId}</td>
        <td>${product.productName}</td>
        <td>${product.categoryName}</td>
        <td>${
          alreadySelectedProduct ? `$${alreadySelectedProduct.subtotal}` : "---"
        }</td>
      `;

      productRow.addEventListener("click", () => {
        updateProductCard(product, card, alreadySelectedProduct);
      });

      tbody.appendChild(productRow);
    });
    table.appendChild(tbody);

    sortTableBySelection(table);

    const footerContainer = document.createElement("tfoot");
    const footerRow = document.createElement("tr");

    const totalAmount =
      selectedProducts.length > 0
        ? selectedProducts.reduce((acc, product) => {
            return acc + product.subtotal;
          }, 0)
        : 0;

    footerRow.innerHTML = `
      <td colspan="2">Products Selected: ${selectedProducts.length}</td>
      <td colspan="2">Total Amount: $${+totalAmount.toFixed(2)}</td>
    `;
    footerContainer.appendChild(footerRow);

    table.appendChild(footerContainer);
    tableContainer.appendChild(table);
  }

  function updateProductCard(product, card, alreadySelectedProduct) {
    card.innerHTML = `
      <img
        src="../../../../shirtImg/${product.imageUrl}"
        class="card-img-top"
        alt="Product Image"
      />
      <div class="card-body">
        <h1 class="card-title text-center">${product.productName}</h1>

        <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>Product ID:</strong> ${
            product.productId
          }</li>
          <li class="list-group-item">
            <strong>Description:</strong> ${product.productDescription}
          </li>
          <li class="list-group-item"><strong>Unit Price:</strong> $${
            product.unitPrice
          }</li>
          <li class="list-group-item">
            <strong>Stock Quantity:</strong> ${
              product.stockInfo.currentQuantity
            } unit
          </li>
          <li class="list-group-item">
            <strong>Restock Threshold:</strong> ${
              product.stockInfo.restockThreshold
            } unit
          </li>
        </ul>
      </div>
      <div class="card-footer text-center ${
        alreadySelectedProduct ? "card-footer-expanded product-selected" : ""
      }" id="cardFooter">
        <input 
          type="number" 
          id="productQuantity" 
          name="productQuantity"
          value="${
            alreadySelectedProduct ? alreadySelectedProduct.quantity : ""
          }"
          class="form-control" 
          placeholder="Select Quantity" 
          ${alreadySelectedProduct ? "disabled" : ""}
          min="1" 
          max="${product.stockInfo.currentQuantity}"
          required
        >
        <div class="select-product-buttons-container">
          <button class="select-product-buttons" id="selectBtn">Select</button>
          <button class="select-product-buttons" id="removeBtn">Remove</button>
        </div>
      </div>
    `;

    setupProductCardEventListeners(product, alreadySelectedProduct);
  }

  function setupProductCardEventListeners(product, alreadySelectedProduct) {
    const productQuantityInput = document.getElementById("productQuantity");
    const selectBtn = document.getElementById("selectBtn");
    const removeBtn = document.getElementById("removeBtn");
    const cardFooter = document.getElementById("cardFooter");

    // Reset button states
    if (!alreadySelectedProduct) {
      cardFooter.classList.remove("product-selected");
    }

    // Handle quantity input changes with debouncing
    productQuantityInput.addEventListener(
      "input",
      debounce(() => {
        handleQuantityInput(product.stockInfo.currentQuantity);
      }, 300) // Adjust the delay as needed
    );

    let quantity = "";
    let subtotal = "";

    // Attach event listeners to the buttons
    selectBtn.addEventListener("click", () => {
      quantity = parseInt(productQuantityInput.value, 10);
      if (isNaN(quantity) || quantity <= 0) {
        errorPopUp.showErrorModal("Select a valid quantity");
        return;
      }
      if (quantity > product.stockInfo.currentQuantity) {
        infoPopUp.showInfoModal(
          "The quantity selected exceeds the current stock amount. Value reset to maximum stock available"
        );
        productQuantityInput.value = product.stockInfo.currentQuantity;
        quantity = product.stockInfo.currentQuantity;
      }
      subtotal = +(product.unitPrice * quantity).toFixed(2);
      confirmPopUp.showConfirmModal(
        `
        Product: <span style="color:green; font-weight:bold">${product.productName}</span>
        <br>Quantity: <span style="color:green; font-weight:bold">${quantity}</span>
        <br>Subtotal: <span style="color:green; font-weight:bold">$${subtotal}</span>
        <br>Would you like to add this item to the order?
        `,
        () => {
          cardFooter.classList.add("product-selected");
          selectedProducts.push({
            productId: product.productId,
            product,
            subtotal,
            quantity,
          });
          productQuantityInput.disabled = true;
          init();
          successPopUp.showSuccessModal(`Item added to the order`);
        }
      );
    });

    removeBtn.addEventListener("click", () => {
      quantity = parseInt(productQuantityInput.value, 10);
      subtotal = +(product.unitPrice * quantity).toFixed(2);
      confirmPopUp.showConfirmModal(
        `
          Product: <span style="color:red; font-weight:bold">${product.productName}</span>
          <br>Quantity: <span style="color:red; font-weight:bold">${quantity}</span>
          <br>Subtotal: <span style="color:red; font-weight:bold">$${subtotal}</span>
          <br>Remove this item from the order?
          `,
        () => {
          cardFooter.classList.remove("product-selected");
          selectedProducts = selectedProducts.filter((eachProduct) => {
            return eachProduct.productId !== product.productId;
          });
          productQuantityInput.disabled = false;
          productQuantityInput.value = "";
          init();
          successPopUp.showSuccessModal(`Item removed, total amount adjusted`);
        }
      );
    });
  }

  function handleQuantityInput(productStock) {
    const productQuantityInput = document.getElementById("productQuantity");
    const cardFooter = document.getElementById("cardFooter");
    const quantity = parseInt(productQuantityInput.value, 10);

    if (!isNaN(quantity) && quantity > productStock) {
      infoPopUp.showInfoModal(
        "The quantity selected exceeds the current stock amount. Value reset to maximum stock available"
      );
      productQuantityInput.value = productStock;
    }

    if (!isNaN(quantity) && quantity <= productStock && quantity > 0) {
      cardFooter.classList.add("card-footer-expanded");
    } else {
      cardFooter.classList.remove("card-footer-expanded");
    }
  }

  function navigateBack(mainContentArea) {
    loadPageWithFade({
      htmlUrl: "../ManageOrders/DisplayOrders/displayOrders.html",
      cssUrl: "../employee_functions.css",
      jsUrl: "../ManageOrders/DisplayOrders/displayOrders.js",
      targetElement: mainContentArea,
    });
    if (sessionObject.getData("itemsArray")) {
      sessionObject.removeData("itemsArray");
    }
    if (sessionObject.getData("customerObject")) {
      sessionObject.removeData("customerObject");
    }
  }

  function navigateToNext(mainContentArea) {
    if (selectedProducts.length === 0) {
      errorPopUp.showErrorModal(
        "Please select products for the order before proceeding to the next page"
      );
      return;
    }
    if (sessionObject.getData("itemsArray")) {
      sessionObject.removeData("itemsArray");
    }
    sessionObject.setData("itemsArray", selectedProducts);

    loadPageWithFade({
      htmlUrl:
        "../ManageOrders/CreateOrders/SelectCustomer/selectCustomer.html",
      cssUrl: "../ManageOrders/CreateOrders/SelectCustomer/selectCustomer.css",
      jsUrl: "../ManageOrders/CreateOrders//SelectCustomer/selectCustomer.js",
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

  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }
})();
