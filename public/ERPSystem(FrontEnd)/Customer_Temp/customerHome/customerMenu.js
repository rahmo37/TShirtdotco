// Toggle Button for Sidebar
const hamBurger = document.querySelector(".toggle-btn");
const sideBar = document.querySelector("#sidebar");
const contentArea = document.getElementById("outer-main-container");

// Toggle sidebar expansion
hamBurger.addEventListener("click", function () {
  sideBar.classList.toggle("expand");
});

// Close the sidebar when a link is clicked (if sidebar is expanded)
document.querySelectorAll(".sidebar-link").forEach(link => {
  link.addEventListener("click", () => {
    sideBar.classList.remove("expand");
  });
});

// Optional: Fade-in and fade-out effect for content loading (if required)
function applyFadeEffect(loadFunction) {
  // Add fade-out class to initiate fade-out transition
  contentArea.classList.add("fade-out");

  // Event handler for when fade-out transition ends
  function onFadeOutEnd(event) {
    if (event.target !== contentArea || event.propertyName !== "opacity")
      return;
    contentArea.removeEventListener("transitionend", onFadeOutEnd);

    // Load new content if loadFunction is provided
    if (typeof loadFunction === "function") {
      loadFunction();
    }

    // Remove fade-out class and add fade-in class to initiate fade-in transition
    contentArea.classList.remove("fade-out");
    contentArea.classList.add("fade-in");

    // Listen for fade-in transition end to clean up
    contentArea.addEventListener("transitionend", onFadeInEnd);
  }

  // Event handler for when fade-in transition ends
  function onFadeInEnd(event) {
    if (event.target !== contentArea || event.propertyName !== "opacity")
      return;
    contentArea.removeEventListener("transitionend", onFadeInEnd);

    // Remove fade-in class
    contentArea.classList.remove("fade-in");
  }

  // Listen for fade-out transition end
  contentArea.addEventListener("transitionend", onFadeOutEnd);

  async function getAdminInventory() {
    try {
      const requestInfo = {
        url: "http://localhost:3001/api/shared/inventory/",
        method: fetchHandler.methods.get,
      };

      const data = await fetchHandler.sendRequest(requestInfo);
      inventoryData = data.data; // Store inventory data
      renderInventory(inventoryData);
    } catch (error) {
      console.error("Error fetching admin inventory:", error.message);
    }
  }

  
}
