// Load the info popup modal
export const infoPopUp = {};
infoPopUp.isOpen = false;

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
infoPopUp.showInfoModal = function (message, callback) {
  if (infoPopUp.isOpen) {
    return; // Prevent multiple modals from appearing
  }

  // Set the info message inside the modal
  const infoMessage = document.getElementById("infoMessage");
  infoMessage.textContent = message;

  // Show the modal using Bootstrap's modal methods
  const infoModalElement = document.getElementById("infoModal");
  const infoModal = new bootstrap.Modal(infoModalElement);
  infoModal.show();

  infoPopUp.isOpen = true;

  // Listen for the modal to be fully hidden, then reset the flag
  infoModalElement.addEventListener(
    "hidden.bs.modal",
    () => {
      infoPopUp.isOpen = false;
    },
    { once: true }
  );

  if (callback) {
    const infoCloser = document.getElementById("info-popup-close");
    infoCloser.addEventListener(
      "click",
      () => {
        callback();
      },
      { once: true }
    );
  }
};
