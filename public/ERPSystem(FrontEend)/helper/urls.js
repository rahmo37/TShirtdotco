// This module has all the urls
const HOSTNAME = "http://localhost:3001/api";
export const urlObject = {
  employeeLogin: HOSTNAME + "/employee/login",
  customerLogin: HOSTNAME + "/customer/login",
  inventoryReport: HOSTNAME + "/employee/inventory/report",
  customInventoryReport: HOSTNAME + "/employee/inventory/report/custom",
  salesReport: HOSTNAME + "/employee/sale/report",
  customSalesReport: HOSTNAME + "/employee/sale/report/custom",
  createCustomer: HOSTNAME + "/shared/customer",
  getCustomerList: HOSTNAME + "/employee/customer",
  updateCustomer: HOSTNAME + "/employee/customer/", // Add customer id
  getInventory: HOSTNAME + "/shared/inventory",
  addProduct: HOSTNAME + "/employee/inventory/", // Add category id or send 'new'
  deleteProduct: HOSTNAME + "/employee/inventory/", // Add Category id and product id
  restockProduct: HOSTNAME + "/employee/inventory/restock/", // Add Category id and product id
  updateProduct: HOSTNAME + "/employee/inventory/", // Add Category id and product id
  getEmployee: HOSTNAME + "/employee/manage",
  addEmployee: HOSTNAME + "/employee/manage",
  updateEmployee: HOSTNAME + "/employee/manage/", // add employeeId
  updateLoggedInEmployeeInfo: HOSTNAME + "/employee/update/generalInfo/", // add employeeId
};
