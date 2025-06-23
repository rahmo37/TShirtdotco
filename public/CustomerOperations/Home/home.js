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

// Init function
async function init() {
  const productContainer = document.querySelector(".pro-container");
  const filterForm = document.getElementById("filterForm");
  const viewCollection = document.getElementById("view-collection");
  const trackOrder = document.getElementById("track-order");
  const getHelp = document.getElementById("get-help");

  const productSelectionArray =
    sessionObject.getData("customerProductSelectionArray") || [];

  if (viewCollection) {
    viewCollection.addEventListener("click", () => {
      window.location.href = "../Collection/collection.html";
    });
  }

  if (trackOrder) {
    trackOrder.addEventListener("click", () => {
      window.location.href =
        "../../CustomerOperations/ViewOrders/viewOrders.html";
    });
  }

  if (getHelp) {
    getHelp.addEventListener("click", () => {
      window.location.href = "../../CustomerOperations/FAQ/faq.html";
    });
  }

  productContainer.innerHTML = "";

  // Product Data
  let productData = await getAllProducts();

  if (!productData || productData.length === 0) {
    errorPopUp.showErrorModal("Failed to load products.");
    return;
  }

  sessionObject.setData("allProducts", productData);

  const homeLink = document.getElementById("home-link");
  if (homeLink && homeLink.classList.contains("active")) {
    productData = productData
      .sort((a, b) => {
        return b.stockInfo.totalSold - a.stockInfo.totalSold;
      })
      .slice(0, 10);
  }

  productData.forEach((product) => {
    const alreadySelectedProductIndex = productSelectionArray.findIndex(
      (eachProduct) => {
        return eachProduct.productID === product.productID;
      }
    );
    const eachProductHtml = generateProductsHtml(
      product,
      alreadySelectedProductIndex
    );
    productContainer.appendChild(eachProductHtml);

    eachProductHtml.addEventListener("click", (e) => {
      if (!e.target.closest(".cart")) {
        // Handle product click
        sessionObject.setData("clickedProduct", product);
        window.location.href = "../ViewProducts/viewProduct.html";
      } else {
        const cartBtn = e.target.closest(".cart");
        const alreadySelectedProductIndex = productSelectionArray.findIndex(
          (eachProduct) => {
            return eachProduct.productID === product.productID;
          }
        );

        if (alreadySelectedProductIndex !== -1) {
          confirmPopUp.showConfirmModal(
            "Do you want to remove this product from the cart?",
            () => {
              productSelectionArray.splice(alreadySelectedProductIndex, 1);
              sessionObject.setData(
                "customerProductSelectionArray",
                productSelectionArray
              );

              // Reset the button
              cartBtn.classList.remove("fa-check");
              cartBtn.classList.add("fa-cart-shopping");
              cartBtn.style.backgroundColor = "#dde2ff";
              cartBtn.style.color = "#334df7";

              // Show Success Modal
              successPopUp.showSuccessModal("Product removed from the cart");
            }
          );
        } else {
          // Add the product to the cart
          productSelectionArray.push({
            productID: product.productID,
            product,
            subtotal: product.unitPrice,
            quantity: 1,
            size: "Medium",
          });
          sessionObject.setData(
            "customerProductSelectionArray",
            productSelectionArray
          );

          // Change the button
          cartBtn.classList.remove("fa-cart-shopping");
          cartBtn.classList.add("fa-check");
          cartBtn.style.backgroundColor = "#67cd00fc";
          cartBtn.style.color = "#fff";

          // Show Success Modal
          successPopUp.showSuccessModal("Product added to the cart");
        }
      }
    });
  });

  if (filterForm) {
    filterForm.addEventListener("change", (e) => {
      if (e.target.type === "radio") {
        // Get the selected category name
        const categoryName = e.target.closest("label").textContent.trim();

        // Select all product elements
        const productCollection = productContainer.querySelectorAll(".pro");

        productCollection.forEach((product) => {
          // Use data attributes for category
          const productCategory = product.dataset.category;
          if (categoryName === "All" || productCategory === categoryName) {
            product.style.display = "block";
          } else {
            product.style.display = "none";
          }
        });
      }
    });
  }

  if (sessionObject.getData("initLoad")) {
    infoPopUp.showInfoModal(
      `Visiting as ${sessionObject.getData("customer").customerBio.firstName}
        ${sessionObject.getData("customer").customerBio.lastName}`
    );
    sessionObject.setData("initLoad", false);
  }
}

function generateProductsHtml(product, selectedIndex) {
  // Check if necessary properties exist
  if (
    !product.imageUrl ||
    !product.categoryName ||
    !product.productName ||
    !product.unitPrice
  ) {
    console.error("Product data is incomplete:", product);
    return document.createElement("div"); // Return an empty element
  }

  const productHtml = `<img src="../../shirtImg/${product.imageUrl}" alt="">
          <div class="des">
            <span>${product.categoryName}</span>
            <h5>${product.productName}</h5>
            <div class="star">
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
            </div>
            <h4 class="unit-price">$${product.unitPrice}</h4>
          </div>
          <a>
          ${
            selectedIndex === -1
              ? '<i class="fa-solid fa-cart-shopping cart"></i>'
              : '<i class="fa-solid fa-check cart" style="background-color:#67cd00fc; color:#fff;"></i>'
          }   
        </a>`;

  const eachProductContainer = document.createElement("div");
  eachProductContainer.classList.add("pro");
  eachProductContainer.dataset.category = product.categoryName;
  eachProductContainer.innerHTML = productHtml;
  return eachProductContainer;
}

async function getAllProducts() {
  const requestInfo = {
    url: urlObject.getInventory,
    method: fetchHandler.methods.get,
  };

  try {
    const data = await fetchHandler.sendRequest(requestInfo);
    const inventoryData = data.data;
    const flattenedProductsData = flattenProducts(inventoryData);
    return flattenedProductsData;
  } catch (error) {
    console.error("Error fetching products:", error);
    errorPopUp.showErrorModal("Failed to load products.");
    return [];
  }
}

function flattenProducts(data) {
  const flattenedProducts = [];

  data.forEach((category) => {
    const { categoryID, categoryName, products } = category;
    products.forEach((product) => {
      flattenedProducts.push({
        ...product,
        categoryID,
        categoryName: formatCategoryName(categoryName),
      });
    });
  });

  return flattenedProducts;
}

function formatCategoryName(categoryName) {
  return categoryName
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/ T Shirts$/i, " T Shirt")
    .replace(/ T Shirt$/, " T Shirt");
}
