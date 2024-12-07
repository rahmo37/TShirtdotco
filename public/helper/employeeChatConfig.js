// This module handles all configurations related to employee chat

// Importing necessary modules
import { sessionObject } from "./sessionStorage.js";
import { errorPopUp } from "./errorPopUpHandler.js";
import { infoPopUp } from "./informationPopUpHandler.js";
import { confirmPopUp } from "./confirmPopUpHandler.js";
import { environment } from "./environmentConfig.js";

// Get the current new notification count
let newNotificationCount = sessionObject.getData("newNotifications");
let currentNotificationsArray = sessionObject.getData(
  "currentNotificationsArray"
);

// Main init function
export function chatInit() {
  // Outer chat container
  const outerContainer = document.querySelector(".chat-container");
  const chatInterfaceContainer = document.querySelector(".chat-interface");

  // Get chat icon container HTML
  const chatIconContainerHtml = generateChatIconContainer();

  // Get chat interface container HTML
  const carouselContainerHtml = generateCarouselContainer();

  // Append the HTMLs to the container

  // Icon HTML
  appendGeneratedContainer(outerContainer, chatIconContainerHtml);
  chatInterfaceContainer.innerHTML = carouselContainerHtml;

  // Initiate the components
  populateNotificationSlide();
  populateChatPageSlide();
  initiateChatComponents();
  employeeChatManagement();
}

function generateCarouselContainer() {
  return ` <div id="chatCarousel" class="carousel slide" data-bs-ride="false"> 
              <div class="carousel-inner">
                <div class="carousel-item active notification-container"></div>  
                <div class="carousel-item chat-slide-container"></div> 
              </div>  
            </div>`;
}

function populateNotificationSlide() {
  const notificationHtml = generateNotifications();
  const notificationContainer = document.querySelector(
    ".notification-container"
  );
  notificationContainer.innerHTML = notificationHtml;
  addToolTipCss();
}

function populateChatPageSlide() {
  const chatSlideHtml = generateChatPage();
  const chatSlideContainer = document.querySelector(".chat-slide-container");
  chatSlideContainer.innerHTML = chatSlideHtml;

  const userInfoViewer = document.getElementById("user-icon");
  userInfoViewer.addEventListener("click", (event) => {
    if (event.target.classList.contains("info-toggler")) {
      document.getElementById("customer-info").classList.toggle("expand");
    }
  });
}

function generateNotifications() {
  let notifications = "";
  if (currentNotificationsArray.length === 0) {
    notifications = `<div class="chat-slide-content">
                      <div class="notification-bar" style=" border: 1px solid red; border-left: 10px solid red;">
                        <div class="notification-icon">
                          <img src="../../img/no-notification-icon.png" alt="" />
                        </div>
                        <div class="notification-text">
                          <h6 style="color: red">
                            No customer is seeking help at this time...
                          </h6>
                        </div>
                      </div>
                    </div>`;
  } else {
    currentNotificationsArray.forEach((customer) => {
      notifications += `<div class="chat-slide-content">
                          <div class="notification-bar">
                            <div class="notification-icon">
                              <img 
                                src="../../img/${
                                  customer.gender.toLowerCase() === "male"
                                    ? "male2.png"
                                    : "female2.png"
                                }" 
                                alt="" 
                              />
                            </div>
                            <div class="notification-text">
                              <span class="notification-time">${
                                customer.time
                              }</span>
                              <p id="customer-name">
                                ${customer.firstName} ${customer.lastName}
                              </p>
                              <p 
                                id="customer-text" 
                                class="text-truncate" 
                                style="max-width: 200px;" 
                                data-bs-toggle="tooltip" 
                                title="${customer.message}"
                              >
                                ${customer.message}
                              </p>
                            </div>
                            <div class="notification-button-container">
                              <button class="join-btn join-chatroom-btn" data-customer-time="${
                                customer.time
                              }" data-customer-id="${
        customer.customerId
      }">Join</button>
                              <i
                                class="fas fa-window-close close-notification-btn"
                                id="close-notification-btn"
                                data-customer-time="${customer.time}"
                                data-customer-id="${customer.customerId}"
                              ></i>
                            </div>
                          </div>
                        </div>

                      `;
    });
  }

  return notifications;
}

function generateChatIconContainer() {
  return `<div class="chat-icon-container">
            <img src="../../img/chat-icon.png" id="chat-icon" alt="" />
            <p id="notification-counter" ${
              newNotificationCount === 0 ? "" : `style="background-color: red"`
            }>${newNotificationCount === 0 ? "" : newNotificationCount}</p>
          </div>`;
}

