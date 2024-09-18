// Error Handler for errors

module.exports = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
};

//! Error list for reference
// 1xx: Informational Responses
// 100 - Continue: The server has received the request headers and the client should proceed to send the body.
// 101 - Switching Protocols: The requester has asked the server to switch protocols, and the server is acknowledging that it will do so.
// 2xx: Success
// 200 - OK: The request was successful.
// 201 - Created: The request was successful, and a new resource was created as a result.
// 204 - No Content: The request was successful, but there is no content to send in the response.
// 3xx: Redirection
// 301 - Moved Permanently: The requested resource has been permanently moved to a new URL.
// 302 - Found: The requested resource is temporarily located at a different URL.
// 304 - Not Modified: The resource has not been modified since the last request.
// 4xx: Client Errors
// 400 - Bad Request: The request is invalid or cannot be understood by the server (e.g., malformed JSON).
// 401 - Unauthorized: The request requires authentication, but it is either missing or invalid (e.g., invalid token).
// 403 - Forbidden: The client does not have permission to access the resource, even if authenticated.
// 404 - Not Found: The requested resource could not be found on the server.
// 409 - Conflict: The request could not be processed because of a conflict in the current state of the resource (e.g., duplicate data).
// 422 - Unprocessable Entity: The server understands the content type and syntax, but cannot process the request (e.g., validation errors).
// 429 - Too Many Requests: The user has sent too many requests in a given amount of time (rate limiting).
// 5xx: Server Errors
// 500 - Internal Server Error: A generic error occurred on the server, and it cannot fulfill the request.
// 501 - Not Implemented: The server does not recognize the request method or lacks the ability to fulfill it.
// 503 - Service Unavailable: The server is currently unavailable, usually due to being overloaded or down for maintenance.
