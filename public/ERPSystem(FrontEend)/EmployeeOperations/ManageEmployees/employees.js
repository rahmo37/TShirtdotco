// Importing the fetchHandler module
import { fetchHandler } from "../../helper/fetchHandler.js";
import { urlObject } from "../../helper/urls.js";
import { errorPopUp } from "../../helper/errorPopUpHandler.js";
import { successPopUp } from "../../helper/successPopupHandler.js";
import { confirmPopUp } from "../../helper/confirmPopUpHandler.js";
import { filterTable } from "../../helper/searchTable.js";

(function () {
  const employeeTableContainer = document.getElementById("table-container");
  const addEmployeeBtn = document.getElementById("add-new-btn");
  const modal = document.getElementById("employee-modal");
  const modalContent = document.getElementById("modal-content-employee");
  const closeModalBtn = document.getElementById("close-employeeDetail-modal");
  const modalOverlay = document.getElementById("custom-modal-overlay");
  const addEmployeeModal = document.getElementById("add-employee-modal");
  const closeAddEmployeeModalBtn = document.getElementById(
    "close-add-employee-modal"
  );
  const addEmployeeModalOverlay = document.getElementById(
    "add-employee-modal-overlay"
  );
  const employeeForm = document.getElementById("new-employee-form");
  const searchInput = document.getElementById("searchInput");

  getEmployeeList();

  //////////////// Functions for communication with server //////////////

  // Fetch employee list from server
  async function getEmployeeList() {
    try {
      const requestInfo = {
        url: urlObject.getEmployee,
        method: fetchHandler.methods.get,
      };

      const data = await fetchHandler.sendRequest(requestInfo);
      renderEmployeeList(data);

      const searchInput = document.getElementById("searchInput");
      searchInput.addEventListener("input", () => {
        filterTable();
      });
    } catch (error) {
      errorPopUp.showErrorModal(error.message);
    }
  }

  // Function to add a new employee
  async function addEmployee(employeeData) {
    try {
      const requestInfo = {
        url: urlObject.addEmployee,
        method: fetchHandler.methods.post,
        data: employeeData,
      };

      const data = await fetchHandler.sendRequest(requestInfo);
      successPopUp.showSuccessModal(data.message);
    } catch (error) {
      errorPopUp.showErrorModal(error.message);
    }
  }

  // Update employee information
  async function updateEmployeeData(employeeID, updatedData) {
    try {
      const requestInfo = {
        url: urlObject.updateEmployee + employeeID,
        method: fetchHandler.methods.put,
        data: updatedData,
      };

      const data = await fetchHandler.sendRequest(requestInfo);
      successPopUp.showSuccessModal(data.message);
    } catch (error) {
      errorPopUp.showErrorModal(error.message);
    }
  }

  //////////////////////////////////////////////////////////////////////

  // Render employee list in table
  function renderEmployeeList(data) {
    employeeTableContainer.innerHTML = "";

    const table = document.createElement("table");
    table.id = "dataTable";
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
      <th>Employee ID</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Email</th>
      <th>Phone</th>
      <th>Job Title</th>
      <th>Department</th>
      <th>Account Status</th>
      <th>Admin</th>
    `;
    table.appendChild(headerRow);

    data.data.forEach((employee) => {
      const employeeRow = document.createElement("tr");
      employeeRow.innerHTML = `
        <td>${employee.employeeID}</td>
        <td>${employee.employeeBio.firstName}</td>
        <td>${employee.employeeBio.lastName}</td>
        <td>${employee.email}</td>
        <td>${employee.phone}</td>
        <td>${employee.workInfo.jobTitle}</td>
        <td>${employee.workInfo.department}</td>
        <td>${employee.accountStatus}</td>
        <td>${employee.isAdmin ? "YES" : "NO"}</td>
      `;

      employeeRow.addEventListener("click", () => {
        openEmployeeModal(employee);
      });

      table.appendChild(employeeRow);
    });

    employeeTableContainer.appendChild(table);
  }

  // Open employee details modal
  function openEmployeeModal(employee) {
    const formattedHireDate = formatDate(employee.workInfo.hireDate);

    modalContent.innerHTML = `
      <h2>${employee.employeeBio.firstName} ${
      employee.employeeBio.lastName
    }</h2>
      <form id="edit-employee-form">
        <label for="employeeId">Employee ID:</label>
        <input type="text" id="employeeId" name="employeeId" value="${
          employee.employeeID
        }" readonly>

        <div class="multiple-input-fields">
          <div>
            <label for="firstName">First Name:</label>
            <input type="text" id="firstName" name="firstName" value="${
              employee.employeeBio.firstName
            }" required>
          </div>
          <div>
            <label for="lastName">Last Name:</label>
            <input type="text" id="lastName" name="lastName" value="${
              employee.employeeBio.lastName
            }" required>
          </div>
        </div>

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" value="${
          employee.email
        }" readonly>

        <label for="phone">Phone:</label>
        <input type="tel" id="phone" name="phone" value="${
          employee.phone
        }" required>

        <label for="jobTitle">Job Title:</label>
        <input type="text" id="jobTitle" name="jobTitle" value="${
          employee.workInfo.jobTitle
        }" readonly>

        <label for="department">Department:</label>
        <input type="text" id="department" name="department" value="${
          employee.workInfo.department
        }" readonly>

        <label for="hireDate">Hire Date:</label>
        <input type="text" id="hireDate" name="hireDate" value="${formattedHireDate}" readonly>

        <label for="account-status">Account Status:</label>
        <select id="account-status" name="account-status">
          <option value="Active" ${
            employee.accountStatus === "Active" ? "selected" : ""
          }>Active</option>
          <option value="Closed" ${
            employee.accountStatus === "Closed" ? "selected" : ""
          }>Closed</option>
        </select>

        <button type="submit" id="save-changes-btn">Save Changes</button>
      </form>
    `;

    modal.style.display = "block";
    modalOverlay.style.display = "block";

    // Set focus to the first input field
    document.getElementById("firstName").focus();

    // Form submission handler
    const editEmployeeForm = document.getElementById("edit-employee-form");

    // Define the form submission handler
    async function formSubmitHandler(event) {
      event.preventDefault();

      const formData = new FormData(event.target);
      const updatedEmployeeData = {};

      // Check and add updated fields to the payload
      if (formData.get("firstName") !== employee.employeeBio.firstName) {
        updatedEmployeeData.employeeBio = {
          ...(updatedEmployeeData.employeeBio || {}),
          firstName: formData.get("firstName"),
        };
      }
      if (formData.get("lastName") !== employee.employeeBio.lastName) {
        updatedEmployeeData.employeeBio = {
          ...(updatedEmployeeData.employeeBio || {}),
          lastName: formData.get("lastName"),
        };
      }
      if (formData.get("phone") !== employee.phone) {
        updatedEmployeeData.phone = formData.get("phone");
      }
      if (formData.get("account-status") !== employee.accountStatus) {
        updatedEmployeeData.accountStatus = formData.get("account-status");
      }

      // Only send updated fields
      if (Object.keys(updatedEmployeeData).length > 0) {
        await updateEmployeeData(employee.employeeID, updatedEmployeeData);
      }

      closeModal();
      getEmployeeList();
      searchInput.value = "";
    }

    // Remove previous event listener to prevent duplicates
    editEmployeeForm.removeEventListener("submit", formSubmitHandler);
    editEmployeeForm.addEventListener("submit", formSubmitHandler);
  }

  // Close Employee details modal
  function closeModal() {
    modal.style.display = "none";
    modalOverlay.style.display = "none";
  }

  closeModalBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);

  // Open Add new employee modal
  addEmployeeBtn.addEventListener("click", () => {
    addEmployeeModal.style.display = "block";
    addEmployeeModalOverlay.style.display = "block";
  });

  // Close Add Employee modal
  function closeAddEmployeeModal() {
    addEmployeeModal.style.display = "none";
    addEmployeeModalOverlay.style.display = "none";
  }

  closeAddEmployeeModalBtn.addEventListener("click", closeAddEmployeeModal);
  addEmployeeModalOverlay.addEventListener("click", closeAddEmployeeModal);

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  // Handle the submission of the new employee form
  employeeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(employeeForm);

    // Extracting the working hours
    const workingHours = formData.get("workingHours").split(" - ");

    // Validate numeric inputs
    const baseSalary = parseFloat(formData.get("baseSalary"));
    const bonus = parseFloat(formData.get("bonus"));

    if (isNaN(baseSalary) || isNaN(bonus)) {
      alert("Please enter valid numbers for base salary and bonus.");
      return;
    }

    const employeeData = {
      email: formData.get("email"),
      password: formData.get("password"),
      phone: formData.get("phone"),
      lastLogin: "",
      isAdmin: formData.get("isAdmin") === "true",
      employeeBio: {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        address: {
          street: formData.get("street"),
          city: formData.get("city"),
          state: formData.get("state"),
          zipCode: formData.get("zipCode"),
          country: formData.get("country"),
        },
        gender: formData.get("gender"),
      },
      workInfo: {
        jobTitle: formData.get("jobTitle"),
        employeeType: formData.get("employeeType"),
        hireDate: new Date().toISOString(),
        payFrequency: formData.get("payFrequency"),
        payAmount: {
          baseSalary: baseSalary,
          bonus: bonus,
        },
        department: formData.get("department"),
        workingHours: {
          startTime: workingHours[0],
          endTime: workingHours[1],
        },
      },
      accountCreated: new Date().toISOString(),
      accountStatus: "Active",
    };

    await addEmployee(employeeData);
    closeAddEmployeeModal();
    getEmployeeList();
    searchInput.value = "";
  });
})();
