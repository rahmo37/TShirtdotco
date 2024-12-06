// Grabbing the signup button
const signUpBtn = document.getElementById("sign-up");
const signInBtn = document.getElementById("sign-in");
import { urlObject } from "../helper/urls.js";
import { sessionObject } from "../helper/sessionStorage.js";
import { successPopUp } from "../helper/successPopupHandler.js";
import { startLogOutTimer } from "../helper/StartLogoutTimer.js";
import { initiateSubscription } from "../helper/notificationConfig.js";

// Toggle viewing of the password
window.onload = async () => {
  const input = document.getElementById("password");
  const iconEye = document.getElementById("eye");

  await loadModal();

  iconEye.addEventListener("click", () => {
    if (input.type === "password") {
      input.type = "text";
      iconEye.classList.remove("fa-eye-slash");
      iconEye.classList.add("fa-eye");
    } else {
      input.type = "password";
      iconEye.classList.remove("fa-eye");
      iconEye.classList.add("fa-eye-slash");
    }
  });
};

// On clicking the Sign-Up button, navigate to the registration page
signUpBtn.addEventListener("click", () => {
  window.location.href = "../Resgistration/registration.html";
});

// On clicking the Sign-In button, validate the inputs
signInBtn.addEventListener("click", async () => {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const employeeCheckbox = document.getElementById("employeeCheckbox").checked;
  const emailErr = document.getElementById("email-err");
  const passwordErr = document.getElementById("password-err");

  // Email validation
  let email = "";
  if (emailInput.value.length === 0) {
    setErrMessage(emailErr, "Email cannot be empty");
    addErrClass(emailInput);
  } else if (
    !(emailInput.value.indexOf(".") > 0 && emailInput.value.indexOf("@") > 0) ||
    /[^a-zA-Z0-9.@_-]/.test(emailInput.value)
  ) {
    setErrMessage(emailErr, "Entered email is not in correct format");
    addErrClass(emailInput);
  } else {
    removeErrClass(emailInput);
    email = emailInput.value;
  }

  // Password validation
  let password = "";
  if (passwordInput.value.length === 0) {
    setErrMessage(passwordErr, "Password field cannot be empty");
    addErrClass(passwordInput);
  } else {
    removeErrClass(passwordInput);
    password = passwordInput.value;
  }

  emailInput.addEventListener("input", () => {
    removeErrClass(emailInput);
  });
  passwordInput.addEventListener("input", () => {
    removeErrClass(passwordInput);
  });

  if (email && password) {
    const result = await validateUser(email, password, employeeCheckbox);
    if (result.err) {
      showErrorModal(result.err); // Display the error message in the modal
    } else {
      // at first clear any previous session data
      sessionObject.clearStorage();
      // retrieve the user
      const userData = result.data;
      // retrieve the token
      const token = userData.token;
      // save the user token in the session storage
      sessionObject.setData("token", token);

      // Set just logged in to true
      sessionObject.setData("justLoggedIn", true);
      // set the user data based on the role of the user
      if (userData.user.employeeID) {
        // TODO Remove later if not using push notifications
        // initiateSubscription();

        //if employee
        sessionObject.setData("isEmployee", true);
        sessionObject.setData("employee", userData.user);
        sessionObject.setData("newNotifications", 0);
        sessionObject.setData("currentNotificationsArray", []);

        if (userData.user.isAdmin) {
          sessionObject.setData("isAdmin", true);
        }

        //! load the employee menu
        window.location.href =
          "../EmployeeOperations/EmployeeMenu/employeeMenu.html";
      } else {
        // if customer
        sessionObject.setData("isEmployee", false);
        sessionObject.setData("customer", userData.user);
        sessionObject.setData("customerOrders", userData.orders);
        sessionObject.setData("customerProductSelectionArray", []);

        //! load the customer menu
        window.location.href = "../CustomerOperations/Home/home.html";
      }
    }
  }
});

async function validateUser(email, password, isEmployee) {
  try {
    // Set the appropriate URL
    const url = isEmployee ? urlObject.employeeLogin : urlObject.customerLogin;

    // Arrange the payload
    const payload = { email, password };

    // Send the request and get the response
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // check the credentials
    if (response.status === 401) {
      // Example for unauthorized status code
      return {
        err: "Invalid credentials",
        data: null,
      };
    }

    // Check for non-OK response status
    if (!response.ok) {
      const errorData = await response.json(); // Expecting error message in the response body
      return {
        err: errorData.error.message || "An unknown error occurred",
        data: null,
      };
    }

    // Parse the response if successful
    const data = await response.json();
    return { err: null, data };
  } catch (error) {
    // Handle network or other unexpected errors
    return {
      err: "Internal server error occurred",
      data: null,
    };
  }
}

//* Helper functions
// Add an error class
function addErrClass(elem) {
  elem.classList.add("is-invalid");
}

// Remove error class
function removeErrClass(elem) {
  elem.classList.remove("is-invalid");
  elem.classList.add("is-valid");
}

// Set error message
function setErrMessage(elem, message) {
  elem.innerHTML = message;
}

// get report
async function getReport(url) {
  // Send the request and get the response
  const response = await fetch(url);

  // Check for non-OK response status
  if (!response.ok) {
    return {
      err: "Internal server err",
      data: null,
    };
  }
  // Parse the response if successful
  const rawData = await response.json();

  // check the data property if it exists
  if (!rawData.data) {
    return { err: "Malformed server response", data: null };
  }
  return { err: null, data: rawData.data };
}

async function loadModal() {
  try {
    const response = await fetch("../popups/errorPopup.html");
    if (!response.ok) {
      throw new Error("Failed to load the modal");
    }
    const modalHTML = await response.text();
    document.getElementById("modalContainer").innerHTML = modalHTML;
  } catch (err) {
    console.error("Error loading modal:", err);
  }
}

// Show the error modal with a specific message
function showErrorModal(message) {
  // Set the error message inside the modal
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.textContent = message;

  // Show the modal using Bootstrap's modal methods
  const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
  errorModal.show();
}
