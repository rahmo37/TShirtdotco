// This module contains the logic for the validation code.
// It validates the fields, provides appropriate error messages to the user, and creates a customer account.

// Import the necessary modules
import { validateObject } from "../helper/validation.js";
import { fetchHandler } from "../helper/fetchHandler.js";
import { urlObject } from "../helper/urls.js";
import { errorPopUp } from "../helper/errorPopUpHandler.js";
import { successPopUp } from "../helper/successPopupHandler.js";

// load the error modal
window.onload = async () => {
  // Load the success modal once when the page loads
  await successPopUp.loadModal("../popups/successPopup.html");

  // Load the error modal once when the page loads
  await errorPopUp.loadModal("../popups/errorPopup.html");
};

// Variables to store user input
let firstName = "";
let lastName = "";
let gender = "";
let address = "";
let city = "";
let country = "";
let password = "";
let email = "";
let phone = "";

// Carousel function variables
let currentSlide = 0;
let isTransitioning = false; // Track if a slide transition is in progress

// Define the buttons
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");

// Add event listeners
nextBtn.addEventListener("click", handleNextButton);
backBtn.addEventListener("click", prevSlide);

// Function to handle the next button click
function handleNextButton() {
  const carouselElement = document.querySelector("#cardCarousel");
  const totalSlides =
    carouselElement.querySelectorAll(".carousel-item").length - 1;

  if (currentSlide === totalSlides) {
    // If on the last slide, attempt to register the user
    if (!hasErrors(currentSlide)) {
      registerUser();
    }
  } else {
    // Otherwise, proceed to the next slide
    nextSlide();
  }
}

function nextSlide() {
  // Prevent advancing to the next slide if transitioning or if there are input field errors
  if (isTransitioning) {
    return;
  }

  if (hasErrors(currentSlide)) {
    return;
  }

  // Correct carousel element
  const carouselElement = document.querySelector("#cardCarousel");

  // Check if the carousel already exists, and if it doesn’t, create one
  const carousel =
    bootstrap.Carousel.getInstance(carouselElement) ||
    new bootstrap.Carousel(carouselElement);

  // Get the total number of slides (zero-based index)
  const totalSlides =
    carouselElement.querySelectorAll(".carousel-item").length - 1;

  // Disable buttons during transition
  disableButtons();

  // Move to the next slide
  if (currentSlide < totalSlides) {
    carousel.next();
    currentSlide++;
  }

  // Update back button text if not on the first slide
  if (currentSlide > 0) {
    backBtn.textContent = "Back";
  }

  // Update next button text if on the last slide
  if (currentSlide === totalSlides) {
    nextBtn.textContent = "Register";
  } else {
    nextBtn.textContent = "Next";
  }

  // Re-enable buttons after transition
  setTimeout(enableButtons, 700); // Adjusted for the carousel transition duration
}

function prevSlide() {
  if (isTransitioning) return; // Prevent multiple clicks during transition

  const carouselElement = document.querySelector("#cardCarousel");
  const carousel =
    bootstrap.Carousel.getInstance(carouselElement) ||
    new bootstrap.Carousel(carouselElement);
  const totalSlides =
    carouselElement.querySelectorAll(".carousel-item").length - 1;

  // Disable buttons during transition
  disableButtons();

  // Move to the previous slide
  if (currentSlide > 0) {
    carousel.prev();
    currentSlide--;
    if (currentSlide === 0) {
      backBtn.textContent = "Go Back";
    }
  } else {
    window.location.href = "../Login/login.html"; // Redirect on the first slide
  }

  // Update next button text if not on the last slide
  if (currentSlide < totalSlides) {
    nextBtn.textContent = "Next";
  }

  // Re-enable buttons after transition
  setTimeout(enableButtons, 700); // Adjust to match the carousel transition duration
}

// Disable the next and back buttons
function disableButtons() {
  isTransitioning = true;
  nextBtn.disabled = true;
  backBtn.disabled = true;
}

// Enable the next and back buttons
function enableButtons() {
  isTransitioning = false;
  nextBtn.disabled = false;
  backBtn.disabled = false;
}

// Helper functions

// Add an error class
function addErrClass(elem) {
  elem.classList.add("is-invalid");
  elem.classList.remove("is-valid");
  elem.setAttribute("aria-invalid", "true");
}

// Remove error class
function removeErrClass(elem) {
  elem.classList.remove("is-invalid");
  elem.classList.add("is-valid");
  elem.setAttribute("aria-invalid", "false");
}

// Set error message
function setErrMessage(elem, message) {
  elem.textContent = message;
}

// Clear all error messages and classes on the current slide
function clearErrorsOnSlide(slideNumber) {
  const inputs = getInputsOnSlide(slideNumber);
  inputs.forEach(({ input, errorElem }) => {
    removeErrClass(input);
    setErrMessage(errorElem, "");
  });
}

