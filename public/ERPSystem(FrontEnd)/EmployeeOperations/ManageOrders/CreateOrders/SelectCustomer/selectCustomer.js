// This module displays the customer table and displays the customer detail upon selection

// Importing necessary modules
import { fetchHandler } from "../../../../../helper/fetchHandler.js";
import { urlObject } from "../../../../../helper/urls.js";
import { errorPopUp } from "../../../../../helper/errorPopUpHandler.js";
import { successPopUp } from "../../../../../helper/successPopupHandler.js";
import { confirmPopUp } from "../../../../../helper/confirmPopUpHandler.js";
import { infoPopUp } from "../../../../../helper/informationPopUpHandler.js";
import { filterTable } from "../../../../../helper/searchTable.js";
import { loader } from "../../../../../helper/loadPageDynamically.js";
import { applyFadeEffect } from "../../../../../helper/applyFadeEffect.js";
import { sessionObject } from "../../../../../helper/sessionStorage.js";
import { sortTableBySelection } from "../../../../../helper/sortBySelection.js";

(function () {
  // This array will hold all the selected customer and its information
  const customerObject = sessionObject.getData("customerObject");
  let selectedCustomer = customerObject ? customerObject : {};
  let cachedCustomerData = [];
  let itemsArray = [];

  init();

  // Initializes the module
  async function init() {
    // Gather all elements
    const mainContentArea = document.getElementById("outer-main-container");
    const tableContainer = document.getElementById("table-container");
    const card = document.querySelector(".card");
    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextBtn");
    const searchInput = document.getElementById("searchInput");

    itemsArray = sessionObject.getData("itemsArray");
    if (!itemsArray || itemsArray.length === 0) {
      errorPopUp.showErrorModal(
        "Please select products for the order first",
        () => {
          navigateBack(mainContentArea);
        }
      );
      return;
    }

    attachEventListeners({
      mainContentArea,
      tableContainer,
      card,
      backBtn,
      nextBtn,
      searchInput,
    });

    if (cachedCustomerData.length === 0) {
      try {
        cachedCustomerData = await getCustomer();
      } catch (error) {
        // Disable UI elements or show an error message
        console.error("Error fetching customer:", error);
        if (searchInput) {
          searchInput.disabled = true;
        }
        if (tableContainer) {
          tableContainer.innerHTML =
            "<h3>Unable to load customers at this time.</h3>";
        }
        if (card) {
          card.innerHTML = "";
        }
        return;
      }
    }

    displayCustomersTable(cachedCustomerData, tableContainer, card);
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
        navigateBack(mainContentArea);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if(isEmptyObject(selectedCustomer)) {
          errorPopUp.showErrorModal("Please select a customer for the order");
          return;
        }
        navigateToNext(mainContentArea);
      });
    }
  }

  async function getCustomer() {
    try {
      const requestInfo = {
        url: urlObject.getCustomerList,
        method: fetchHandler.methods.get,
      };

      const data = await fetchHandler.sendRequest(requestInfo);

      const customerData = data.data;
      return customerData;
    } catch (error) {
      errorPopUp.showErrorModal(
        error.message ||
          "An unexpected error occurred while fetching inventory data."
      );
      return [];
    }
  }

  function displayCustomersTable(customerData, tableContainer, card) {
    if (!tableContainer) return;
    tableContainer.innerHTML = "";

    const table = document.createElement("table");
    table.id = "dataTable";

    // Create the header row
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
          <th>Customer ID</th>
          <th>Customer Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Account Status</th>
        `;
    table.appendChild(headerRow);

    // Create the body and append rows dynamically
    const tbody = document.createElement("tbody");
    console.log(selectedCustomer);
    customerData.forEach((customer) => {
      const alreadySelectedCustomer =
        selectedCustomer.customerID === customer.customerID
          ? selectedCustomer
          : undefined;
      const customerRow = document.createElement("tr");
      customerRow.style.backgroundColor = alreadySelectedCustomer
        ? "#00FF0033"
        : "";

      customerRow.innerHTML = `
        <td>${alreadySelectedCustomer ? "&#9989;" : ""} ${
        customer.customerID
      }</td>
        <td>${
          customer.customerBio.firstName + " " + customer.customerBio.lastName
        }</td>
        <td>${customer.email}</td>
        <td>${customer.phone}</td>
        <td>${customer.accountStatus}</td>
      `;

      customerRow.addEventListener("click", () => {
        updateCustomerCard(customer, card, alreadySelectedCustomer);
      });

      tbody.appendChild(customerRow);
    });
    table.appendChild(tbody);

    sortTableBySelection(table);

    const footerContainer = document.createElement("tfoot");
    const footerRow = document.createElement("tr");

    footerRow.innerHTML = `
    <td colspan="2">Customer: ${
      !isEmptyObject(selectedCustomer)
        ? selectedCustomer.customerBio.firstName +
          " " +
          selectedCustomer.customerBio.lastName
        : "Awaiting Selection"
    }</td>
    <td colspan="2">Id: ${
      !isEmptyObject(selectedCustomer)
        ? selectedCustomer.customerID
        : "Awaiting Selection"
    }</td>
  `;
    footerContainer.appendChild(footerRow);

    table.appendChild(footerContainer);
    tableContainer.appendChild(table);
  }

  function updateCustomerCard(customer, card, alreadySelectedCustomer) {
    if (!card) return;
    card.innerHTML = ` 
       <img
        src="../../../../img/${
          customer.customerBio.gender &&
          customer.customerBio.gender.toLowerCase() === "male"
            ? "Male.png"
            : "Female.png"
        }"
        class="card-img-top"
        alt="Customer Image"
      />
      <div class="card-body">
        <h1 class="card-title text-center">${
          customer.customerBio.firstName + " " + customer.customerBio.lastName
        }</h1>

        <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>Customer ID:</strong> ${
            customer.customerID
          }</li>
          <li class="list-group-item">
            <strong>Email:</strong> ${customer.email}
          </li>
          <li class="list-group-item"><strong>Phone:</strong> ${
            customer.phone
          }</li>
          <li class="list-group-item">
            <strong>Gender: </strong> ${customer.customerBio.gender}
          </li>
          <li class="list-group-item">
            <strong>Account Status:</strong> ${customer.accountStatus}
          </li>
        </ul>
      </div>
      <div class="card-footer text-center ${
        alreadySelectedCustomer ? "customer-selected" : ""
      }" id="cardFooter">
        <div class="select-customer-buttons-container">
          <button class="select-customer-buttons" id="selectBtn">Select</button>
          <button class="select-customer-buttons" id="removeBtn">Remove</button>
        </div>
      </div>
    `;
    setupCustomerCardEventListeners(customer, alreadySelectedCustomer);
  }

  function setupCustomerCardEventListeners(customer, alreadySelectedCustomer) {
    const selectBtn = document.getElementById("selectBtn");
    const removeBtn = document.getElementById("removeBtn");
    const cardFooter = document.getElementById("cardFooter");

    // Reset button states
    if (!alreadySelectedCustomer && cardFooter) {
      cardFooter.classList.remove("customer-selected");
    }

    if (selectBtn) {
      selectBtn.addEventListener("click", () => {
        if (
          !alreadySelectedCustomer &&
          !isEmptyObject(selectedCustomer) &&
          customer.customerID !== selectedCustomer.customerID
        ) {
          confirmPopUp.showConfirmModal(
            `You have already selected <span style="color:green; font-weight:bold">${
              selectedCustomer.customerBio.firstName +
              " " +
              selectedCustomer.customerBio.lastName
            }</span> for this order, do you want to select <span style="color:orange; font-weight:bold">${
              customer.customerBio.firstName +
              " " +
              customer.customerBio.lastName
            }</span> instead?`,
            () => {
              if (cardFooter) {
                cardFooter.classList.add("customer-selected");
              }
              selectedCustomer = customer;
              init();
            }
          );
        } else if (
          !alreadySelectedCustomer &&
          isEmptyObject(selectedCustomer)
        ) {
          confirmPopUp.showConfirmModal(
            `Select <span style="color:green; font-weight:bold">${
              customer.customerBio.firstName +
              " " +
              customer.customerBio.lastName
            }</span> for this order?`,
            () => {
              if (cardFooter) {
                cardFooter.classList.add("customer-selected");
              }
              selectedCustomer = customer;
              init();
            }
          );
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        confirmPopUp.showConfirmModal(
          `Remove <span style="color:red; font-weight:bold">${
            customer.customerBio.firstName + " " + customer.customerBio.lastName
          }</span> from the order?`,
          () => {
            if (cardFooter) {
              cardFooter.classList.remove("customer-selected");
            }
            selectedCustomer = {};
            init();
            successPopUp.showSuccessModal(
              `<span style="color:red; font-weight:bold">${
                customer.customerBio.firstName +
                " " +
                customer.customerBio.lastName
              }</span> is removed from the order`
            );
          }
        );
      });
    }
  }

  function navigateBack(mainContentArea) {
    loadPageWithFade({
      htmlUrl: "../ManageOrders/CreateOrders/SelectProduct/selectProduct.html",
      cssUrl: "../ManageOrders/CreateOrders/SelectProduct/selectProduct.css",
      jsUrl: "../ManageOrders/CreateOrders/SelectProduct/selectProduct.js",
      targetElement: mainContentArea,
    });
    sessionObject.setData("customerObject", selectedCustomer);
  }

  function navigateToNext(mainContentArea) {
    loadPageWithFade({
      htmlUrl: "../ManageOrders/CreateOrders/FinalizeOrder/finalizeOrder.html",
      cssUrl: "../ManageOrders/CreateOrders/FinalizeOrder/finalizeOrder.css",
      jsUrl: "../ManageOrders/CreateOrders/FinalizeOrder/finalizeOrder.js",
      targetElement: mainContentArea,
    });
    sessionObject.setData("customerObject", selectedCustomer);
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

  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  }
})();
