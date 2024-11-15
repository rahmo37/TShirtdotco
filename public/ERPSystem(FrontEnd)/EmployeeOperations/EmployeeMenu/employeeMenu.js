// This module loads all the employee operation contents dynamically
// Importing modules
import { loader } from "../../helper/loadPageDynamically.js";
import { errorPopUp } from "../../helper/errorPopUpHandler.js";
import { successPopUp } from "../../helper/successPopupHandler.js";
import { confirmPopUp } from "../../helper/confirmPopUpHandler.js";
import { startLogOutTimer } from "../../helper/StartLogoutTimer.js";
import { infoPopUp } from "../../helper/informationPopUpHandler.js";

// start a timer for automatic log out
startLogOutTimer(() => {
  logOutUser(true);
});

// Toggle Button
const hamBurger = document.querySelector(".toggle-btn");

// This is the main container where external content is loaded
const contentArea = document.getElementById("outer-main-container");

// These are the buttons
const reportLoader = document.getElementById("report-loader");
const employeeLoader = document.getElementById("employee-loader");
const customerLoader = document.getElementById("customer-loader");
const inventoryLoader = document.getElementById("inventory-loader");
const orderLoader = document.getElementById("order-loader");
const settingsLoader = document.getElementById("settings-loader");

// accumulating the buttons for later use
const btnArray = [
  reportLoader,
  employeeLoader,
  customerLoader,
  inventoryLoader,
  orderLoader,
];

// This is the sidebar
const sideBar = document.querySelector("#sidebar");

// The logout button
const logoutBtn = document.getElementById("logout-btn");

// Logic for expanding the menu
hamBurger.addEventListener("click", function () {
  sideBar.classList.toggle("expand");
});

// Load the reports when the user logs in
if (sessionStorage.getItem("justLoggedIn") === "true") {
  // load all the necessary modals
  await successPopUp.loadModal("../../popups/successPopup.html");
  await errorPopUp.loadModal("../../popups/errorPopup.html");
  await confirmPopUp.loadModal("../../popups/confirmPopUp.html");
  await infoPopUp.loadModal("../../popups/infoPopUp.html");

  // load te reports
  loadReports();
  sessionStorage.removeItem("justLoggedIn"); // Reset the flag
}

// ! Test function
function getRandomNumber() {
  return Math.floor(Math.random() * 100) + 1;
}

window.onload = async () => {
  // load all the necessary modals
  await successPopUp.loadModal("../../popups/successPopup.html");
  await errorPopUp.loadModal("../../popups/errorPopup.html");
  await confirmPopUp.loadModal("../../popups/confirmPopUp.html");
  await infoPopUp.loadModal("../../popups/infoPopUp.html");

  // load te reports
  loadReports();

  console.log("window loaded..." + getRandomNumber());
};

// Load reports when the report button is pressed
reportLoader.addEventListener("click", () => {
  loadReports();
  closeSideBar();
});

// Load the employee page
employeeLoader.addEventListener("click", () => {
  loadPageWithFade({
    htmlUrl: "../ManageEmployees/employees.html",
    cssUrl: "../employee_functions.css",
    jsUrl: "../ManageEmployees/employees.js",
  });
  closeSideBar();
});

// Load the customer page
customerLoader.addEventListener("click", () => {
  loadPageWithFade({
    htmlUrl: "../ManageCustomers/customer.html",
    cssUrl: "../employee_functions.css",
    jsUrl: "../ManageCustomers/customer.js",
  });
  closeSideBar();
});

// Load the customer page
orderLoader.addEventListener("click", () => {
  loadPageWithFade({
    htmlUrl: "../ManageOrders/DisplayOrders/displayOrders.html",
    cssUrl: "../employee_functions.css",
    jsUrl: "../ManageOrders/DisplayOrders/displayOrders.js",
  });
  closeSideBar();
});

settingsLoader.addEventListener("click", () => {
  loadPageWithFade({
    htmlUrl: "../EmployeeSettings/employeeSettings.html",
    cssUrl: "../EmployeeSettings/employeeSettings.css",
    jsUrl: "../EmployeeSettings/employeeSettings.js",
  });
  closeSideBar();
});

// Load the inventory page
inventoryLoader.addEventListener("click", () => {
  loadPageWithFade({
    htmlUrl: "../ManageInventory/inventory.html",
    cssUrl: "../employee_functions.css",
    jsUrl: "../ManageInventory/inventory.js",
  });
  closeSideBar();
});

// Logout button functionality
logoutBtn.addEventListener("click", () => {
  logOutUser();
});

// *Helper Methods

// Load reports
function loadReports() {
  try {
    // Apply fade-out effect, load the content, then fade-in
    loadPageWithFade({
      htmlUrl: "../Reports/reports.html",
      cssUrl: "../Reports/reports.css",
      jsUrl: "../Reports/inventoryReports.js",
    });
  } catch (error) {
    console.error("Error loading reports:", error);
  }
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
        targetElement: contentArea,
      });
    });
  } catch (error) {
    console.error("Error loading page:", error);
  }
}

// Apply fade-out, load content, then fade-in
function applyFadeEffect(loadFunction, callback) {
  // Disable the buttons when transitioning
  btnArray.forEach((btn) => {
    btn.classList.add("disabled-link");
  });

  // Add fade-out class to initiate fade-out transition
  contentArea.classList.add("fade-out");

  // Event handler for when fade-out transition ends
  function onFadeOutEnd(event) {
    if (event.target !== contentArea || event.propertyName !== "opacity")
      return;
    contentArea.removeEventListener("transitionend", onFadeOutEnd);

    // Load new content if loadFunction is provided
    if (typeof loadFunction === "function") {
      loadFunction();
    }

    // Remove fade-out class and add fade-in class to initiate fade-in transition
    contentArea.classList.remove("fade-out");
    contentArea.classList.add("fade-in");

    // Listen for fade-in transition end to clean up
    contentArea.addEventListener("transitionend", onFadeInEnd);
  }

  // Event handler for when fade-in transition ends
  function onFadeInEnd(event) {
    if (event.target !== contentArea || event.propertyName !== "opacity")
      return;
    contentArea.removeEventListener("transitionend", onFadeInEnd);

    // Now remove the class
    btnArray.forEach((btn) => {
      btn.classList.remove("disabled-link");
    });

    // Remove fade-in class
    contentArea.classList.remove("fade-in");

    // Call the callback function if provided
    if (typeof callback === "function") {
      callback();
    }
  }

  // Listen for fade-out transition end
  contentArea.addEventListener("transitionend", onFadeOutEnd);
}

// Close the sidebar
function closeSideBar() {
  sideBar.classList.remove("expand");
}

function logOutUser(automaticLogout = false) {
  // Clear session storage
  sessionStorage.clear();

  if (automaticLogout) {
    alert("user logged out due to token expiration!");
  }

  // Redirect to login page
  window.location.href = "../../Login/login.html";
}
