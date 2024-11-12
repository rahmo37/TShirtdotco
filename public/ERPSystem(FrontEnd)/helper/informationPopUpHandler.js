// Load the info popup modal
export const infoPopUp = {};
infoPopUp.loadModal = async function (popUpLocation) {
  try {
    const response = await fetch(popUpLocation);
    if (!response.ok) {
      throw new Error("Failed to load the info modal");
    }
    const modalHTML = await response.text();
    const modalWrapper = document.createElement("div");
    modalWrapper.innerHTML = modalHTML;
    document.getElementById("modalContainer").appendChild(modalWrapper);
  } catch (err) {
    console.error("Error loading info modal:", err);
  }
};

// Show the info modal with a specific message
infoPopUp.showInfoModal = function (message) {
  // Set the info message inside the modal
  const infoMessage = document.getElementById("infoMessage");
  infoMessage.textContent = message;

  // Show the modal using Bootstrap's modal methods
  const infoModal = new bootstrap.Modal(document.getElementById("infoModal"));
  infoModal.show();
};