function generateChatPage() {
  return `<div class="chat-page">
                    <div class="outer-chat-container">
                      <header class="chat-header">
                        <h5>
                          <img
                            src="../../img/chat-icon3.png"
                            id="chat-icon-head"
                            alt=""
                          />Live Chat Support
                        </h5>
                        <div class="user-icon" id="user-icon">
                          <img src="../../img/user.png" class="info-toggler" alt="User" />
                          <i class="fas fa-caret-down info-toggler"></i>
                          <div class="customer-info" id="customer-info">
                            <p id="customer-info-id"><strong>ID:</strong> 12345</p>
                            <p id="customer-info-name"><strong>Name:</strong> John Doe</p>
                            <div class="leave-btn-container">
                              <button class="info-toggler" id="leave-chat-btn">Leave Chat</button>
                            </div>
                          </div>
                        </div>
                      </header>
                      <main class="chat-main">
                        <div
                          class="inner-chat-container"
                          id="inner-chat-container"
                        >
                          <!-- Chat messages will appear here -->
                        </div>
                        <div class="message-input">
                          <div class="input-field">
                            <input
                              type="text"
                              id="message-input"
                              placeholder="Type a message"
                            />
                          </div>
                          <button class="send-btn" id="send-btn">
                            <i class="fas fa-paper-plane"></i>
                          </button>
                        </div>
                      </main>
                    </div>
                  </div>`;
}

function generateCustomerMessage({ customer, message, time, gender }) {
  const eachMessage = `
    <div class="message sent">
      <div class="avatar">
        <img src="../../img/${
          gender.toLowerCase() === "male" ? "male2.png" : "female2.png"
        }" alt="Agent" />
      </div>
      <div class="message-content">
        <p style="font-weight: bold">${customer.firstName}</p>
        <p>${message}</p>
        <div class="timestamp">${time}</div>
      </div>
    </div>
  `;

  const messageWrapper = document.createElement("div");
  messageWrapper.innerHTML = eachMessage;
  return messageWrapper.firstElementChild;
}

function generateEmployeeMessage({ employee, message, time, gender }) {
  console.log(gender);
  const eachMessage = `
    <div class="message">
      <div class="avatar">
        <img src="../../img/${
          gender.toLowerCase() === "male" ? "male2.png" : "female2.png"
        }" alt="Agent" />
      </div>
      <div class="message-content">
        <p style="font-weight: bold">${employee.firstName}</p>
        <p>${message}</p>
        <div class="timestamp">${time}</div>
      </div>
    </div>
  `;
  const messageWrapper = document.createElement("div");
  messageWrapper.innerHTML = eachMessage;
  return messageWrapper.firstElementChild;
}

// Notification closer button listener
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("close-notification-btn")) {
    const customerId = event.target.getAttribute("data-customer-id");
    const notificationTime = event.target.getAttribute("data-customer-time");

    // Grab the parent element
    const parentElement = event.target.closest(".notification-bar");

    // Add the animation class to the parent
    if (parentElement) {
      parentElement.classList.add("delete-notification");
      parentElement.addEventListener(
        "animationend",
        () => {
          parentElement.remove();
          removeNotification(customerId, notificationTime);
          populateNotificationSlide();
        },
        { once: true }
      );
    }
  }
});

// Removes a notification
function removeNotification(customerId, notificationTime) {
  const index = currentNotificationsArray.findIndex(
    (customer) =>
      customer.customerId === customerId && customer.time === notificationTime
  );
  if (index !== -1) {
    currentNotificationsArray.splice(index, 1);
  }
  sessionObject.setData("currentNotificationsArray", currentNotificationsArray);
}

