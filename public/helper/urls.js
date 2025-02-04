// This module has all the urls
import { environment } from "./environmentConfig.js";

const HOSTNAME = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? `${environment.DEV}/api`
  : environment.PRO.includes(window.location.hostname)
  ? `https://${window.location.hostname}/api`
  : null;

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
  imageUpload: HOSTNAME + "/upload",
  updateLoggedInEmployeeInfo: HOSTNAME + "/employee/update/generalInfo/", // add employeeId
  updateEmployeePassword: HOSTNAME + "/employee/update/password/", // add employeeId
  getAnEmployeeData: HOSTNAME + "/employee/manage/",
  getAllOrders: HOSTNAME + "/employee/order/",
  addDiscount: HOSTNAME + "/employee/order/discount/", // add orderId
  updateOrderStatus: HOSTNAME + "/employee/order/status/", // oder id
  removeProductFromOrder: HOSTNAME + "/shared/order/item/", // order id
  cancelOrder: HOSTNAME + "/shared/order/cancel/", //order id
  getACustomer: HOSTNAME + "/employee/customer/", // customer id
  placeOrder: HOSTNAME + "/shared/order/",
  saveSubscription: HOSTNAME + "/push-notification/save-subscription",
  removeSubscription: HOSTNAME + "/push-notification/remove-subscription",
  getOrdersOfACustomer: HOSTNAME + "/customer/order/", // customer id
};
