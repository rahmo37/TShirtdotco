// Load the success popup modal
export const successPopUp = {};
successPopUp.isOpen = false;

successPopUp.loadModal = async function (location) {
  try {
    const response = await fetch(location);
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

// Show the success modal with a specific message
successPopUp.showSuccessModal = function (message, callback) {
  if (successPopUp.isOpen) {
    return; // Prevent multiple modals from appearing
  }

  // Set the success message inside the modal
  const successMessage = document.getElementById("successMessage");
  successMessage.innerHTML = message;

  // Show the modal using Bootstrap's modal methods
  const successModalElement = document.getElementById("successModal");
  const successModal = new bootstrap.Modal(successModalElement);
  successModal.show();

  // Set the modal as open
  successPopUp.isOpen = true;

  // Listen for the modal to be fully hidden, then reset the flag
  successModalElement.addEventListener(
    "hidden.bs.modal",
    () => {
      successPopUp.isOpen = false;
    },
    { once: true }
  );

  if (callback) {
    const successCloser = document.getElementById("success-popup-close");

    successCloser.addEventListener(
      "click",
      () => {
        callback();
      },
      { once: true }
    );
  }
};

// Show the success modal and redirect after it closes
successPopUp.showSuccessModalAndRedirect = function (message, location) {
  if (successPopUp.isOpen) {
    return; // Prevent multiple modals from appearing
  }

  // Set the success message and show the modal
  successPopUp.showSuccessModal(message);

  // Reference the modal element and add the close event listener
  const successModalElement = document.getElementById("successModal");
  successModalElement.addEventListener(
    "hidden.bs.modal",
    function () {
      // Redirect after the modal closes
      window.location.href = location;
    },
    { once: true }
  );
};
