// Load the error popup modal

export const errorPopUp = {};
errorPopUp.loadModal = async function (popUpLocation) {
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
errorPopUp.showErrorModal = function (message) {
  // Set the error message inside the modal
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.textContent = message;
  
  // Show the modal using Bootstrap's modal methods
  const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
  errorModal.show();
};