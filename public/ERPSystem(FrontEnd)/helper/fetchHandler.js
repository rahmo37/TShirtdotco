// This function sends HTTP requests, handles any error, if no error sends the data
import { sessionObject } from "./sessionStorage.js";

export const fetchHandler = {};

fetchHandler.sendRequest = async function (requestInfo) {
  const url = requestInfo.url;
  const requestsWithBody = ["PUT", "POST"];

  const token = sessionObject.getData("token");
  if (!token && !requestInfo.registering) {
    console.error("No token found, user must first login to receive one");
    const err = new Error("You must first login");
    err.status = 500;
    throw err;
  }

  // Setting up the request object
  const method = requestInfo.method ? requestInfo.method.toUpperCase() : "GET";
  const request = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Adding the request body and headers if data is provided
  if (requestInfo.data) {
    request.body = JSON.stringify(requestInfo.data);
    request.headers["Content-Type"] = "application/json";
  }

  try {
    // Ensuring methods that require a body have one
    if (requestsWithBody.includes(method) && !request.body) {
      console.error("This method must include a body");
      const err = new Error("Internal server error");
      err.status = 500;
      throw err;
    }

    // Making the HTTP request
    const response = await fetch(url, request);

    // Handling non-OK responses
    if (!response.ok) {
      let errorMessage = "Internal Server Error";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error.message || errorMessage;
      } catch (e) {
        // Response is not JSON or has no message
      }
      throw {
        status: response.status,
        message: errorMessage,
      };
    }

    // Parsing the response data
    let responseData;
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Returning the successful response data
    return responseData;
  } catch (error) {
    // Print it in the console for debugging
    console.error(error.message);

    // Propagating known errors
    if (error.status && error.message) {
      throw error;
    }

    // Handling unexpected errors
    throw {
      status: 500,
      message: "Network or Internal server error occurred",
    };
  }
};

// HTTP methods to ensure consistency across the codebase
fetchHandler.methods = {
  post: "POST",
  put: "PUT",
  get: "GET",
  patch: "PATCH",
};
