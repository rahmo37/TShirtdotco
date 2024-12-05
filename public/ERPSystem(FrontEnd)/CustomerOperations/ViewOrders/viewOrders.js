// This module initializes the home page

// Necessary Imports
import { fetchHandler } from "../../helper/fetchHandler.js";
import { urlObject } from "../../helper/urls.js";
import { sessionObject } from "../../helper/sessionStorage.js";
import { confirmPopUp } from "../../helper/confirmPopUpHandler.js";
import { successPopUp } from "../../helper/successPopupHandler.js";
import { errorPopUp } from "../../helper/errorPopUpHandler.js";
import { infoPopUp } from "../../helper/informationPopUpHandler.js";

// On Page Load
window.onload = async () => {
  // Load all the necessary popup modals
  await successPopUp.loadModal("../../popups/successPopup.html");
  await errorPopUp.loadModal("../../popups/errorPopup.html");
  await confirmPopUp.loadModal("../../popups/confirmPopUp.html");
  await infoPopUp.loadModal("../../popups/infoPopUp.html");

  init();
};

// Initialize the Page
async function init() {
  const customer = sessionObject.getData("customer");
  const orders = await getOrders(customer.customerID);

  const currentOrderBody = document.querySelector(".current-orders-body");
  const pastOrderBody = document.querySelector(".past-orders-body");
  const currentOrderSearch = document.getElementById("current-order-search");
  const currentOrderTable = document.querySelector(".current-orders-table");
  const currentOrderCollapseButton = document.querySelector(
    ".current-order-collapse"
  );
  const pastOrderTable = document.querySelector(".past-orders-table");
  const pastOrderSearch = document.getElementById("past-order-search");
  const pastOrderCollapseButton = document.querySelector(
    ".past-order-collapse"
  );

  const pastOrders = orders.filter((order) => {
    return (
      order.orderStatus.toLowerCase() === "completed" ||
      order.orderStatus.toLowerCase() === "cancelled"
    );
  });

  const currentOrders = orders.filter((order) => {
    return (
      order.orderStatus.toLowerCase() === "processing" ||
      order.orderStatus.toLowerCase() === "shipped"
    );
  });

  currentOrderBody.innerHTML = generateCurrentOrders(currentOrders, customer);
  pastOrderBody.innerHTML = generatePastOrders(pastOrders, customer);

  // Add click event listeners to rows
  addRowClickListeners(currentOrderBody, orders);
  addRowClickListeners(pastOrderBody, orders);

  currentOrderSearch.addEventListener("input", () => {
    filterTable(currentOrderTable, currentOrderSearch);
  });

  pastOrderSearch.addEventListener("input", () => {
    filterTable(pastOrderTable, pastOrderSearch);
  });

  currentOrderCollapseButton.addEventListener("click", () => {
    toggleSection(".current-orders-section", currentOrderCollapseButton);
  });

  pastOrderCollapseButton.addEventListener("click", () => {
    toggleSection(".past-orders-section", pastOrderCollapseButton);
  });
}

// Add Click Event Listeners to Table Rows
function addRowClickListeners(tableBody, orders) {
  const rows = tableBody.querySelectorAll("tr");
  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const orderId = row.getAttribute("data-order-id");
      const orderClicked = orders.find((order) => {
        return order.orderID === orderId;
      });

      console.log(orderClicked);
      sessionObject.setData("orderSelected", orderClicked);
      window.location.href = "../DisplayOrderDetail/displayOrderDetail.html";
    });
  });
}

// Generate Current Orders Table Rows
function generateCurrentOrders(orders, customer) {
  const rows = orders
    .map((order) => {
      const dot =
        order.orderStatus.toLowerCase() === "processing"
          ? "&#128992;" // Orange dot for "processing"
          : "&#128309;"; // Red dot for other statuses

      return `<tr data-order-id="${order.orderID}">
        <td>${dot} ${order.orderStatus}</td>
        <td>${formatDate(order.orderDate)}</td>
        <td>${order.items.length}</td>
        <td>$${order.grandTotal || "N/A"}</td>
        <td>${customer?.customerBio?.address?.street || "N/A"}</td>
      </tr>`;
    })
    .join(""); // Join the array of rows into a single string

  return rows;
}

// Generate Past Orders Table Rows
function generatePastOrders(orders, customer) {
  const rows = orders
    .map((order) => {
      const dot =
        order.orderStatus.toLowerCase() === "completed"
          ? "&#128994;" // Green dot for "completed"
          : "&#128308;"; // Red dot for other statuses

      return `<tr data-order-id="${order.orderID}">
        <td>${dot} ${order.orderStatus}</td>
        <td>${formatDate(order.orderDate)}</td>
        <td>${order.items.length}</td>
        <td>$${order.grandTotal || "N/A"}</td>
        <td>${customer?.customerBio?.address?.street || "N/A"}</td>
      </tr>`;
    })
    .join(""); // Join the rows into a single string

  return rows;
}

// Format Dates
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Filter Table Rows
export function filterTable(tableGiven, inputGiven, exclude = 0) {
  const input = inputGiven;
  const filter = input.value.toLowerCase();
  const table = tableGiven;
  const rows = table.getElementsByTagName("tr");

  for (let i = 1; i < rows.length - exclude; i++) {
    // Start from 1 to skip the header row
    let row = rows[i];
    let textContent = row.textContent.toLowerCase();
    textContent = textContent
      .split("\n")
      .map((data) => data.trim())
      .join("");
    if (textContent.includes(filter)) {
      row.style.display = ""; // Show matching row
      highlightText(row, filter); // Highlight matches
    } else {
      row.style.display = "none"; // Hide non-matching row
    }
  }
}

// Highlight Text in Matching Rows
function highlightText(row, keyword) {
  const cells = row.getElementsByTagName("td");

  // Remove existing highlights
  for (let cell of cells) {
    removeHighlights(cell);
  }

  if (!keyword) return; // Exit if no keyword is entered

  // Apply highlight
  for (let cell of cells) {
    highlightCellText(cell, keyword);
  }
}

// Remove Existing Highlights
function removeHighlights(element) {
  const highlightSpans = element.querySelectorAll("span");
  highlightSpans.forEach((span) => {
    // Replace the span with its text content
    span.outerHTML = span.textContent;
  });
}

// Highlight Text in a Cell
function highlightCellText(cell, keyword) {
  const regex = new RegExp(`(${keyword})`, "gi");
  cell.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const matches = node.textContent.match(regex);
      if (matches) {
        const newHTML = node.textContent.replace(
          regex,
          `<span class="highlight">$1</span>`
        );
        const tempElement = document.createElement("span");
        tempElement.innerHTML = newHTML;
        node.parentNode.replaceChild(tempElement, node);
      }
    }
  });
}

// Toggle Visibility of Sections
function toggleSection(sectionSelector, button) {
  const section = document.querySelector(sectionSelector);
  section.classList.toggle("hide");
  if (section.classList.contains("hide")) {
    button.classList.remove("fa-circle-chevron-down");
    button.classList.add("fa-circle-chevron-right");
  } else {
    button.classList.remove("fa-circle-chevron-right");
    button.classList.add("fa-circle-chevron-down");
  }
}

// Fetch Orders from API
async function getOrders(customerID) {
  try {
    const requestInfo = {
      url: urlObject.getOrdersOfACustomer + customerID,
      method: fetchHandler.methods.get,
    };

    const data = await fetchHandler.sendRequest(requestInfo);
    return data.data.orders;
  } catch (error) {
    errorPopUp.showErrorModal(error.message);
  }
}
