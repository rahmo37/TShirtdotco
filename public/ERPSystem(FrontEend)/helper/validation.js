// this module validates all the fields

// object that accumulate the validate functions
export const validateObject = {};

// check if the value is empty string, null, undefined etc.
validateObject.isFalsy = function (value) {
  return !value;
};

// check the format of the email
validateObject.checkEmailFormat = function (value) {
  if (
    !(value.indexOf(".") > 0 && value.indexOf("@") > 0) ||
    /[^a-zA-Z0-9.@_-]/.test(value)
  ) {
    return false;
  } else {
    return true;
  }
};

// check the format of the password
validateObject.checkPassword = function checkPasswordFormat(value) {
  const hasUpperCase = /[A-Z]/.test(value); // Checks if the password has uppercase characters
  const hasLowerCase = /[a-z]/.test(value); // Checks if the password has lowercase characters
  const hasNumber = /[0-9]/.test(value); // Checks if the password has numbers

  const length = value.length >= 6;

  return hasUpperCase && hasLowerCase && hasNumber && length;
};

// check password with confirm password
validateObject.matchPassword = function (p1, p2) {
  return p1 === p2;
};

// check the street address format
validateObject.checkStreetAddress = function (value) {
  const addressPattern = /[0-9]/;
  return addressPattern.test(value.trim());
};

// check city and country
validateObject.checkCityOrCountry = function (value) {
  // Pattern to allow only alphabetic characters and spaces
  const locationPattern = /^[A-Za-z\s]+$/;

  // Check if the value matches the pattern, is not empty, and trimmed of any extra whitespace
  return locationPattern.test(value.trim());
};

// Check if the value is not empty, doesn't contain spaces, and has only alphabetic characters
validateObject.checkNames = function (value) {
  return /^[A-Za-z]+$/.test(value.trim());
};

// Check the phone number
validateObject.checkPhoneNumber = function (value) {
  // Pattern to allow only 10 digits
  const phonePattern = /^\d{10}$/;

  // Check if the value matches the pattern
  return phonePattern.test(value.trim());
};
