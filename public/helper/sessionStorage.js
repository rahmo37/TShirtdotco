// This module saves the data in session storage
export const sessionObject = {};

// Function to set data in session storage
sessionObject.setData = function (key, value) {
  const stringValue = JSON.stringify(value); // Only stringify the value
  sessionStorage.setItem(key, stringValue); // Key remains a string
};

// Function to get data from session storage
sessionObject.getData = function (key) {
  const storedValue = sessionStorage.getItem(key);
  if (!storedValue) {
    return null; // Return null if key doesn't exist
  }
  return JSON.parse(storedValue); // Parse the stored JSON string
};

// Function to remove specific data from session storage
sessionObject.removeData = function (key) {
  sessionStorage.removeItem(key);
};

// Clear storage
sessionObject.clearStorage = function () {
  sessionStorage.clear();
};
