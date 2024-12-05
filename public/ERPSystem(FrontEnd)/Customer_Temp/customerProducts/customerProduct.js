import { fetchHandler } from "../../helper/fetchHandler.js";
import { urlObject } from "../../helper/urls.js";

let inventoryData;
getAdminInventory()


async function getAdminInventory() {
    try {
      const requestInfo = {
        url: urlObject.getInventory,
        method: fetchHandler.methods.get,
      };

      const data = await fetchHandler.sendRequest(requestInfo);
      inventoryData = data.data; // Store inventory data
      console.log("first function");
      displayProducts(inventoryData);
    } catch (error) {
      console.error("Error fetching inventory:", error.message);
    }
  }

  
function displayProducts(productData) {
  const productList = document.querySelector(".container");
  productList.innerHTML = ""; // Clear the container

  if (!productData || productData.length === 0) {
    productList.innerHTML =
      "<p>No products available. Please try again later.</p>";
    return;
  }

  // Create product cards for each product
  productData.forEach((category) => {
    category.products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("col-md-3", "product-card");
      productCard.innerHTML = `
        <img src="../../img/${product.imageUrl}" alt="${product.productName}">
        <h3>${product.productName}</h3>
        <p>$${product.unitPrice}</p>
        <button class="btn btn-primary add-to-cart" 
          data-id="${product.productID}" 
          data-name="${product.productName}" 
          data-price="${product.unitPrice}" 
          data-image="${product.imageUrl}" 
          data-description="${product.productDescription}">
          Add to Cart
        </button>
      `;
      productList.appendChild(productCard);
    });
  });

  // Attach event listeners for "Add to Cart" buttons
  attachCartListeners();
}

// Function to handle adding products to the cart
function addToCart(productID, productName, productPrice, productImage, productDescription) {
  // Get existing cart or initialize an empty array
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if the product already exists in the cart
  const existingProduct = cart.find((item) => item.name === productName);

  if (existingProduct) {

    existingProduct.quantity += 1;
  } else {
    // Add the new product with initial quantity and total price
    const product = {
      id: productID,
      name: productName,
      price: productPrice, // Price of a single unit
      image: productImage,
      description: productDescription || "No description available",
      quantity: 1,
      totalPrice: productPrice, // Initial total price
    };
    cart.push(product);
  }

  // Save updated cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  alert(`Added ${productName} to cart. Quantity: ${existingProduct ? existingProduct.quantity : 1}`);
}

function attachCartListeners() {
  const productList = document.querySelector(".container");

  productList.addEventListener("click", (event) => {
    if (event.target.classList.contains("add-to-cart")) {
      const button = event.target;
      const productID = button.getAttribute("data-id");
      const productName = button.getAttribute("data-name");
      const productPrice = parseFloat(button.getAttribute("data-price"));
      const productImage = button.getAttribute("data-image");
      const productDescription = button.getAttribute("data-description"); // Extract description

      addToCart(productID, productName, productPrice, productImage, productDescription);
    }
  });
}
  
