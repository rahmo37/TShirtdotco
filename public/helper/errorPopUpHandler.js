// Load the error popup modal
export const errorPopUp = {};
errorPopUp.isOpen = false;

errorPopUp.loadModal = async function (popUpLocation) {
  try {
    const response = await fetch(popUpLocation);
    if (!response.ok) {
      throw new Error("Failed to load the error modal");
    }
    const modalHTML = await response.text();
    const modalWrapper = document.createElement("div");
    modalWrapper.innerHTML = modalHTML;
    document.getElementById("modalContainer").appendChild(modalWrapper);
  } catch (err) {
    console.error("Error loading error modal:", err);
  }
};

// Show the error modal with a specific message
errorPopUp.showErrorModal = function (message, callback) {
  if (errorPopUp.isOpen) {
    return; // Prevent multiple modals from appearing
  }

  // Ensure modal is loaded, if not, call loadModal first
  if (!document.getElementById("errorModal")) {
    console.warn("Error modal not loaded. Loading it now...");
    errorPopUp.loadModal("/path/to/your/errorModal.html").then(() => {
      errorPopUp.showErrorModal(message, callback); // Call again after loading
    });
    return;
  }

  // Set the error message inside the modal
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.textContent = message;

  // Show the modal using Bootstrap's modal methods
  const errorModalElement = document.getElementById("errorModal");
  const errorModal = new bootstrap.Modal(errorModalElement);
  errorModal.show();

  // Set the modal as open to prevent duplicates
  errorPopUp.isOpen = true;

  // Listen for the modal to be fully hidden, then reset the flag
  errorModalElement.addEventListener(
    "hidden.bs.modal",
    () => {
      errorPopUp.isOpen = false;
    },
    { once: true }
  );

  // Optionally execute a callback when the modal is closed
  if (callback) {
    const errorCloser = document.getElementById("error-popup-close");

    errorCloser.addEventListener(
      "click",
      () => {
        callback();
      },
      { once: true }
    );
  }
};
