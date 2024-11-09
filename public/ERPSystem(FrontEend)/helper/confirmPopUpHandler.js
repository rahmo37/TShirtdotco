// Load the error popup modal

export const confirmPopUp = {};
confirmPopUp.loadModal = async function (popUpLocation) {
  try {
    const response = await fetch(popUpLocation);
    if (!response.ok) {
      throw new Error("Failed to load the modal");
    }
    const modalHTML = await response.text();
    const modalWrapper = document.createElement("div");
    modalWrapper.innerHTML = modalHTML;
    document.getElementById("modalContainer").appendChild(modalWrapper);
  } catch (err) {
    console.error("Error loading modal:", err);
  }
};

// Show the error modal with a specific message
confirmPopUp.showConfirmModal = function (message, callback) {
  // Set the error message inside the modal
  const confirmMessage = document.querySelector(".confirmMessage");
  confirmMessage.innerHTML = message;

  // Show the modal using Bootstrap's modal methods
  const confirmModal = new bootstrap.Modal(
    document.getElementById("confirmModal")
  );
  confirmModal.show();

  // Get the confirm button and add a click event listener
  const confirmButton = document.getElementById("confirmAction");

  // Clear any previous event listeners to prevent duplicate triggers
  confirmButton.onclick = function () {
    callback(); // Execute the confirmation callback
    confirmModal.hide(); // Hide the modal
  };
};
