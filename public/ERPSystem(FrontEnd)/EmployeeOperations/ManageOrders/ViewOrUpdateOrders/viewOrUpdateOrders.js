// In this module, we can view and update the order
import { sessionObject } from "../../../helper/sessionStorage.js";
import { applyFadeEffect } from "../../../helper/applyFadeEffect.js";
import { loader } from "../../../helper/loadPageDynamically.js";
import { errorPopUp } from "../../../helper/errorPopUpHandler.js";
import { successPopUp } from "../../../helper/successPopupHandler.js";
import { confirmPopUp } from "../../../helper/confirmPopUpHandler.js";
import { infoPopUp } from "../../../helper/informationPopUpHandler.js";

const order = sessionObject.getData("viewOrder");
const mainContentArea = document.getElementById("outer-main-container");
const orderContainerOuter = document.querySelector(".order-container-outer");

// Check if order data exists
if (!order) {
  console.error("Order data not found.");
  infoPopUp.showInfoModal(
    "Order data could not be processed at this time, Please try again later",
    () => {
      loadPageWithFade({
        htmlUrl: "../ManageOrders/DisplayOrders/displayOrders.html",
        cssUrl: "../employee_functions.css",
        jsUrl: "../ManageOrders/DisplayOrders/displayOrders.js",
      });
    }
  );
} else {
  setOrderStructure();
}

function setOrderStructure() {
  // Append the generated container and get a reference to it
  const orderContainerInner = generateOrderContainer();
  const containerDiv = appendGeneratedContainer(
    orderContainerOuter,
    orderContainerInner
  );

  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      sessionObject.removeData("viewOrder");
      loadPageWithFade({
        htmlUrl: "../ManageOrders/DisplayOrders/displayOrders.html",
        cssUrl: "../employee_functions.css",
        jsUrl: "../ManageOrders/DisplayOrders/displayOrders.js",
      });
    });
  }

  const statusInput = document.querySelector(".order-status-alt");
  if (statusInput) {
    statusInput.style.backgroundColor =
      order.orderStatus.toLowerCase() === "completed" ? "#d6ffcc" : "#ffcccc";
  }

  const updateBtn = document.getElementById("updateBtn");
  const orderStatusInput = document.getElementById("orderStatus");
  if (updateBtn && orderStatusInput) {
    orderStatusInput.addEventListener("input", () => {
      if (
        orderStatusInput.value.toLowerCase() !== order.orderStatus.toLowerCase()
      ) {
        updateBtn.style.opacity = 1;
        updateBtn.style.visibility = "visible";
        updateBtn.disabled = false;
      } else {
        updateBtn.style.opacity = 0;
        updateBtn.style.visibility = "hidden";
        updateBtn.disabled = true;
      }
    });

    updateBtn.addEventListener("click", () => {
      // TODO
      console.log("Hi");
    });
  }

  const addDiscountBtn = document.getElementById("addDiscountBtn");
  const addDiscountInput = document.getElementById("addDiscount");
  if (addDiscountBtn && addDiscountInput) {
    addDiscountInput.addEventListener("input", () => {
      const discountValue = parseFloat(addDiscountInput.value);

      if (!isNaN(discountValue) && discountValue > 0 && discountValue <= 100) {
        addDiscountBtn.style.opacity = 1;
        addDiscountBtn.style.visibility = "visible";
        addDiscountBtn.disabled = false;
      } else {
        addDiscountBtn.style.opacity = 0;
        addDiscountBtn.style.visibility = "hidden";
        addDiscountBtn.disabled = true;
      }
    });
  }

  const customerIdInput = document.getElementById("customerId");
  if (customerIdInput) {
    customerIdInput.style.cursor = "pointer";
    customerIdInput.addEventListener("click", () => {
      // TODO
      console.log("Hello");
    });
  }

  const placedByInput = document.getElementById("placedBy");
  if (placedByInput) {
    placedByInput.style.cursor = "pointer";
    placedByInput.addEventListener("click", () => {
      // TODO
      console.log("Hi");
    });
  }

  // Function to populate the Swiper carousel
  const swiperWrapper = containerDiv.querySelector(
    `.swiper-wrapper.products-swiper-wrapper`
  );

  for (const product of order.items) {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    let discontinuedImageHtml = "";
    if (product.currentAvailabilityStatus === "Unavailable") {
      discontinuedImageHtml = `
        <!-- Image for "Discontinued" -->
        <div class="discontinued-image">
          <img src="../../img/Discontinued.png">
        </div>
      `;
    }

    const deleteBtn =
      order.orderStatus.toLowerCase() === "completed" ||
      order.orderStatus.toLowerCase() === "cancelled"
        ? ""
        : `
          <div class="card-footer">
            <button type="button" class="order-buttons my-3" id="delete-product-btn">Remove From Order</button>
          </div>
        `;

    slide.innerHTML = `
      <div class="card position-relative">
        <img src="../../../shirtImg/${product.imageUrl}" class="card-img-top" alt="${product.productName}" 
        onerror="this.onerror=null;this.src='../../../shirtImg/no-photo.png';">
        ${discontinuedImageHtml}
        <div class="card-body">
          <h4 class="card-title">${product.productName}</h4>
          <p class="card-text">Bought Quantity: ${product.quantity}</p>
          <p class="card-text">Unit Price: ${product.unitPrice}</p>
          <p class="card-text">Sub Total: ${product.subtotal}</p>
        </div>
        ${deleteBtn}
      </div>
    `;
    // Append each slide to swiperWrapper
    swiperWrapper.appendChild(slide);
  }

  const navigationSelectors = {
    pagination: `.swiper-pagination.products-pagination`,
    nextEl: `.custom-swiper-button-next.products-next`,
    prevEl: `.custom-swiper-button-prev.products-prev`,
  };

  // Generate Swiper and store the instance
  const orderItemsSwiper = initializeProductCarousel(
    `.products-container`,
    navigationSelectors
  );
}

