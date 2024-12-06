// This module handles the customer chat

// Importing modules
import { sessionObject } from "../../helper/sessionStorage.js";

// setTimeOut id
let timerId = "";

init();

function init() {
  const outerContainer = document.getElementById("outer-main-container");
  const agentPageHtml = getAgentPageHtml();
  const containerWithAgentPage = appendGeneratedContainer(
    outerContainer,
    agentPageHtml
  );

  let connectBtn = document.getElementById("connect-btn");
  let cancelBtn = document.getElementById("cancel-btn");
  let helpInput = document.getElementById("help-input");
  const loadingContainer = document.querySelector(".loading-container");

  connectBtn = cloneAndReplaceElement(connectBtn);
  cancelBtn = cloneAndReplaceElement(cancelBtn);
  helpInput = cloneAndReplaceElement(helpInput);

  const customerChatInterfaceHtml = getCustomerChatInterfaceHtml();
  // const containerWithChatInterface = appendGeneratedContainer(
  //   outerContainer,
  //   customerChatInterfaceHtml
  // );

  attachEventListeners(connectBtn, cancelBtn, helpInput, loadingContainer);
  customerChatManager();
}

function attachEventListeners(
  connectBtn,
  cancelBtn,
  helpInput,
  loadingContainer
) {
  let socket = "";
  if (connectBtn) {
    connectBtn.addEventListener("click", () => {
      let helpInputValue = helpInput.value;
      if (helpInputValue) {
        socket = connectBtnClick(
          connectBtn,
          cancelBtn,
          helpInputValue,
          loadingContainer
        );
      } else {
        alert("Please briefly explain your issue in simple words...");
      }
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      cancelBtnClick(connectBtn, cancelBtn, loadingContainer, socket);
    });
  }
}

function getAgentPageHtml() {
  return `
      <div class="agent-page-container">
        <img src="../../img/liveAgent.png" class="agent-image" alt="" />
        <div class="agent-connect-container">
        <textarea placeholder="Please briefly explain your issue." rows="4" cols="50" id="help-input"></textarea>
        <div class="buttons-container">
         <button class="connect-btn-hover connect-btn" id="connect-btn">
          Connect With An Agent
        </button>
        <button class="cancel-btn-hover cancel-btn" id="cancel-btn">
          Cancel
        </button>
        </div>
        <div class="loading-container">
          <p>Please wait while we connect you</p>
          <img src="../../img/loading.gif">
          </div>
        </div>
      </div>  
  `;
}

function getCustomerChatInterfaceHtml() {
  return ` <div class="chat-container">
          <header class="chat-header">
            <h1>Customer Chat Portal</h1>
            <a class="btn" id="leave-room">Leave Room</a>
          </header>
          <main class="chat-main">
            <div class="chat-sidebar">
              <div id="sidebar-content">
                <h4><i class="fas fa-users"></i> Users</h4>
                <ul id="users"></ul>
              </div>
            </div>
            <div class="chat-messages"></div>
          </main>
          <div class="chat-form-container">
            <form id="chat-form">
              <input
                id="message-input"
                type="text"
                placeholder="Enter Message"
                required
                autocomplete="off"
              />
              <button class="btn" id="send-btn">
                <i class="fas fa-paper-plane"></i> Send
              </button>
            </form>
          </div>
        </div>`;
}

