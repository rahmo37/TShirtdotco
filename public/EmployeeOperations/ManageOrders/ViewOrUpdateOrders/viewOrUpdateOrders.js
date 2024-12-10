// In this module, we can view and update the order
import { sessionObject } from "../../../helper/sessionStorage.js";
import { applyFadeEffect } from "../../../helper/applyFadeEffect.js";
import { loader } from "../../../helper/loadPageDynamically.js";
import { errorPopUp } from "../../../helper/errorPopUpHandler.js";
import { successPopUp } from "../../../helper/successPopupHandler.js";
import { confirmPopUp } from "../../../helper/confirmPopUpHandler.js";
import { infoPopUp } from "../../../helper/informationPopUpHandler.js";
import { urlObject } from "../../../helper/urls.js";
import { fetchHandler } from "../../../helper/fetchHandler.js";

let order = sessionObject.getData("viewOrder");
const mainContentArea = document.getElementById("outer-main-container");
const orderContainerOuter = document.querySelector(".order-container-outer");
const modalContent = document.getElementById("modal-content-entity");
const modal = document.getElementById("entity-modal");
const modalOverlay = document.getElementById("custom-modal-overlay");
const closeModalBtn = document.getElementById("close-entity-modal");

let orderItemsSwiper; // Declare swiper instance outside the function

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
  try {
    // Clear previous content
    orderContainerOuter.innerHTML = "";

    // Append the generated container and get a reference to it
    const orderContainerInner = generateOrderContainer();
    const containerDiv = appendGeneratedContainer(
      orderContainerOuter,
      orderContainerInner
    );

    // Re-select elements after re-rendering
    const backBtn = document.getElementById("backBtn");
    const statusInput = document.querySelector(".order-status-alt");
    const updateBtn = document.getElementById("updateBtn");
    const orderStatusInput = document.getElementById("orderStatus");
    const addDiscountBtn = document.getElementById("addDiscountBtn");
    const addDiscountInput = document.getElementById("addDiscount");
    const customerIdInput = document.getElementById("customerId");
    const placedByInput = document.getElementById("placedBy");
    const cancelBtn = document.getElementById("cancel-order-btn");

    closeModalBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", closeModal);

    // Attach event listeners
    if (backBtn) {
      backBtn.addEventListener("click", handleBackButtonClick);
    }

    if (statusInput) {
      statusInput.style.backgroundColor =
        order.orderStatus.toLowerCase() === "completed" ? "#d6ffcc" : "#ffcccc";
    }

    if (updateBtn && orderStatusInput) {
      orderStatusInput.addEventListener("input", handleOrderStatusInput);
      updateBtn.addEventListener("click", handleUpdateButtonClick);
    }

    if (addDiscountBtn && addDiscountInput) {
      addDiscountInput.addEventListener("input", handleAddDiscountInput);
      addDiscountBtn.addEventListener("click", handleAddDiscountClick);
    }

    if (customerIdInput) {
      customerIdInput.style.cursor = "pointer";
      customerIdInput.addEventListener("click", handleCustomerIdClick);
    }

    if (placedByInput) {
      const placedByValue = placedByInput.value;
      if (placedByValue !== "customer") {
        placedByInput.style.cursor = "pointer";
        placedByInput.addEventListener("click", handlePlacedByClick);
      }
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", handleCancelOrderClick);
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

      const deleteBtnId = `delete-product-btn-${product.productID}`;

      const deleteBtn =
        order.orderStatus.toLowerCase() === "completed" ||
        order.orderStatus.toLowerCase() === "cancelled"
          ? ""
          : `
            <div class="card-footer">
              <button type="button" class="order-buttons my-3 delete-product-buttons" id="${deleteBtnId}">Remove From Order</button>
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

    // Attach event listeners to delete buttons
    for (const product of order.items) {
      const deleteBtnId = `delete-product-btn-${product.productID}`;
      const deleteBtn = document.getElementById(deleteBtnId);
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          handleDeleteProduct(product.productID, product.productName);
        });
      }
    }

    // Destroy previous Swiper instance if it exists
    if (orderItemsSwiper) {
      orderItemsSwiper.destroy(true, true);
    }

    const navigationSelectors = {
      pagination: `.swiper-pagination.products-pagination`,
      nextEl: `.custom-swiper-button-next.products-next`,
      prevEl: `.custom-swiper-button-prev.products-prev`,
    };

    // Generate Swiper and store the instance
    orderItemsSwiper = initializeProductCarousel(
      `.products-container`,
      navigationSelectors
    );
  } catch (error) {
    console.error(error);
    errorPopUp.showErrorModal("Unknown error occurred, please try again later");
  }
}

// Handler functions
function handleBackButtonClick() {
  sessionObject.removeData("viewOrder");
  loadPageWithFade({
    htmlUrl: "../ManageOrders/DisplayOrders/displayOrders.html",
    cssUrl: "../employee_functions.css",
    jsUrl: "../ManageOrders/DisplayOrders/displayOrders.js",
  });
}

function handleOrderStatusInput() {
  const orderStatusInput = document.getElementById("orderStatus");
  const updateBtn = document.getElementById("updateBtn");
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
}

async function handleUpdateButtonClick() {
  const orderStatusInput = document.getElementById("orderStatus");
  const newStatus = orderStatusInput.value.toLowerCase();
  if (newStatus && newStatus !== order.orderStatus.toLowerCase()) {
    confirmPopUp.showConfirmModal(
      newStatus === "completed"
        ? `You are attempting to <span style="color: red; font-weight:bold">complete</span> this order. <br>Once completed, no other changes can be made to this order. <br>Continue?`
        : `Change the status of the order to <span style="color: red; font-weight:bold">${newStatus}</span>?`,
      async () => {
        try {
          order = await updateTheOrderStatus(newStatus);
          successPopUp.showSuccessModal("Order status updated successfully");
          // Re-render the order structure to reflect updated data
          setOrderStructure();
        } catch (error) {
          errorPopUp.showErrorModal(error.message);
        }
      }
    );
  }
}

function handleAddDiscountInput() {
  const addDiscountInput = document.getElementById("addDiscount");
  const addDiscountBtn = document.getElementById("addDiscountBtn");
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
}

function handleAddDiscountClick() {
  const addDiscountInput = document.getElementById("addDiscount");
  const discountValue = parseFloat(addDiscountInput.value);
  confirmPopUp.showConfirmModal(
    `Apply <span style="color:red; font-weight:bold">${discountValue}%</span> discount to this order?`,
    async () => {
      try {
        order = await addDiscountToTheOrder(discountValue);
        successPopUp.showSuccessModal("Discount applied successfully!");
        // Re-render the order structure to reflect updated data
        setOrderStructure();
      } catch (error) {
        errorPopUp.showErrorModal(error.message);
      }
    }
  );
}

function handleCancelOrderClick() {
  confirmPopUp.showConfirmModal(
    `Are you sure you want to <span style="color:red; font-weight:bold">cancel</span> this order? <br> Once cancelled, no other changes can be made to this order. <br>Continue?`,
    async () => {
      try {
        order = await cancelTheOrder();
        setOrderStructure();
      } catch (error) {
        errorPopUp.showErrorModal(error.message);
      }
    }
  );
}

async function handleCustomerIdClick() {
  const customerIdInput = document.getElementById("customerId");
  const customerId = customerIdInput.value;
  try {
    if (customerId) {
      const customer = await getCustomerInfo(customerId);
      viewEntityInfo(customer, null);
    } else {
      errorPopUp.showErrorModal(
        "Unable to display profile details of the customer at this time"
      );
    }
  } catch (error) {
    errorPopUp.showErrorModal(error.message);
  }
}

async function handlePlacedByClick() {
  const placedByInput = document.getElementById("placedBy");
  const employeeId = placedByInput.value;
  try {
    if (employeeId !== "customer" && employeeId.startsWith("EMP_")) {
      const employee = await getEmployeeInfo(employeeId);
      viewEntityInfo(null, employee);
    } else {
      errorPopUp.showErrorModal(
        "Unable to display profile details of the employee at this time"
      );
    }
  } catch (error) {
    errorPopUp.showErrorModal(error.message);
  }
}

function handleDeleteProduct(productID, productName) {
  confirmPopUp.showConfirmModal(
    `Remove <span style="color:red">${productName}</span> from this order?`,
    async () => {
      try {
        order = await deleteProductFromTheOrder(productID);
        successPopUp.showSuccessModal(
          "Product removed from the order successfully. Order total re-calculated and inventory re-stocked"
        );
        // Re-render the order structure to reflect updated data
        setOrderStructure();
      } catch (error) {
        errorPopUp.showErrorModal(error.message);
      }
    }
  );
}

// Function to generate the order container HTML
function generateOrderContainer() {
  const percentField =
    order.orderStatus.toLowerCase() === "completed" ||
    order.orderStatus.toLowerCase() === "cancelled"
      ? order.discountInPercentage
        ? `
        <div class="d-flex w-100 align-items-center">
          <div style="width: 25%;"></div>
          <label for="currentPercent" style="width: 50%; text-align: center;">Discount Applied</label>
          <div style="width: 5%;"></div>
        </div>
        <div class="d-flex w-100 align-items-center">
          <div style="width: 25%;"></div>
          <input type="text" id="currentPercent" name="currentPercent" value="${order.discountInPercentage}%" required class="form-control" style="width: 50%;" readonly>
          <div style="width: 5%;"></div>
        </div>`
        : ``
      : `
      <div class="d-flex w-100 align-items-center">
        <div style="width: 25%;"></div> <!-- 25% gap on the left -->
        <label for="addDiscount" style="width: 50%; text-align: center;">Add Discount</label>
        <div style="width: 5%;"></div> <!-- 5% gap on the right -->
      </div>
      <div class="d-flex w-100 align-items-center">
        <div style="width: 25%;"></div> <!-- 25% gap on the left -->
        <input 
          type="number" 
          id="addDiscount" 
          name="addDiscount" 
          class="form-control" 
          style="width: 50%;" 
          placeholder="${
            order.discountInPercentage
              ? `Current discount: ${order.discountInPercentage}%`
              : "Enter discount"
          }" 
          min="0" 
          max="100" 
          required
        >
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
                    <div style="width: 25%;"></div>
                    <label for="customerId" style="width: 50%; text-align: center;">CustomerID</label>
                    <div style="width: 5%;"></div>
                  </div>
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <input type="text" id="customerId" name="customerId" value="${
                      order.customerID
                    }" required class="form-control" style="width: 50%;" readonly>
                    <div style="width: 5%;"></div>
                  </div>

                  <!-- PLACED BY -->
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <label for="placedBy" style="width: 50%; text-align: center;">Placed By</label>
                    <div style="width: 5%;"></div>
                  </div>
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <input type="text" id="placedBy" name="placedBy" value="${
                      order.placedBy
                    }" required class="form-control" style="width: 50%;" readonly>
                    <div style="width: 5%;"></div>
                  </div>
                </div>
              </div>

              <!-- Monetary Information Section -->
              <div class="col-md-4">
                <div class="d-flex flex-column align-items-start">
                  <h4 class="text-center w-100">Monetary Information</h4>

                  <!-- TOTAL PRICE -->
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <label for="totalPrice" style="width: 50%; text-align: center;">Total Price</label>
                    <div style="width: 5%;"></div>
                  </div>
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <input type="text" id="totalPrice" name="totalPrice" value="$ ${
                      order.totalPrice
                    }" required class="form-control" style="width: 50%;" readonly>
                    <div style="width: 5%;"></div>
                  </div>

                  <!-- TOTAL TAX -->
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <label for="tax" style="width: 50%; text-align: center;">Tax Amount</label>
                    <div style="width: 5%;"></div>
                  </div>
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <input type="text" id="tax" name="tax" value="$ ${
                      order.tax
                    }" required class="form-control" style="width: 50%;" readonly>
                    <div style="width: 5%;"></div>
                  </div>

                  <!-- GRAND TOTAL -->
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <label for="grandTotal" style="width: 50%; text-align: center;">Grand Total</label>
                    <div style="width: 5%;"></div>
                  </div>
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <input type="text" id="grandTotal" name="grandTotal" value="$ ${
                      order.grandTotal
                    }" required class="form-control" style="width: 50%;" readonly>
                    <div style="width: 5%;"></div>
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
                    <div style="width: 25%;"></div>
                    <label for="orderStatus" style="width: 50%; text-align: center;">Order Status</label>
                    <div style="width: 5%;"></div>
                  </div>
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
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
                        <div style="width: 5%;"></div>
                        <div style="width: 20%;">
                          <button style="width: 90%;" class="order-buttons" id="updateBtn">Update</button>
                        </div>
                        `
                    }
                  </div>

                  <!-- ORDER DATE -->
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <label for="orderDate" style="width: 50%; text-align: center;">Order Date</label>
                    <div style="width: 5%;"></div>
                  </div>
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <input type="text" id="orderDate" name="orderDate" value="${formatDate(
                      order.orderDate
                    )}" required class="form-control" style="width: 50%;" readonly>
                    <div style="width: 5%;"></div>
                  </div>

                  <!-- PRODUCT COUNT -->
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <label for="ProductCount" style="width: 50%; text-align: center;">Product Count</label>
                    <div style="width: 5%;"></div>
                  </div>
                  <div class="d-flex w-100 align-items-center">
                    <div style="width: 25%;"></div>
                    <input type="text" id="ProductCount" name="ProductCount" value="${
                      order.items.length
                    }" required class="form-control" style="width: 50%;" readonly>
                    <div style="width: 5%;"></div>
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
    mainContentArea.innerHTML = "";
    loader.removeJs();
    loader.removeCss();
    applyFadeEffect(() => {
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

function checkOrderStatus() {
  if (order.orderStatus === "completed" || order.orderStatus === "cancelled") {
    errorPopUp.showErrorModal(
      "This order is already settled, no other changes can be made"
    );
    return false;
  } else {
    return true;
  }
}

async function deleteProductFromTheOrder(productID) {
  try {
    if (!checkOrderStatus()) {
      return order;
    }
    const requestInfo = {
      url: urlObject.removeProductFromOrder + order.orderID,
      method: fetchHandler.methods.patch,
      data: { productId: productID },
    };

    const data = await fetchHandler.sendRequest(requestInfo);
    const updatedOrder = data.data.order;
    return updatedOrder;
  } catch (error) {
    throw error;
  }
}

async function updateTheOrderStatus(status) {
  try {
    if (!checkOrderStatus()) {
      return order;
    }
    const requestInfo = {
      url: urlObject.updateOrderStatus + order.orderID,
      method: fetchHandler.methods.patch,
      data: { orderStatus: status },
    };

    const data = await fetchHandler.sendRequest(requestInfo);
    const updatedOrder = data.data.order;
    return updatedOrder;
  } catch (error) {
    throw error;
  }
}

// Async functions below make calls to backend and update information
async function addDiscountToTheOrder(discountAmount) {
  try {
    if (!checkOrderStatus()) {
      return order;
    }
    const requestInfo = {
      url: urlObject.addDiscount + order.orderID,
      data: { discountInPercentage: discountAmount },
      method: fetchHandler.methods.patch,
    };

    const data = await fetchHandler.sendRequest(requestInfo);
    const updatedOrder = data.data.order;
    return updatedOrder;
  } catch (error) {
    throw error;
  }
}

async function cancelTheOrder() {
  try {
    if (!checkOrderStatus()) {
      return order;
    }
    const requestInfo = {
      url: urlObject.cancelOrder + order.orderID,
      method: fetchHandler.methods.patch,
    };

    const data = await fetchHandler.sendRequest(requestInfo);
    const updatedOrder = data.data.order;
    return updatedOrder;
  } catch (error) {
    throw error;
  }
}

async function getCustomerInfo(customerId) {
  try {
    const requestInfo = {
      url: urlObject.getACustomer + customerId,
      method: fetchHandler.methods.get,
    };
    const urlArray = requestInfo.url.split("/");
    if (!urlArray[urlArray.length - 1].startsWith("CUS_")) {
      throw new Error("CustomerID is missing from the url");
    }
    const data = await fetchHandler.sendRequest(requestInfo);
    const customerData = data.data.customerData;
    return customerData;
  } catch (error) {
    throw error;
  }
}

async function getEmployeeInfo(employeeId) {
  try {
    const requestInfo = {
      url: urlObject.getAnEmployeeData + employeeId,
      method: fetchHandler.methods.get,
    };
    const urlArray = requestInfo.url.split("/");
    if (!urlArray[urlArray.length - 1].startsWith("EMP_")) {
      throw new Error("EmployeeID is missing from the url");
    }
    const data = await fetchHandler.sendRequest(requestInfo);
    const employeeData = data.data.employeeData;
    return employeeData;
  } catch (error) {}
}

function closeModal() {
  modal.style.display = "none";
  modalOverlay.style.display = "none";
  modalContent.innerHTML = ""; // Clear modal content
}

function viewEntityInfo(customer = null, employee = null) {
  modalContent.innerHTML = "";
  if (customer && !employee) {
    const customerImage =
      customer.customerBio.gender.toLowerCase() === "male"
        ? "../../img/Male.png"
        : "../../img/Female.png";

    modalContent.innerHTML = `
    <h2 class="entity-name">${customer.customerBio.firstName} ${
      customer.customerBio.lastName
    }</h2>
      <div class="image-container" id="customer-image-container">
          <img src="${customerImage}"/>
      </div>
      <form id="edit-user-form">

        <label for="customerId">Customer ID:</label>
        <input type="text" id="customerId" name="customerId" value="${
          customer.customerID
        }" readonly>

        <div class="multiple-input-fields">
          <div>
            <label for="firstName">First Name:</label>
            <input type="text" id="firstName" name="firstName" value="${
              customer.customerBio.firstName
            }" required readonly>
          </div>
          <div>
            <label for="lastName">Last Name:</label>
            <input type="text" id="lastName" name="lastName" value="${
              customer.customerBio.lastName
            }" required readonly>
          </div>
        </div>

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" value="${
          customer.email
        }" readonly>

        <label for="phone">Phone Number:</label>
        <input type="text" id="phone" name="phone" value="${
          customer.phone
        }" required readonly>

        <label for="street">Street:</label>
        <input type="text" id="street" name="street" value="${
          customer.customerBio.address.street
        }" required readonly>

        <div class="multiple-input-fields">
          <div>
            <label for="city">City:</label>
            <input type="text" id="city" name="city" value="${
              customer.customerBio.address.city
            }" required readonly>
          </div>
          <div>
            <label for="country">Country:</label>
            <input type="text" id="country" name="country" value="${
              customer.customerBio.address.country
            }" required readonly>
          </div>
        </div>

        <div class="multiple-input-fields">
          <div>
            <label for="gender">Gender:</label>
            <input type="text" id="country" name="country" value="${
              customer.customerBio.gender
            }" required readonly>
          </div>
          <div>
            <label for="account-status">Account Status:</label>
             <input type="text" id="country" name="country" value="${
               customer.accountStatus
             }" required readonly>
          </div>
        </div>

        <label for="date">Date Created:</label>
        <input type="text" id="date" name="dateCreated" value="${formatDate(
          customer.accountCreated
        )}" readonly>    
      </form>
    `;
  } else if (employee && !customer) {
    const employeeImage =
      employee.employeeBio.gender.toLowerCase() === "male"
        ? "../../img/employeeMale.png"
        : "../../img/employeeFemale.png";

    modalContent.innerHTML = `
        <h2 class="entity-name">${employee.employeeBio.firstName} ${
      employee.employeeBio.lastName
    }</h2>
        <div class="image-container" id="employee-image-container">
            <img src="${employeeImage}"/>
        </div>
        
        <form id="edit-employee-form">
          <label for="employeeId">Employee ID:</label>
          <input type="text" id="employeeId" name="employeeId" value="${
            employee.employeeID
          }" readonly>
  
          <div class="multiple-input-fields">
            <div>
              <label for="firstName">First Name:</label>
              <input type="text" id="firstName" name="firstName" value="${
                employee.employeeBio.firstName
              }" required readonly>
            </div>
            <div>
              <label for="lastName">Last Name:</label>
              <input type="text" id="lastName" name="lastName" value="${
                employee.employeeBio.lastName
              }" required readonly>
            </div>
          </div>
  
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" value="${
            employee.email
          }" readonly>
  
          <label for="phone">Phone:</label>
          <input type="text" id="phone" name="phone" value="${
            employee.phone
          }" required readonly>
  
          <label for="jobTitle">Job Title:</label>
          <input type="text" id="jobTitle" name="jobTitle" value="${
            employee.workInfo.jobTitle
          }" readonly>
  
          <label for="department">Department:</label>
          <input type="text" id="department" name="department" value="${
            employee.workInfo.department
          }" readonly>
  
          <label for="hireDate">Hire Date:</label>
          <input type="text" id="hireDate" name="hireDate" value="${formatDate(
            employee.workInfo.hireDate
          )}" readonly>
  
          <label for="accountStatus">Account Status:</label>
          <input type="text" id="accountStatus" name="hireDate" value="${
            employee.accountStatus
          }" readonly>
        </form>
      `;
  }

  modal.style.display = "block";
  modalOverlay.style.display = "block";
}
