// Load the success popup modal
export const successPopUp = {};

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
successPopUp.showSuccessModal = function (message) {
  // Set the success message inside the modal
  const successMessage = document.getElementById("successMessage");
  successMessage.textContent = message;

  // Show the modal using Bootstrap's modal methods
  const successModal = new bootstrap.Modal(
    document.getElementById("successModal")
  );
  successModal.show();
};

// Show the success modal and redirect after it closes
successPopUp.showSuccessModalAndRedirect = function (message, location) {
  // Set the success message and show the modal
  successPopUp.showSuccessModal(message);

  // Reference the modal element and add the close event listener
  const successModalElement = document.getElementById("successModal");
  successModalElement.addEventListener("hidden.bs.modal", function () {
    // Redirect after the modal closes
    window.location.href = location;
  });
};