function generateOrderContainer() {
  const percentField =
    order.orderStatus.toLowerCase() === "completed" ||
    order.orderStatus.toLowerCase() === "cancelled"
      ? ""
      : `
            <div class="d-flex w-100 align-items-center">
              <div style="width: 25%;"></div> <!-- 25% gap on the left -->
              <label for="addDiscount" style="width: 50%; text-align: center;">Add Discount</label>
              <div style="width: 5%;"></div> <!-- 5% gap on the right -->
            </div>
            <div class="d-flex w-100 align-items-center">
              <div style="width: 25%;"></div> <!-- 25% gap on the left -->
              <input type="number" id="addDiscount" name="addDiscount" class="form-control" style="width: 50%;" placeholder="Type percent amount" min="0" max="100" required>
              <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              <div style="width: 20%;">
                <button style="width: 90%;" class="order-buttons" id="addDiscountBtn">Apply</button>
              </div>
            </div>
        `;

  const cancelBtn =
    order.orderStatus.toLowerCase() === "completed" ||
    order.orderStatus.toLowerCase() === "cancelled"
      ? ""
      : `<div class="d-flex w-100 align-items-center">
            <div style="width: 42%;"></div> <!-- 40% gap on the left -->
            <button class="my-5 order-buttons" style="width: 16%; text-align: center;" id="cancel-order-btn">Cancel This Order</button>
            <div style="width: 42%;"></div> <!-- 40% gap on the right -->
          </div>`;
  return `
    <div class="row d-flex justify-content-center align-items-center text-align-center inner-container">
      <button id="backBtn" class="order-buttons">Back</button>
      <div class="col-md-12 text-center header">
        <h2 class="my-5">${order.orderID}</h2>
      </div>
      <!-- Carousel Column -->
      <div class="col-md-12 d-flex flex-column justify-content-center align-items-center text-align-center">
        <!-- Swiper -->
        <h2 class="mb-3">Product(s) in this order</h2>
        <div class="swiper-container products-container">
          <div class="swiper-wrapper products-swiper-wrapper">
            <!-- Slides will be dynamically added here -->
          </div>
          <!-- Add Pagination -->
          <div class="swiper-pagination products-pagination"></div>
          <!-- Add Navigation -->
          <div class="custom-swiper-button-prev products-prev">
            <i class="lni lni-chevron-left"></i>
          </div>
          <div class="custom-swiper-button-next products-next">
            <i class="lni lni-chevron-right"></i>
          </div>
        </div>
      </div>
      <!-- Main Order Information Section -->
      <div class="container mb-5">
        <h2 class="text-center mb-5">Order Information</h2>
        
        <div class="row g-3">
          <!-- Entity Information Section -->
          <div class="col-md-4">
            <div class="d-flex flex-column align-items-start">
              <h4 class="text-center w-100">Entity Information</h4>

              <!-- CUSTOMER ID -->
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <label for="customerId" style="width: 50%; text-align: center;">CustomerID</label>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <input type="text" id="customerId" name="customerId" value="${
                  order.customerID
                }" required class="form-control" style="width: 50%;" readonly>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>

              <!-- PLACED BY -->
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <label for="placedBy" style="width: 50%; text-align: center;">Placed By</label>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <input type="text" id="placedBy" name="placedBy" value="${
                  order.placedBy
                }" required class="form-control" style="width: 50%;" readonly>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>
            </div>
          </div>

          <!-- Monetary Information Section -->
          <div class="col-md-4">
            <div class="d-flex flex-column align-items-start">
              <h4 class="text-center w-100">Monetary Information</h4>

              <!-- TOTAL PRICE -->
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <label for="totalPrice" style="width: 50%; text-align: center;">Total Price</label>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <input type="text" id="totalPrice" name="totalPrice" value="$ ${
                  order.totalPrice
                }" required class="form-control" style="width: 50%;" readonly>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>

              <!-- TOTAL TAX -->
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <label for="tax" style="width: 50%; text-align: center;">Tax Amount</label>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <input type="text" id="tax" name="tax" value="$ ${
                  order.tax
                }" required class="form-control" style="width: 50%;" readonly>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>

              <!-- GRAND TOTAL -->
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <label for="grandTotal" style="width: 50%; text-align: center;">Grand Total</label>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <input type="text" id="grandTotal" name="grandTotal" value="$ ${
                  order.grandTotal
                }" required class="form-control" style="width: 50%;" readonly>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>
              ${percentField}
            </div>
          </div>

          <!-- Order Summary Section -->
          <div class="col-md-4">
            <div class="d-flex flex-column align-items-start">
              <h4 class="text-center w-100">Order Summary</h4>

              <!-- ORDER STATUS -->
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <label for="orderStatus" style="width: 50%; text-align: center;">Order Status</label>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                ${
                  order.orderStatus.toLowerCase() === "cancelled" ||
                  order.orderStatus.toLowerCase() === "completed"
                    ? `<input type="text" id="orderStatus" name="orderStatus" value="${order.orderStatus.toUpperCase()}" required class="form-control order-status-alt" style="width: 50%;" readonly>`
                    : `
                    <select id="orderStatus" name="orderStatus" class="form-control" style="width: 50%;" required>
                      <option value="Processing" ${
                        order.orderStatus.toLowerCase() === "processing"
                          ? "selected"
                          : ""
                      }>Processing</option>
                      <option value="Shipped" ${
                        order.orderStatus.toLowerCase() === "shipped"
                          ? "selected"
                          : ""
                      }>Shipped</option>
                      <option value="Completed" ${
                        order.orderStatus.toLowerCase() === "completed"
                          ? "selected"
                          : ""
                      }>Completed</option>
                    </select>
                    <div style="width: 5%;"></div> <!-- 5% gap on the right -->
                    <div style="width: 20%;">
                      <button style="width: 90%;" class="order-buttons" id="updateBtn">Update</button>
                    </div>
                    `
                }
              </div>

              <!-- ORDER DATE -->
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <label for="orderDate" style="width: 50%; text-align: center;">Order Date</label>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <input type="text" id="orderDate" name="orderDate" value="${formatDate(
                  order.orderDate
                )}" required class="form-control" style="width: 50%;" readonly>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>

              <!-- PRODUCT COUNT -->
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <label for="ProductCount" style="width: 50%; text-align: center;">Product Count</label>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>
              <div class="d-flex w-100 align-items-center">
                <div style="width: 25%;"></div> <!-- 25% gap on the left -->
                <input type="text" id="ProductCount" name="ProductCount" value="${
                  order.items.length
                }" required class="form-control" style="width: 50%;" readonly>
                <div style="width: 5%;"></div> <!-- 5% gap on the right -->
              </div>
            </div>
          </div>
        </div>

        <!-- Cancel Button -->
        ${cancelBtn}
      </div>
    </div>
  `;
}

