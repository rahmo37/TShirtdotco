// Import necessary modules
import { sessionObject } from "../../helper/sessionStorage.js";
import { fetchHandler } from "../../helper/fetchHandler.js";
import { urlObject } from "../../helper/urls.js";
import { validateObject } from "../../helper/validation.js";
import { errorPopUp } from "../../helper/errorPopUpHandler.js";
import { successPopUp } from "../../helper/successPopupHandler.js";
import { confirmPopUp } from "../../helper/confirmPopUpHandler.js";
import { infoPopUp } from "../../helper/informationPopUpHandler.js";

// Get the logged-in employee ID from session storage
const loggedInEmployeeId = sessionObject.getData("employee").employeeID;

// Variables to store original data
let originalEmployeeData = null;

// Fetch and display employee data
getEmployeeData();

///////////////////////////////////////////////////////////

async function getEmployeeData() {
  try {
    const requestInfo = {
      url: `${urlObject.getAnEmployeeData}${loggedInEmployeeId}`,
      method: fetchHandler.methods.get,
    };

    const data = await fetchHandler.sendRequest(requestInfo);
    if (data && data.data && data.data.employeeData) {
      originalEmployeeData = data.data.employeeData; // Store original data
      displayEmployeeInfo(data.data.employeeData);
    } else {
      console.error("Invalid data structure:", data);
      errorPopUp.showErrorModal("Unable to retrieve information");
    }
  } catch (error) {
    console.error("Error fetching employee data:", error.message);
    errorPopUp.showErrorModal(
      "There was an error fetching your data. Please try again later."
    );
  }
}

async function updateLoggedEmployeeData(userUpdatedInfo) {
  const requestInfo = {
    url: `${urlObject.updateLoggedInEmployeeInfo}${loggedInEmployeeId}`,
    method: fetchHandler.methods.patch,
    data: userUpdatedInfo,
  };
  return fetchHandler.sendRequest(requestInfo);
}

async function updateEmployeePassword(passwordData) {
  const requestInfo = {
    url: `${urlObject.updateEmployeePassword}${loggedInEmployeeId}`,
    method: fetchHandler.methods.patch,
    data: passwordData,
  };
  return fetchHandler.sendRequest(requestInfo);
}

