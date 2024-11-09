// Importing necessary modules
import { fetchHandler } from "./fetchHandler.js";
import { errorPopUp } from "./errorPopUpHandler.js";

// Object to accumulate the loader function
export const loader = {};

// Load HTML dynamically, removing previous content in targetElement
loader.loadHTML = async (url, targetElement) => {
  try {
    // Clear previous HTML content
    targetElement.innerHTML = "";

    const requestObj = {
      method: fetchHandler.methods.get,
      url,
    };
    const html = await fetchHandler.sendRequest(requestObj);
    targetElement.innerHTML = html;
  } catch (error) {
    errorPopUp.showErrorModal("Failed to load HTML:", error);
  }
};

// Load CSS dynamically, keeping essential CSS files intact
loader.loadCSS = async (url) => {
  // Remove previous dynamically loaded CSS
  loader.removeCss();

  return new Promise((resolve, reject) => {
    const timestamp = new Date().getTime(); // Generate a unique timestamp
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${url}?t=${timestamp}`; // Append timestamp to URL
    link.setAttribute("data-dynamic", "true"); // Mark as dynamically loaded

    link.onload = () => {
      resolve();
    };

    link.onerror = () => {
      errorPopUp.showErrorModal("Failed to load CSS:", link.href);
      reject(new Error(`Failed to load CSS: ${link.href}`));
    };

    document.head.appendChild(link);
  });
};

// Load JavaScript dynamically, keeping essential JS files intact
loader.loadJS = async (url) => {
  // Remove previous dynamically loaded JavaScript
  loader.removeJs();

  return new Promise((resolve, reject) => {
    const timestamp = new Date().getTime(); // Generate a unique timestamp
    const script = document.createElement("script");
    script.src = `${url}?t=${timestamp}`; // Append timestamp to URL
    script.async = true;
    script.type = "module";
    script.setAttribute("data-dynamic", "true"); // Mark as dynamically loaded

    script.onload = () => {
      resolve("");
    };

    script.onerror = () => {
      errorPopUp.showErrorModal("Failed to load script:", script.src);
      reject(new Error(`Failed to load script: ${script.src}`));
    };

    document.body.appendChild(script);
  });
};

// Example function to load entire page content
loader.loadPageContent = async (data) => {
  try {
    // Load CSS first to apply styles
    await loader.loadCSS(data.cssUrl);

    // Load HTML content next
    await loader.loadHTML(data.htmlUrl, data.targetElement);

    // Finally, load JavaScript for interaction
    await loader.loadJS(data.jsUrl);
  } catch (error) {
    errorPopUp.showErrorModal("Error loading page content:", error);
  }
};

loader.removeCss = async () => {
  document
    .querySelectorAll('link[data-dynamic="true"]')
    .forEach((link) => link.remove());
};

loader.removeJs = async () => {
  document
    .querySelectorAll('script[data-dynamic="true"]')
    .forEach((script) => script.remove());
};