function customerChatManager(message) {
  // Create a connection with the backend
  const socket = io("http://localhost:3001");

  // Grab the customer information for identification
  const customer = sessionObject.getData("customer");

  // Emit an identify event for the backend to identify the user
  socket.emit("identify", {
    role: "customer",
    id: customer.customerID,
    firstName: customer.customerBio.firstName,
    lastName: customer.customerBio.lastName,
    gender: customer.customerBio.gender,
    message,
  });

  socket.on(
    "chatStarted",
    ({ room, customer, employee, primaryMessage, primaryMessageTime }) => {
      // clear the waiting time
      if (timerId) {
        clearTimeout(timerId);
      }

      // Load the chat page
      loadChatPage(socket);

      // Load the user names
      outputRoomUsers([customer, employee]);

      // Load the initial message
      outputCustomerMessage(customer, primaryMessage, primaryMessageTime);

      // The the elements of the chat page
      const sendBtn = document.getElementById("send-btn");
      const messageInput = document.getElementById("message-input");
      // sendBtn = cloneAndReplaceElement(sendBtn);
      // messageInput = cloneAndReplaceElement(messageInput);

      if (sendBtn) {
        sendBtn.addEventListener("click", (event) => {
          event.preventDefault();
          const message = messageInput.value;
          if (messageInput) {
            socket.emit("sendMessage", { room, messageType: "c", message });
            messageInput.value = "";
          } else {
            alert("Please write a message before sending...");
          }
        });
      }

      socket.on("receiveMessage", ({ messageType, sender, message, time }) => {
        if (messageType.toLowerCase() === "l") {
          socket.disconnect();
          alert(`Agent has left the chat. Your chat session has ended...`);
          init();
        }

        if (messageType.toLowerCase() === "e") {
          outputEmployeeMessage(sender, message, time);
        }

        if (messageType.toLowerCase() === "c") {
          outputCustomerMessage(sender, message, time);
        }
      });
    }
  );

  return socket;
}

function appendGeneratedContainer(outerContainer, containerHTML) {
  outerContainer.innerHTML = "";
  const containerDiv = document.createElement("div");
  containerDiv.innerHTML = containerHTML;
  outerContainer.appendChild(containerDiv);
  return containerDiv;
}

function connectBtnClick(connectBtn, cancelBtn, message, loadingContainer) {
  const socket = customerChatManager(message);
  cancelBtn.classList.add("appear");
  connectBtn.classList.add("disable");
  connectBtn.disabled = true;
  loadingContainer.classList.add("appear");
  timerId = setTimeout(() => {
    cancelBtnClick(connectBtn, cancelBtn, loadingContainer, socket);
    alert("Unable to connect to an agent at this time, please try again later");
  }, 60000);
  return socket;
}

function cancelBtnClick(connectBtn, cancelBtn, loadingContainer, socket) {
  cancelBtn.classList.remove("appear");
  connectBtn.classList.remove("disable");
  connectBtn.disabled = false;
  loadingContainer.classList.remove("appear");
  if (socket) {
    socket.disconnect();
  } else {
    console.log("socket property is undefined");
  }

  if (timerId) {
    clearTimeout(timerId);
  }
}

function loadChatPage(socket) {
  const outerContainer = document.getElementById("outer-main-container");
  const customerChatInterfaceHtml = getCustomerChatInterfaceHtml();
  const containerWithChatInterface = appendGeneratedContainer(
    outerContainer,
    customerChatInterfaceHtml
  );
  let leaveBtn = document.getElementById("leave-room");
  leaveBtn = cloneAndReplaceElement(leaveBtn);
  leaveBtn.addEventListener("click", () => {
    const response = confirm("Are you sure you want to leave the chat?");
    if (response) {
      socket.disconnect();
      init();
    }
  });
}

function outputEmployeeMessage(sender, message, time) {
  const newMessage = document.createElement("div");
  newMessage.classList.add("message-employee");
  newMessage.innerHTML = `
      <p class="meta">${sender.firstName} <span>${time}</span></p>
        <p class="text">
        ${message}
      </p>
  `;
  const messageContainer = document.querySelector(".chat-messages");
  messageContainer.appendChild(newMessage);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function outputCustomerMessage(sender, message, time) {
  const newMessage = document.createElement("div");
  newMessage.classList.add("message-customer");
  newMessage.innerHTML = `
      <p class="meta">${sender.firstName} <span>${time}</span></p>
        <p class="text">
        ${message}
      </p>
  `;
  const messageContainer = document.querySelector(".chat-messages");
  messageContainer.appendChild(newMessage);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function cloneAndReplaceElement(element) {
  const newElement = element.cloneNode(true);
  element.parentNode.replaceChild(newElement, element);
  return newElement;
}

function outputRoomUsers(users) {
  const userList = document.getElementById("users");
  userList.innerHTML = `
    ${users
      .map((user) => `<li>${user.firstName + " " + user.lastName}</li>`)
      .join("")} 
  `;
}
