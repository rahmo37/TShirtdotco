// This module sets up a timer to log out the user when the JWT token expires
export function startLogOutTimer(callback) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("No token found in session storage. User is likely logged out.");
    return;
  }

  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    alert("Invalid token format. Expected JWT with three parts.");
    return;
  }

  const base64Payload = tokenParts[1];
  let decodedPayload;

  try {
    decodedPayload = JSON.parse(atob(base64Payload));
  } catch (error) {
    alert("Failed to decode JWT payload timer could not be started:", error);
    return;
  }

  const expirationTime = decodedPayload.exp * 1000; // Convert expiration from seconds to milliseconds
  const timeUntilExpiration = expirationTime - Date.now();

  if (timeUntilExpiration <= 0) {
    console.log("Token is already expired. Logging out immediately.");
    callback;
  } else {
    console.log(
      `Token expires in ${(timeUntilExpiration / 1000).toFixed(0)} seconds`
    );
    setTimeout(callback, timeUntilExpiration);
  }
}
