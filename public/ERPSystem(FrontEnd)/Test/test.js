import { fetchHandler } from "../helper/fetchHandler.js";
import { urlObject } from "../helper/urls.js";
import { sessionObject } from "../helper/sessionStorage.js";

async function testFunc() {
  try {
    const loggedInEmployeeId = sessionObject.getData("employee").employeeID;
    const userUpdatedInfo = {
      phone: "6313341234",
      address: {
        street: "9123 garden st",
        city: "example town",
        state: "NY",
        zipCode: "12345",
        country: "USA",
      },
    };

    const requestInformation = {
      url: urlObject.updateLoggedInEmployeeInfo + loggedInEmployeeId,
      method: fetchHandler.methods.patch,
      data: userUpdatedInfo,
    };

    const data = await fetchHandler.sendRequest(requestInformation);
    console.log(data);
    alert(data.message);

    // fetchHandler.sendRequest();
  } catch (error) {
    alert(error.message);
  }
}

testFunc();