// Get all inputs and their corresponding error elements on the current slide
function getInputsOnSlide(slideNumber) {
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const genderInput = document.getElementById("gender");
  const addressInput = document.getElementById("address");
  const cityInput = document.getElementById("city");
  const countryInput = document.getElementById("country");
  const passwordInput = document.getElementById("password");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const confirmPasswordInput = document.getElementById("confirm-password");

  const firstNameErr = document.getElementById("firstname-err");
  const lastNameErr = document.getElementById("lastname-err");
  const genderErr = document.getElementById("gender-err");
  const addressErr = document.getElementById("address-err");
  const cityErr = document.getElementById("city-err");
  const countryErr = document.getElementById("country-err");
  const emailErr = document.getElementById("email-err");
  const phoneErr = document.getElementById("phone-err");
  const passwordErr = document.getElementById("password-err");
  const confirmPasswordErr = document.getElementById("confirm-password-err");

  if (slideNumber === 0) {
    return [
      { input: firstNameInput, errorElem: firstNameErr },
      { input: lastNameInput, errorElem: lastNameErr },
      { input: genderInput, errorElem: genderErr },
    ];
  }

  if (slideNumber === 1) {
    return [
      { input: addressInput, errorElem: addressErr },
      { input: cityInput, errorElem: cityErr },
      { input: countryInput, errorElem: countryErr },
    ];
  }

  if (slideNumber === 2) {
    return [
      { input: emailInput, errorElem: emailErr },
      { input: phoneInput, errorElem: phoneErr },
    ];
  }

  if (slideNumber === 3) {
    return [
      { input: passwordInput, errorElem: passwordErr },
      { input: confirmPasswordInput, errorElem: confirmPasswordErr },
    ];
  }

  return [];
}

// Add event listeners to inputs to remove error class on input
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      removeErrClass(input);
      const errorElem = document.getElementById(`${input.id}-err`);
      if (errorElem) {
        setErrMessage(errorElem, "");
      }
    });
  });
});

function hasErrors(slideNumber) {
  // Clear previous errors on the current slide
  clearErrorsOnSlide(slideNumber);

  const inputsWithErrors = getInputsOnSlide(slideNumber);

  for (let { input, errorElem } of inputsWithErrors) {
    const value = input.value.trim();

    // Validation logic based on input id
    switch (input.id) {
      case "firstName":
      case "lastName":
        if (validateObject.isFalsy(value)) {
          setErrMessage(errorElem, "Please fill out this field.");
          addErrClass(input);
          return true; // Stop validation after the first error
        } else if (!validateObject.checkNames(value)) {
          setErrMessage(
            errorElem,
            "Please enter a valid name using letters only."
          );
          addErrClass(input);
          return true;
        } else {
          removeErrClass(input);
          if (input.id === "firstName") firstName = value;
          else lastName = value;
        }
        break;

      case "gender":
        if (validateObject.isFalsy(value)) {
          setErrMessage(errorElem, "Please select your gender.");
          addErrClass(input);
          return true;
        } else {
          removeErrClass(input);
          gender = value;
        }
        break;

      case "address":
        if (validateObject.isFalsy(value)) {
          setErrMessage(errorElem, "Please fill out this field.");
          addErrClass(input);
          return true;
        } else if (!validateObject.checkStreetAddress(value)) {
          setErrMessage(errorElem, "Invalid address.");
          addErrClass(input);
          return true;
        } else {
          removeErrClass(input);
          address = value;
        }
        break;

      case "city":
      case "country":
        if (validateObject.isFalsy(value)) {
          setErrMessage(errorElem, "Please fill out this field.");
          addErrClass(input);
          return true;
        } else if (!validateObject.checkCityOrCountry(value)) {
          setErrMessage(
            errorElem,
            `Invalid ${input.id === "city" ? "city" : "country"}.`
          );
          addErrClass(input);
          return true;
        } else {
          removeErrClass(input);
          if (input.id === "city") city = value;
          else country = value;
        }
        break;

      case "email":
        if (validateObject.isFalsy(value)) {
          setErrMessage(errorElem, "Please fill out this field.");
          addErrClass(input);
          return true;
        } else if (!validateObject.checkEmailFormat(value)) {
          setErrMessage(errorElem, "Invalid email format.");
          addErrClass(input);
          return true;
        } else {
          removeErrClass(input);
          email = value;
        }
        break;

      case "phone":
        if (validateObject.isFalsy(value)) {
          setErrMessage(errorElem, "Please fill out this field.");
          addErrClass(input);
          return true;
        } else if (!validateObject.checkPhoneNumber(value)) {
          setErrMessage(errorElem, "Must be exactly 10 digits.");
          addErrClass(input);
          return true;
        } else {
          removeErrClass(input);
          phone = value;
        }
        break;

      case "password":
        if (validateObject.isFalsy(value)) {
          setErrMessage(errorElem, "Please fill out this field.");
          addErrClass(input);
          return true;
        } else if (!validateObject.checkPassword(value)) {
          setErrMessage(errorElem, "Invalid format: pass1P&");
          addErrClass(input);
          return true;
        } else {
          removeErrClass(input);
          password = value;
        }
        break;

      case "confirm-password":
        if (!validateObject.matchPassword(password, value)) {
          setErrMessage(errorElem, "Passwords don't match.");
          addErrClass(input);
          return true;
        } else {
          removeErrClass(input);
        }
        break;

      default:
        break;
    }
  }

  return false; // No errors found
}

async function registerUser() {
  // Final validation on the last slide
  if (hasErrors(currentSlide)) {
    return;
  }

  try {
    // Create the user object
    const newUser = {
      email,
      phone,
      password,
      customerBio: {
        firstName,
        lastName,
        address: {
          street: address,
          city,
          country,
        },
        gender,
      },
    };

    // Gather request info
    const requestInformation = {
      url: urlObject.createCustomer,
      method: fetchHandler.methods.post,
      data: newUser,
      registering : true
    };

    // Make the request using the fetchHandler module
    const data = await fetchHandler.sendRequest(requestInformation);

    // If successful data is sent
    if (data) {
      successPopUp.showSuccessModalAndRedirect(
        "Account created successfully",
        "../Login/login.html"
      );
    }
  } catch (error) {
    // If the error is 409 that means there was a conflict
    if (error.status === 409) {
      errorPopUp.showErrorModal(
        "A customer with this email or phone number already exists"
      );
    } else {
      // Otherwise we send the actual error
      errorPopUp.showErrorModal(`Error: ${error.message}`);
    }
  }
}