// Employee Chat management function
function employeeChatManagement() {
  // Configure Socket Communication
  const socket = io(
    window.location.hostname === "localhost" ||  window.location.hostname === "127.0.0.1" ? environment.DEV : environment.PRO
  );
  const employee = sessionObject.getData("employee");
  let customerId = "";
  const notificationCounter = document.getElementById("notification-counter");
  let currentRoom = "";

  // Identify event
  socket.emit("identify", {
    role: "employee",
    id: employee.employeeID,
    firstName: employee.employeeBio.firstName,
    lastName: employee.employeeBio.lastName,
    gender: employee.employeeBio.gender,
  });

  // Declare the opacity timeout variable outside the event listener
  let opacityTimeout;

  // Listener for customer help requests
  socket.on("customerHelpRequest", (customer) => {
    //If the same customer's notification already exists,

    // we extract the index of that existing notification
    const indexOfExistingCustomerNotification =
      currentNotificationsArray.findIndex((notification) => {
        return notification.customerId === customer.customerId;
      });

    // If found we remove it from the currentNotificationsArray
    if (indexOfExistingCustomerNotification !== -1) {
      currentNotificationsArray.splice(indexOfExistingCustomerNotification, 1);
    }

    // If the notification already exists, we dont increase new notification and no animation
    if (indexOfExistingCustomerNotification === -1) {
      const chatInterface = document.getElementById("chat-interface");

      if (!chatInterface.classList.contains("expanded")) {
        // Get new notifications count
        let newNotificationCount =
          Number(sessionObject.getData("newNotifications")) || 0;

        // Add 1 to existing notification count
        newNotificationCount++;

        // Update the session storage after a notification arrives
        sessionObject.setData("newNotifications", newNotificationCount);

        // Set the background to red
        notificationCounter.style.background = "Red";

        // Update the counter component
        notificationCounter.innerHTML = newNotificationCount;
      }

      const chatBtn = document.getElementById("chat-icon");

      // Clear any existing opacity restoration timeout
      if (opacityTimeout) {
        clearTimeout(opacityTimeout);
      }

      // Add the 'notification-active' class to set opacity to 1
      chatBtn.classList.add("notification-active");

      // Delay the animation to allow for any visual timing adjustments
      setTimeout(() => {
        chatBtn.classList.add("animate-notification");

        chatBtn.addEventListener(
          "animationend",
          function handleAnimationEnd() {
            // Remove the animation class
            chatBtn.classList.remove("animate-notification");

            // Set the timeout to restore the opacity after a delay
            opacityTimeout = setTimeout(() => {
              chatBtn.classList.remove("notification-active");
            }, 1500);

            // Remove the event listener to prevent multiple triggers
            chatBtn.removeEventListener("animationend", handleAnimationEnd);
          },
          { once: true }
        );
      }, 200);

      console.log(
        `${customer.customerFirstName} ${customer.customerLastName} is seeking help: "${customer.message}"`
      );
    }

    // Update notifications array and UI
    const newNotification = {
      customerId: customer.customerId,
      firstName: customer.customerFirstName,
      lastName: customer.customerLastName,
      gender: customer.customerGender,
      time: customer.time,
      message: customer.message,
    };
    currentNotificationsArray.push(newNotification);
    sessionObject.setData(
      "currentNotificationsArray",
      currentNotificationsArray
    );
    populateNotificationSlide();
  });

  const chatCarousel = document.querySelector("#chatCarousel");
  const carouselInstance = new bootstrap.Carousel(chatCarousel);
  const carouselInner = document.querySelector(".carousel-inner");

  // Declare variables to store event listeners
  let sendBtnClickListener;
  let messageInputKeydownListener;
  let receiveMessageListener;
  let leaveChatBtnClickListener;

  carouselInner.addEventListener("click", (event) => {
    if (event.target.classList.contains("join-chatroom-btn")) {
      // Gather necessary Info
      const notificationTime = event.target.getAttribute("data-customer-time");
      const customerId = event.target.getAttribute("data-customer-id");
      const employeeId = employee.employeeID;
      const room = `room_${employeeId}_${customerId}`;
      currentRoom = room;

      // Gather necessary elements
      const customerInfoId = document.getElementById("customer-info-id");
      const customerInfoName = document.getElementById("customer-info-name");
      let sendBtn = document.getElementById("send-btn");
      let messageContainer = document.getElementById("inner-chat-container");
      let messageInput = document.getElementById("message-input");

      // Clone elements to remove previous event listeners
      sendBtn = cloneAndReplaceElement(sendBtn);
      messageInput = cloneAndReplaceElement(messageInput);

      // Define event handler functions
      sendBtnClickListener = () => {
        const message = messageInput.value;
        if (message) {
          socket.emit("sendMessage", { room, messageType: "e", message });
          messageInput.value = "";
        } else {
          alert("Please write a message before sending...");
        }
      };

      messageInputKeydownListener = (event) => {
        if (event.key === "Enter") {
          sendBtn.click();
        }
      };

      // Add event listeners
      sendBtn.addEventListener("click", sendBtnClickListener);
      messageInput.addEventListener("keydown", messageInputKeydownListener);

      // Remove the notification
      removeNotification(customerId, notificationTime);

      // Start the startChat event
      socket.emit("startChat", room, employeeId, customerId);

      // After chat starts...
      socket.once(
        "chatStarted",
        ({ room, employee, customer, primaryMessage, primaryMessageTime }) => {
          // Clear the message container
          messageContainer.innerHTML = "";

          // Move to the chat window
          carouselInstance.next();

          // Update customer info
          customerInfoId.textContent = `ID: ${customer.id}`;
          customerInfoName.textContent = `Name: ${customer.firstName} ${customer.lastName}`;

          // Handle the leave chat button
          let leaveChatBtn = document.getElementById("leave-chat-btn");
          leaveChatBtn = cloneAndReplaceElement(leaveChatBtn);

          leaveChatBtnClickListener = () => {
            currentRoom = "";

            // Emit the employeeLeaveChat event
            socket.emit("employeeLeaveChat", room, employee.firstName);

            // Update the notification slide
            populateNotificationSlide();

            // Then go to the notification slide
            carouselInstance.prev();

            // Remove event listeners when leaving the chat
            sendBtn.removeEventListener("click", sendBtnClickListener);
            messageInput.removeEventListener(
              "keydown",
              messageInputKeydownListener
            );
            socket.off("receiveMessage", receiveMessageListener);
          };

          leaveChatBtn.addEventListener("click", leaveChatBtnClickListener);

          // If there is a primary message, display it
          if (primaryMessage && primaryMessageTime) {
            const primaryMessageInstance = generateCustomerMessage({
              customer,
              message: primaryMessage,
              time: primaryMessageTime,
              gender: customer.gender,
            });
            messageContainer.appendChild(primaryMessageInstance);
            messageContainer.scrollTop = messageContainer.scrollHeight;
          }

          // Handle incoming messages
          receiveMessageListener = ({
            messageType,
            sender,
            message,
            time,
            gender,
          }) => {
            if (messageType.toLowerCase() === "e") {
              const employeeMessageComponent = generateEmployeeMessage({
                employee: sender,
                message,
                time,
                gender,
              });
              messageContainer.appendChild(employeeMessageComponent);
              messageContainer.scrollTop = messageContainer.scrollHeight;
            } else if (messageType.toLowerCase() === "c") {
              const customerMessageComponent = generateCustomerMessage({
                customer: sender,
                message,
                time,
                gender,
              });
              messageContainer.appendChild(customerMessageComponent);
              messageContainer.scrollTop = messageContainer.scrollHeight;
            }
          };

          // Remove any previous listeners before adding a new one
          socket.off("receiveMessage", receiveMessageListener);
          socket.on("receiveMessage", receiveMessageListener);
        }
      );

      // If the customer is unavailable
      socket.once("chatError", (msg) => {
        document.getElementById("chat-interface").classList.remove("expanded");
        infoPopUp.showInfoModal(msg, () => {
          populateNotificationSlide();
        });
      });
    }
  });

  socket.on("customerDisconnect", ({ customerId, time, allRooms }) => {
    removeNotification(customerId, time);
    if (!currentRoom) {
      populateNotificationSlide();
    }
  });
}

