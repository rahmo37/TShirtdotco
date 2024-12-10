// This file handles displaying orders

// Importing the fetchHandler module
import { fetchHandler } from "../../../helper/fetchHandler.js";
import { urlObject } from "../../../helper/urls.js";
import { errorPopUp } from "../../../helper/errorPopUpHandler.js";
import { successPopUp } from "../../../helper/successPopupHandler.js";
import { confirmPopUp } from "../../../helper/confirmPopUpHandler.js";
import { filterTable } from "../../../helper/searchTable.js";
import { loader } from "../../../helper/loadPageDynamically.js";
import { applyFadeEffect } from "../../../helper/applyFadeEffect.js";
import { sessionObject } from "../../../helper/sessionStorage.js";

(function () {
  const ordersTableContainer = document.getElementById("table-container");
  const createOrderBtn = document.getElementById("add-new-btn");
  const searchInput = document.getElementById("searchInput");
  // This is the main container where external content is loaded
  const contentArea = document.getElementById("outer-main-container");

  createOrderBtn.addEventListener("click", () => {
    loadPageWithFade({
      htmlUrl: "../ManageOrders/CreateOrders/SelectProduct/selectProduct.html",
      cssUrl: "../ManageOrders/CreateOrders/SelectProduct/selectProduct.css",
      jsUrl: "../ManageOrders/CreateOrders/SelectProduct/selectProduct.js",
    });
    if (sessionObject.getData("itemsArray")) {
      sessionObject.removeData("itemsArray");
    }
    if (sessionObject.getData("customerObject")) {
      sessionObject.removeData("customerObject");
    }
  });

  // Display orders
  getOrderList();

  // Initialize event listener for search input
  searchInput.addEventListener("input", () => {
    filterTable();
  });

  async function getOrderList() {
    try {
      const requestInfo = {
        url: urlObject.getAllOrders,
        method: fetchHandler.methods.get,
      };
      const data = await fetchHandler.sendRequest(requestInfo);
      const orderCount = data.count;
      const orders = data.data.orders;
      renderOrderList(orders, orderCount);
    } catch (error) {
      console.error(error.message);
      errorPopUp.showErrorModal("Error occurred while fetching order data");
    }
  }

  // Render oder list
  function renderOrderList(orders, orderCount) {
    ordersTableContainer.innerHTML = "";

    const table = document.createElement("table");
    table.id = "dataTable";

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
    <th>Order ID</th>
    <th>Customer ID</th>
    <th>Order Status</th>
    <th>Order Date</th>
    <th>Product Count</th>
    <th>Total Price</th>
    <th>Tax</th>
    <th>Grand Total</th>
  `;

    table.appendChild(headerRow);

    orders.forEach((order) => {
      let statusDot = "";

      switch (order.orderStatus.toLowerCase()) {
        case "completed":
          statusDot = "&#128994;";
          break;
        case "processing":
          statusDot = "&#128992;";
          break;
        case "shipped":
          statusDot = "&#128309;";
          break;
        case "cancelled":
          statusDot = "&#128308;";
          break;
        default:
          statusDot = "";
      }

      const orderRow = document.createElement("tr");
      orderRow.classList.add("orderRow-reset");
      orderRow.innerHTML = `
        <td>${order.orderID}</td>
        <td>${order.customerID}</td>
        <td>${statusDot} ${order.orderStatus}</td>
        <td>${formatDate(order.orderDate)}</td>
        <td>${order.items.length}</td>
        <td>$${order.totalPrice}</td>
        <td>$${order.tax}</td>
        <td>$${order.grandTotal}</td>
        <button class="view-order";">View Order</button>
      `;

      orderRow.addEventListener("click", (event) => {
        const rowList = Array.from(document.getElementsByTagName("tr"));
        rowList.forEach((row) => {
          if (orderRow !== row && row.classList.contains("orderRow")) {
            console.log();
            row.classList.remove("orderRow");
            row.classList.add("orderRow-reset");
          }
        });
        orderRow.classList.toggle("orderRow-reset");
        orderRow.classList.toggle("orderRow");
      });

      const viewOrderBtn = orderRow.querySelector(".view-order");
      viewOrderBtn.addEventListener("click", () => {
        sessionObject.setData("viewOrder", order);
        loadPageWithFade({
          htmlUrl: "../ManageOrders/ViewOrUpdateOrders/viewOrUpdateOrders.html",
          cssUrl: "../ManageOrders/ViewOrUpdateOrders/viewOrUpdateOrders.css",
          jsUrl: "../ManageOrders/ViewOrUpdateOrders/viewOrUpdateOrders.js",
        });
      });

      table.appendChild(orderRow);
    });

    ordersTableContainer.appendChild(table);
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  // Function to load page with fade effects
  function loadPageWithFade({ htmlUrl, cssUrl, jsUrl }) {
    try {
      contentArea.innerHTML = "";
      loader.removeJs();
      loader.removeCss();
      applyFadeEffect(() => {
        loader.loadPageContent({
          htmlUrl,
          cssUrl,
          jsUrl,
          targetElement: contentArea,
        });
      }, contentArea);
    } catch (error) {
      console.error("Error loading page:", error);
    }
  }
})();
