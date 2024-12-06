// Importing the fetchHandler module
import { fetchHandler } from "../../helper/fetchHandler.js";
import { urlObject } from "../../helper/urls.js";
import { errorPopUp } from "../../helper/errorPopUpHandler.js";
import { successPopUp } from "../../helper/successPopupHandler.js";
import { confirmPopUp } from "../../helper/confirmPopUpHandler.js";
import { filterTable } from "../../helper/searchTable.js";

// Initialize event listener for search input
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", () => {
  filterTable();
});

(function () {
  const inventoryContainer = document.getElementById("table-container");
  const addProductBtn = document.getElementById("add-new-btn");
  const modal = document.getElementById("product-modal");
  const modalContent = document.getElementById("modal-content-inventory");
  const closeModalBtn = document.getElementById("close-productDetail-modal");
  const modalOverlay = document.getElementById("custom-modal-overlay");
  const addProductModal = document.getElementById("add-product-modal");
  const closeAddProductModalBtn = document.getElementById(
    "close-add-product-modal"
  );
  const inventoryForm = document.getElementById("new-product-form");
  const addProductModalOverlay = document.getElementById(
    "add-product-modal-overlay"
  );

  let inventoryData; // Declare inventoryData at a higher scope

  getAdminInventory();

  ///////////////////////////////////////////////////////////////////////////////////////

  async function getAdminInventory() {
    try {
      const requestInfo = {
        url: urlObject.getInventory,
        method: fetchHandler.methods.get,
      };

      const data = await fetchHandler.sendRequest(requestInfo);
      inventoryData = data.data; // Store inventory data
      renderInventory(inventoryData);
    } catch (error) {
      errorPopUp.showErrorModal(
        error.message || "An unexpected error occurred."
      );
    }
  }

  async function addProductToInventory(category_id, productData) {
    try {
      const requestInfo = {
        url: urlObject.addProduct + category_id,
        method: fetchHandler.methods.post,
        data: productData,
      };

      const data = await fetchHandler.sendRequest(requestInfo);
      if (data && data.message) {
        successPopUp.showSuccessModal(data.message);
      } else {
        errorPopUp.showErrorModal("Unexpected server response.");
      }
    } catch (error) {
      errorPopUp.showErrorModal(
        error.message || "An unexpected error occurred."
      );
    }
  }

  async function deleteProduct(category_id, product_id) {
    try {
      const requestInfo = {
        url: urlObject.deleteProduct + category_id + "/" + product_id,
        method: "DELETE",
      };

      const result = await fetchHandler.sendRequest(requestInfo);
      if (result && result.message) {
        successPopUp.showSuccessModal(result.message);
      } else {
        errorPopUp.showErrorModal("Unexpected server response.");
      }
    } catch (error) {
      errorPopUp.showErrorModal(
        error.message || "An unexpected error occurred."
      );
    }
  }

  async function restockProduct(category_id, product_id) {
    try {
      const requestInfo = {
        url: urlObject.restockProduct + category_id + "/" + product_id,
        method: fetchHandler.methods.patch,
      };

      const result = await fetchHandler.sendRequest(requestInfo);
      if (result && result.message) {
        successPopUp.showSuccessModal(result.message);
      } else {
        errorPopUp.showErrorModal("Unexpected server response.");
      }
    } catch (error) {
      errorPopUp.showErrorModal(
        error.message || "An unexpected error occurred."
      );
    }
  }

  async function updateProductData(category_id, product_id, updatedData) {
    try {
      const requestInfo = {
        url: urlObject.updateProduct + category_id + "/" + product_id,
        method: fetchHandler.methods.put,
        data: updatedData,
      };

      const data = await fetchHandler.sendRequest(requestInfo);
      if (data && data.message) {
        successPopUp.showSuccessModal(data.message);
      } else {
        errorPopUp.showErrorModal("Unexpected server response.");
      }
    } catch (error) {
      errorPopUp.showErrorModal(
        error.message || "An unexpected error occurred."
      );
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  function renderInventory(data) {
    inventoryContainer.innerHTML = ""; // Clear the container

    const table = document.createElement("table");
    table.id = "dataTable";

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
      <th>Category</th>
      <th>Product ID</th>
      <th>Product Name</th>
      <th>Price</th>
      <th>Total Sold <br>(com/in-p/shi)</th>
      <th>Stock</th>
      <th>Stock Status</th>
      <th>Date Added</th>
      <th>Color</th>
    `;
    table.appendChild(headerRow);

    data.forEach((category) => {
      category.products.forEach((product) => {
        const productRow = document.createElement("tr");
        productRow.innerHTML = `
          <td>${category.categoryName}</td>
          <td>${product.productID}</td>
          <td>${product.productName}</td>
          <td>$${product.unitPrice}</td>
          <td>${product.stockInfo.totalSold}</td>
          <td>${product.stockInfo.currentQuantity}</td>
          <td>${product.stockInfo.stockStatus}</td>
          <td>${product.dateAdded}</td>
          <td>${product.color}</td>
        `;

        productRow.addEventListener("click", () => {
          openProductModal(category.categoryID, product);
        });

        table.appendChild(productRow);
      });
    });

    inventoryContainer.appendChild(table);
  }

  function openProductModal(categoryID, product) {
    const formattedDateAdded = formatDate(product.dateAdded);
    const productImage = `../../shirtImg/${product.imageUrl}`;

    modalContent.innerHTML = `
      <h2 class="entity-name">${product.productName}</h2>
      <div class="image-container" id="inventory-image-container">
          <img src="${productImage}"/>
      </div>
      <form id="edit-product-form">

        <label for="productId">Product ID:</label>
        <input type="text" id="productId" name="productId" value="${product.productID}" readonly>

        <label for="productName">Product Name:</label>
        <input type="text" id="productName" name="productName" value="${product.productName}" required>

        <label for="description">Description:</label>
        <textarea id="description" name="description" required>${product.productDescription}</textarea>

        <div class="multiple-input-fields">
          <div>
            <label for="price">Price:</label>
            <input type="number" id="price" step="0.01" name="price" value="${product.unitPrice}" required>
          </div>
          <div>
            <label for="sold">Total Sold:</label>
            <input type="number" id="sold" name="sold" value="${product.stockInfo.totalSold}" readonly>
          </div>
        </div>

        <div class="multiple-input-fields">
          <div>
            <label for="stockQuantity">Stock Quantity:</label>
            <input type="text" id="stockQuantity" name="stockQuantity" value="${product.stockInfo.currentQuantity}" readonly>
          </div>
          <div>
            <button type="button" id="restock-product-btn">Restock Product</button>
          </div>
        </div>

        <div class="multiple-input-fields">
          <div>
            <label for="restockQuantity">Restock Quantity:</label>
            <input type="number" id="restockQuantity" name="restockQuantity" value="${product.stockInfo.restockQuantity}" required>
          </div>
          <div>
            <label for="restockThreshold">Restock Threshold:</label>
            <input type="number" id="restockThreshold" name="restockThreshold" value="${product.stockInfo.restockThreshold}" required>
          </div>
        </div>

        <label for="color">Color:</label>
        <input type="text" id="color" name="color" value="${product.color}" required>

        <label for="date">Date Created:</label>
        <input type="text" id="date" name="date" value="${formattedDateAdded}" readonly>

        <div class="multiple-input-fields">
          <div>
            <button type="submit" id="save-changes-btn">Save Changes</button>
          </div>
          <div>
            <button type="button" id="delete-btn">Delete Product</button>
          </div>
        </div>

      </form>
    `;

    modal.style.display = "block";
    modalOverlay.style.display = "block";

    document.querySelector(".entity-name").focus();
    document.getElementById("productName");

    const editProductForm = document.getElementById("edit-product-form");

    // Define the form submission handler
    const formSubmitHandler = async (event) => {
      event.preventDefault();

      const formData = new FormData(event.target);
      const updatedProductData = {};

      // Parse and compare form data
      const formProductName = formData.get("productName");
      if (formProductName !== product.productName) {
        updatedProductData.productName = formProductName;
      }

      const formDescription = formData.get("description");
      if (formDescription !== product.productDescription) {
        updatedProductData.productDescription = formDescription;
      }

      const formPrice = parseFloat(formData.get("price"));
      if (formPrice !== product.unitPrice) {
        updatedProductData.unitPrice = formPrice;
      }

      const formRestockQuantity = parseInt(formData.get("restockQuantity"));
      if (formRestockQuantity !== product.stockInfo.restockQuantity) {
        updatedProductData.restockQuantity = formRestockQuantity;
      }

      const formRestockThreshold = parseInt(formData.get("restockThreshold"));
      if (formRestockThreshold !== product.stockInfo.restockThreshold) {
        updatedProductData.restockThreshold = formRestockThreshold;
      }

      const formColor = formData.get("color");
      if (formColor !== product.color) {
        updatedProductData.color = formColor;
      }

      // Only send updated fields
      if (Object.keys(updatedProductData).length > 0) {
        confirmPopUp.showConfirmModal("Commit the changes?", async () => {
          await updateProductData(
            categoryID,
            product.productID,
            updatedProductData
          );
          closeModal();
          await getAdminInventory(); // Refresh the inventory
          searchInput.value = "";
        });
      } else {
        closeModal();
      }
    };

    // Attach event listener to the form
    editProductForm.addEventListener("submit", formSubmitHandler);

    // Restock button handler
    const restockButton = document.getElementById("restock-product-btn");
    const restockHandler = async (event) => {
      event.preventDefault();
      confirmPopUp.showConfirmModal(
        "Are you sure you want to restock this product?",
        async () => {
          try {
            await restockProduct(categoryID, product.productID);
            closeModal();
            await getAdminInventory();
            searchInput.value = "";
          } catch (error) {
            errorPopUp.showErrorModal(
              error.message || "An unexpected error occurred."
            );
            closeModal();
          }
        }
      );
    };
    restockButton.addEventListener("click", restockHandler);

    // Delete button handler
    const deleteButton = document.getElementById("delete-btn");
    const deleteHandler = (event) => {
      event.preventDefault();
      confirmPopUp.showConfirmModal(
        "Are you sure you want to delete this product?",
        async () => {
          try {
            await deleteProduct(categoryID, product.productID);
            closeModal();
            await getAdminInventory();
            searchInput.value = "";
          } catch (error) {
            errorPopUp.showErrorModal(
              error.message || "An unexpected error occurred."
            );
          }
        }
      );
    };
    deleteButton.addEventListener("click", deleteHandler);
  }

  // Close modal function
  function closeModal() {
    modalContent.innerHTML = "";
    modal.style.display = "none";
    modalOverlay.style.display = "none";
  }

  closeModalBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);

  // Open Add new product modal
  addProductBtn.addEventListener("click", () => {
    addProductModal.style.display = "block";
    addProductModalOverlay.style.display = "block";
  });

  // Close Add Product modal
  function closeAddProductModal() {
    addProductModal.style.display = "none";
    addProductModalOverlay.style.display = "none";
    inventoryForm.reset(); // Reset the form fields
  }

  closeAddProductModalBtn.addEventListener("click", closeAddProductModal);
  addProductModalOverlay.addEventListener("click", closeAddProductModal);

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  // Form submission logic for adding new product
  inventoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    // Get data from form
    const formData = new FormData(inventoryForm);
    const categoryName = formData.get("categoryName");
    const productName = formData.get("productName");
    const productDescription = formData.get("productDescription");

    // Parse and validate numeric inputs
    const unitPrice = parseFloat(formData.get("unitPrice"));
    const stockQuantity = parseInt(formData.get("stockQuantity"));
    const restockThreshold = parseInt(formData.get("restockThreshold"));
    const restockQuantity = parseInt(formData.get("restockQuantity"));

    if (
      isNaN(unitPrice) ||
      isNaN(stockQuantity) ||
      isNaN(restockThreshold) ||
      isNaN(restockQuantity)
    ) {
      errorPopUp.showErrorModal(
        "Please enter valid numbers for price and stock quantities."
      );
      return;
    }

    // Process the image
    const imageFile = formData.get("imageUrl");

    if (imageFile && imageFile.name) {
      const extension = imageFile.name.split(".").pop().toLowerCase();
      const allowedExtensions = ["jpg", "jpeg", "png"];
      if (!allowedExtensions.includes(extension)) {
        errorPopUp.showErrorModal("Invalid image file extension: " + extension);
        return;
      }
    } else {
      errorPopUp.showErrorModal("No file selected or file has no name.");
      return;
    }

    // Upload the image file to the image upload endpoint in the backend
    const imageUploadForm = new FormData();
    imageUploadForm.append("image", imageFile);

    let imageUrl = "";

    try {
      const imageResponse = await fetch(urlObject.imageUpload, {
        method: "POST",
        body: imageUploadForm,
      });

      const imageResult = await imageResponse.json();
      imageUrl = imageResult.data;
    } catch (error) {
      errorPopUp.showErrorModal(
        error.message || "An unexpected error occurred."
      );
      return;
    }

    // Other fields
    const color = formData.get("color");
    const dateAdded = new Date().toISOString();

    const productData = {
      categoryName: categoryName,
      product: {
        productName: productName,
        productDescription: productDescription,
        unitPrice: unitPrice,
        stockInfo: {
          currentQuantity: stockQuantity,
          totalSold: 0,
          restockThreshold: restockThreshold,
          lastRestock: dateAdded,
          restockQuantity: restockQuantity,
          stockStatus: stockQuantity > 0 ? "In Stock" : "Out of Stock",
        },
        imageUrl: imageUrl,
        dateAdded: dateAdded,
        color: color,
      },
    };

    // Find the Category ID for the selected category
    const categoryData = inventoryData.find(
      (data) => data.categoryName === categoryName
    );
    if (!categoryData) {
      errorPopUp.showErrorModal("Category not found: " + categoryName);
      return;
    }
    const category_id = categoryData.categoryID;

    confirmPopUp.showConfirmModal(
      "Add this product to the inventory?",
      async () => {
        await addProductToInventory(category_id, productData);
        closeAddProductModal();
        getAdminInventory();
        searchInput.value = "";
      }
    );
  });
})();