// Helper Functions
function initiateChatComponents() {
  // Initialize the chat components
  const chatBtn = document.getElementById("chat-icon");
  const chatInterface = document.getElementById("chat-interface");
  const notificationCounter = document.getElementById("notification-counter");

  chatBtn.addEventListener("click", () => {
    // When chat icon is clicked,

    // Toggle the expanded class to the interface
    chatInterface.classList.toggle("expanded");

    // Toggle the active class on the chat icon
    chatBtn.classList.toggle("active");

    // Remove 'notification-active' class to reset opacity
    chatBtn.classList.remove("notification-active");

    // Clear out the notification counter
    notificationCounter.innerHTML = "";

    // Background of the notification counter will change to transparent
    notificationCounter.style.background = "transparent";

    // Notification counter will be reset to 0
    newNotificationCount = 0;

    // And the session storage will be updated
    sessionObject.setData("newNotifications", newNotificationCount);
  });
}

function appendGeneratedContainer(outerContainer, containerHTML) {
  const containerDiv = document.createElement("div");
  containerDiv.innerHTML = containerHTML;
  outerContainer.appendChild(containerDiv);
  return containerDiv;
}

function addToolTipCss() {
  // Dynamically add custom tooltip styles
  const tooltipStyles = `
    .tooltip {
      z-index: 6000 !important;
      opacity: 1 !important;
    }
    .tooltip-inner {
      background-color: #00a1ff !important;
      color: #fff !important; /* White text */
      padding: 8px 12px !important;
      font-size: 14px !important;
      border-radius: 4px !important;
    }
  `;

  // Create a <style> element
  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  styleElement.innerHTML = tooltipStyles;

  // Append the <style> element to the <head>
  document.head.appendChild(styleElement);

  // Initialize Bootstrap tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
}

function cloneAndReplaceElement(element) {
  const newElement = element.cloneNode(true);
  element.parentNode.replaceChild(newElement, element);
  return newElement;
}