function displayEmployeeInfo(employee) {
  const userInfoDiv = document.getElementById("user-info");

  // Clear existing content
  userInfoDiv.innerHTML = "";

  // Create the form element
  const form = document.createElement("form");
  form.id = "employee-form";
  form.classList.add("settings-container");
  form.noValidate = true;

  // Personal Information Section
  const personalSection = createSection("Personal Information");
  const fullNameRow = createInfoRow(
    "Name:",
    "fullName",
    "text",
    `${employee.employeeBio.firstName} ${employee.employeeBio.lastName}`,
    true
  );
  const emailRow = createInfoRow(
    "Email:",
    "email",
    "email",
    employee.email,
    true
  );

  // Current Password
  const currentPasswordRow = createInfoRow(
    "Current Password:",
    "currentPassword",
    "password",
    "",
    false,
    "Enter current password"
  );
  const currentPasswordErr = createErrorElement("currentPassword-err");

  // New Password
  const newPasswordRow = createInfoRow(
    "New Password:",
    "newPassword",
    "password",
    "",
    false,
    "Enter new password"
  );
  const newPasswordErr = createErrorElement("newPassword-err");

  // Phone
  const phoneRow = createInfoRow("Phone:", "phone", "tel", employee.phone);
  const phoneErr = createErrorElement("phone-err");

  // Append error elements
  currentPasswordRow.appendChild(currentPasswordErr);
  newPasswordRow.appendChild(newPasswordErr);
  phoneRow.appendChild(phoneErr);

  // Append rows to personal section
  personalSection.appendChild(fullNameRow);
  personalSection.appendChild(emailRow);
  personalSection.appendChild(currentPasswordRow);
  personalSection.appendChild(newPasswordRow);
  personalSection.appendChild(phoneRow);

  // Address Information Section
  const addressSection = createSection("Address Information");

  // Address Fields
  const addressFields = ["street", "city", "state", "zipCode", "country"];
  const addressLabels = ["Street:", "City:", "State:", "Zip Code:", "Country:"];
  const addressValues = [
    employee.employeeBio.address.street,
    employee.employeeBio.address.city,
    employee.employeeBio.address.state,
    employee.employeeBio.address.zipCode,
    employee.employeeBio.address.country,
  ];

  const addressErrors = {};

  addressFields.forEach((field, index) => {
    const row = createInfoRow(
      addressLabels[index],
      field,
      "text",
      addressValues[index]
    );
    const errorElem = createErrorElement(`${field}-err`);
    row.appendChild(errorElem);
    addressSection.appendChild(row);
    addressErrors[field] = errorElem;
  });

  // Save Changes Button
  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.id = "save-changes-btn";
  saveButton.classList.add("btn", "btn-primary");
  saveButton.textContent = "Save Changes";

  // Append sections and button to form
  form.appendChild(personalSection);
  form.appendChild(addressSection);
  form.appendChild(saveButton);

  // Append form to userInfoDiv
  userInfoDiv.appendChild(form);

  // Get input elements
  const phoneInput = document.getElementById("phone");
  const streetInput = document.getElementById("street");
  const cityInput = document.getElementById("city");
  const stateInput = document.getElementById("state");
  const zipCodeInput = document.getElementById("zipCode");
  const countryInput = document.getElementById("country");
  const currentPasswordInput = document.getElementById("currentPassword");
  const newPasswordInput = document.getElementById("newPassword");

  // Event listener for form submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    let valid = true;
    let firstErrorField = null; // To keep track of the first field with an error

    // Reset error messages
    resetAllErrors();

    // Error messages
    const errorMessages = {
      emptyPhone: "Phone number cannot be empty",
      invalidPhone: "Phone number must contain 10 digits",
      emptyField: "This field cannot be empty",
      invalidName: "This field contains invalid characters",
      invalidZipCode: "Zip Code contains invalid characters",
      currentPasswordRequired:
        "Current password is required to change your password.",
      newPasswordRequired: "New password is required when changing password.",
      weakPassword:
        "Password must be at least 6 characters long and include uppercase, lowercase letters, and numbers.",
      invalidStreet: "Street address must contain at least one number.",
      noChangesDetected: "No changes detected. Please make changes before saving.",
    };

    // Array to keep track of fields with errors
    const errorFields = [];

    // Check if any changes have been made
    const changesMade = checkForChanges();

    if (!changesMade) {
      infoPopUp.showInfoModal(errorMessages.noChangesDetected);
      return;
    }

    // Phone validation
    if (validateObject.isFalsy(phoneInput.value)) {
      setErrMessage(phoneErr, errorMessages.emptyPhone);
      addErrClass(phoneInput);
      errorFields.push(phoneInput);
      valid = false;
    } else if (!validateObject.checkPhoneNumber(phoneInput.value)) {
      setErrMessage(phoneErr, errorMessages.invalidPhone);
      addErrClass(phoneInput);
      errorFields.push(phoneInput);
      valid = false;
    } else {
      removeErrClass(phoneInput);
    }

    // Password validation
    if (currentPasswordInput.value || newPasswordInput.value) {
      if (validateObject.isFalsy(currentPasswordInput.value)) {
        setErrMessage(
          currentPasswordErr,
          errorMessages.currentPasswordRequired
        );
        addErrClass(currentPasswordInput);
        errorFields.push(currentPasswordInput);
        valid = false;
      } else if (validateObject.isFalsy(newPasswordInput.value)) {
        setErrMessage(newPasswordErr, errorMessages.newPasswordRequired);
        addErrClass(newPasswordInput);
        errorFields.push(newPasswordInput);
        valid = false;
      } else if (!validateObject.checkPassword(newPasswordInput.value)) {
        setErrMessage(newPasswordErr, errorMessages.weakPassword);
        addErrClass(newPasswordInput);
        errorFields.push(newPasswordInput);
        valid = false;
      } else {
        removeErrClass(currentPasswordInput);
        removeErrClass(newPasswordInput);
      }
    }

    // Address fields validation
    const addressValidations = [
      {
        input: streetInput,
        errorElem: addressErrors.street,
        validationFunc: validateObject.checkStreetAddress,
        errorMessage: errorMessages.invalidStreet,
      },
      {
        input: cityInput,
        errorElem: addressErrors.city,
        validationFunc: validateObject.checkCityOrCountry,
        errorMessage: errorMessages.invalidName,
      },
      {
        input: stateInput,
        errorElem: addressErrors.state,
        validationFunc: validateObject.checkCityOrCountry,
        errorMessage: errorMessages.invalidName,
      },
      {
        input: zipCodeInput,
        errorElem: addressErrors.zipCode,
        validationFunc: validateObject.checkZipCode,
        errorMessage: errorMessages.invalidZipCode,
      },
      {
        input: countryInput,
        errorElem: addressErrors.country,
        validationFunc: validateObject.checkCityOrCountry,
        errorMessage: errorMessages.invalidName,
      },
    ];

    addressValidations.forEach(
      ({ input, errorElem, validationFunc, errorMessage }) => {
        if (validateObject.isFalsy(input.value)) {
          setErrMessage(errorElem, errorMessages.emptyField);
          addErrClass(input);
          errorFields.push(input);
          valid = false;
        } else if (!validationFunc(input.value)) {
          setErrMessage(errorElem, errorMessage);
          addErrClass(input);
          errorFields.push(input);
          valid = false;
        } else {
          removeErrClass(input);
        }
      }
    );

    // Focus on the first field with an error
    if (errorFields.length > 0) {
      errorFields[0].focus();
    }

    if (!valid) return;

    // Prepare updated employee data
    const updatedEmployeeData = {
      phone: phoneInput.value,
      address: {
        street: streetInput.value,
        city: cityInput.value,
        state: stateInput.value,
        zipCode: zipCodeInput.value,
        country: countryInput.value,
      },
    };

    // Prepare password data if provided
    const passwordData = {
      currentPassword: currentPasswordInput.value,
      newPassword: newPasswordInput.value,
    };

    confirmPopUp.showConfirmModal("Commit the changes?", async () => {
      let updateErrors = [];
      let errorFieldsBackend = []; // To keep track of fields with backend errors

      let passwordUpdateSuccess = false;
      let employeeDataUpdateSuccess = false;

      try {
        // Attempt to update password if fields are filled
        if (currentPasswordInput.value && newPasswordInput.value) {
          await updateEmployeePassword(passwordData);
          passwordUpdateSuccess = true;
        } else {
          passwordUpdateSuccess = true; // No password update needed
        }
      } catch (error) {
        console.error("Error updating password:", error.message);

        // Extract backend error messages
        const errorMsg = extractBackendErrors(error);

        if (errorMsg.currentPassword) {
          setErrMessage(currentPasswordErr, errorMsg.currentPassword);
          addErrClass(currentPasswordInput);
          errorFieldsBackend.push(currentPasswordInput);
        }

        if (errorMsg.newPassword) {
          setErrMessage(newPasswordErr, errorMsg.newPassword);
          addErrClass(newPasswordInput);
          errorFieldsBackend.push(newPasswordInput);
        }

        updateErrors.push(errorMsg.general || "Password update failed.");
      }

      try {
        // Attempt to update employee data
        await updateLoggedEmployeeData(updatedEmployeeData);
        employeeDataUpdateSuccess = true;
      } catch (error) {
        console.error("Error updating employee data:", error.message);

        // Extract backend error messages
        const errorMsg = extractBackendErrors(error);

        // Map errors to input fields
        if (errorMsg.phone) {
          setErrMessage(phoneErr, errorMsg.phone);
          addErrClass(phoneInput);
          errorFieldsBackend.push(phoneInput);
        }

        if (errorMsg.address) {
          for (let field in errorMsg.address) {
            if (addressErrors[field]) {
              setErrMessage(addressErrors[field], errorMsg.address[field]);
              addErrClass(document.getElementById(field));
              errorFieldsBackend.push(document.getElementById(field));
            }
          }
        }

        updateErrors.push(errorMsg.general || "Employee data update failed.");
      }

      // Focus on the first field with a backend error
      if (errorFieldsBackend.length > 0) {
        errorFieldsBackend[0].focus();
      }

      if (passwordUpdateSuccess && employeeDataUpdateSuccess) {
        // Both updates succeeded
        successPopUp.showSuccessModal(
          "Your information has been updated successfully."
        );
        getEmployeeData();
        // Clear password fields
        currentPasswordInput.value = "";
        newPasswordInput.value = "";
      } else {
        // At least one update failed
        const errorMessage = updateErrors.join(" ");
        errorPopUp.showErrorModal(
          `There was an error updating your information. ${errorMessage}`
        );
        // Optionally, reset any successful updates if possible
      }
    });
  });

  // Input event listeners to remove error messages
  const inputs = [
    currentPasswordInput,
    newPasswordInput,
    phoneInput,
    streetInput,
    cityInput,
    stateInput,
    zipCodeInput,
    countryInput,
  ];

  inputs.forEach((input) => {
    input.addEventListener("input", () => removeErrClass(input));
  });

  // Helper functions for creating elements and handling errors
  function createSection(title) {
    const section = document.createElement("div");
    section.classList.add("section");

    const sectionTitle = document.createElement("h2");
    sectionTitle.classList.add("section-title");
    sectionTitle.textContent = title;

    section.appendChild(sectionTitle);
    return section;
  }

  function createInfoRow(
    labelText,
    inputId,
    inputType,
    inputValue,
    readOnly = false,
    placeholder = ""
  ) {
    const row = document.createElement("div");
    row.classList.add("info-row");

    const label = document.createElement("label");
    label.setAttribute("for", inputId);
    label.textContent = labelText;

    const input = document.createElement("input");
    input.type = inputType;
    input.classList.add("form-control");
    input.id = inputId;
    input.name = inputId;
    input.value = inputValue;
    if (readOnly) input.readOnly = true;
    if (placeholder) input.placeholder = placeholder;

    row.appendChild(label);
    row.appendChild(input);

    return row;
  }

  function createErrorElement(id) {
    const errorElem = document.createElement("div");
    errorElem.classList.add("invalid-feedback");
    errorElem.id = id;
    return errorElem;
  }

  function addErrClass(elem) {
    elem.classList.add("is-invalid");
  }

  function removeErrClass(elem) {
    elem.classList.remove("is-invalid");
    const errorElement = elem.nextElementSibling;
    if (errorElement && errorElement.classList.contains("invalid-feedback")) {
      errorElement.innerHTML = "";
    }
  }

  function setErrMessage(elem, message) {
    elem.innerHTML = message;
  }

  function resetAllErrors() {
    const errorElements = document.querySelectorAll(".invalid-feedback");
    errorElements.forEach((elem) => {
      elem.innerHTML = "";
    });
    inputs.forEach((input) => {
      removeErrClass(input);
    });
  }

  // Function to extract backend error messages
  function extractBackendErrors(error) {
    let errorMsg = {};
    if (error.response && error.response.data && error.response.data.errors) {
      errorMsg = error.response.data.errors;
    } else if (
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      errorMsg.general = error.response.data.message;
    } else {
      errorMsg.general = error.message || "An unknown error occurred.";
    }
    return errorMsg;
  }

  // Function to check if any form fields have changed
  function checkForChanges() {
    // Compare current values with original values
    const currentData = {
      phone: phoneInput.value,
      address: {
        street: streetInput.value,
        city: cityInput.value,
        state: stateInput.value,
        zipCode: zipCodeInput.value,
        country: countryInput.value,
      },
    };

    // Check if password fields are filled
    const passwordChanged =
      currentPasswordInput.value.length > 0 ||
      newPasswordInput.value.length > 0;

    // Compare phone
    if (currentData.phone !== originalEmployeeData.phone) {
      return true;
    }

    // Compare address fields
    const originalAddress = originalEmployeeData.employeeBio.address;
    for (let field in currentData.address) {
      if (currentData.address[field] !== originalAddress[field]) {
        return true;
      }
    }

    // Check if password fields are filled
    if (passwordChanged) {
      return true;
    }

    return false; // No changes detected
  }
}
