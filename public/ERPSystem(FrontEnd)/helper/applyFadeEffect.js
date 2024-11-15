export function applyFadeEffect(loadFunction, contentArea) {
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
}
