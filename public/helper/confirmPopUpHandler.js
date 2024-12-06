// Load the confirm popup modal
export const confirmPopUp = {};
confirmPopUp.isOpen = false;

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

// Show the confirm modal with a specific message
confirmPopUp.showConfirmModal = function (message, callback) {
  if (confirmPopUp.isOpen) {
    return; // Prevent multiple modals from appearing
  }

  // Set the confirm message inside the modal
  const confirmMessage = document.querySelector(".confirmMessage");
  confirmMessage.innerHTML = message;

  // Show the modal using Bootstrap's modal methods
  const confirmModalElement = document.getElementById("confirmModal");
  const confirmModal = new bootstrap.Modal(confirmModalElement);
  confirmModal.show();

  // Set the modal as open
  confirmPopUp.isOpen = true;

  // Get the confirm button and add a click event listener
  const confirmButton = document.getElementById("confirmAction");

  // Clear any previous event listeners to prevent duplicate triggers
  confirmButton.onclick = function () {
    callback(); // Execute the confirmation callback
    confirmModal.hide(); // Hide the modal
  };

  // Listen for the modal to be fully hidden, then reset the flag
  confirmModalElement.addEventListener(
    "hidden.bs.modal",
    () => {
      confirmPopUp.isOpen = false;
    },
    { once: true }
  );
};