function appendGeneratedContainer(outerContainer, containerHTML) {
  const containerDiv = document.createElement("div");
  containerDiv.innerHTML = containerHTML;
  outerContainer.appendChild(containerDiv);
  return containerDiv;
}

// Function to load page with fade effects
function loadPageWithFade({ htmlUrl, cssUrl, jsUrl }) {
  try {
    applyFadeEffect(() => {
      loader.removeJs();
      loader.removeCss();
      loader.loadPageContent({
        htmlUrl,
        cssUrl,
        jsUrl,
        targetElement: mainContentArea,
      });
    }, mainContentArea);
  } catch (error) {
    console.error("Error loading page:", error);
  }
}

function initializeProductCarousel(slideContainer, navigationSelectors) {
  const swiperContainer = document.querySelector(slideContainer);
  const slides = swiperContainer.querySelectorAll(".swiper-slide");
  const swiper = new Swiper(slideContainer, {
    slidesPerView: slides.length === 1 ? 1 : 3,
    slidesPerGroup: 1,
    spaceBetween: 20,
    loop: false,
    centeredSlides: slides.length === 1, // Center if only one slide
    pagination: {
      el: navigationSelectors.pagination,
      clickable: true,
    },
    navigation: {
      nextEl: navigationSelectors.nextEl,
      prevEl: navigationSelectors.prevEl,
    },
    breakpoints: {
      1200: {
        slidesPerView: 3,
        slidesPerGroup: 2,
      },
      992: {
        slidesPerView: 2,
        slidesPerGroup: 2,
      },
      768: {
        slidesPerView: 1,
        slidesPerGroup: 1,
      },
      576: {
        slidesPerView: 1,
        slidesPerGroup: 1,
      },
    },
  });

  return swiper;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
