// This module handles all socket.io interactions

// Importing modules
const socketIo = require("socket.io");
const server = require("../../ERPSystem");
const moment = require("moment");

// Register the server with socket.io
const io = socketIo(server, {
  cors: {
    origin:
      process.env.DOMAIN === "tshirtdotco"
        ? ["http://167.88.44.159:3001", "http://www.tshirtdotco.com:3001"]
        : ["http://127.0.0.1:5500"], // Make sure this is always an array
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // As soon as there is a connection, we check the role and id
  socket.on("identify", (data) => {
    // Validate data
    if (!data.role || !data.id || !data.firstName || !data.lastName) {
      console.log("Invalid identify data:", data);
      return;
    }

    const { role, id, firstName, lastName, message, gender } = data;

    if (role.toLowerCase() === "customer" && id.startsWith("CUS_") && message) {
      const time = getCurrentTime();

      // Save customer data in the socket
      socket.userInfo = {
        role,
        id,
        firstName,
        lastName,
        message,
        gender,
        time,
        inChat: false, // Initialize inChat flag
      };

      console.log(`Customer "${firstName} ${lastName}" is seeking help...`);

      // Notify all employees about the help request
      io.to("employeesRoom").emit("customerHelpRequest", {
        customerId: id,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerGender: gender,
        time,
        message: message,
      });
    } else if (role.toLowerCase() === "employee" && id.startsWith("EMP_")) {
      // Save employee data in the socket
      socket.userInfo = { role, id, firstName, lastName, gender };

      console.log(`Employee "${firstName} ${lastName}" is now online.`);

      // Add the employee to the employee room
      socket.join("employeesRoom");

      // Send any pending customer help requests to the employee
      Array.from(io.sockets.sockets.values()).forEach((s) => {
        if (
          s.userInfo?.id.startsWith("CUS_") &&
          s.rooms.size === 1 &&
          !s.userInfo.inChat
        ) {
          socket.emit("customerHelpRequest", {
            customerId: s.userInfo.id,
            customerFirstName: s.userInfo.firstName,
            customerLastName: s.userInfo.lastName,
            customerGender: s.userInfo.gender,
            time: s.userInfo.time,
            message: s.userInfo.message,
          });
        }
      });
    } else {
      console.log("Invalid role or ID format:", data);
    }
  });

  socket.on("startChat", (room, employeeId, customerId) => {
    const customerSocket = Array.from(io.sockets.sockets.values()).find(
      (s) => s.userInfo?.id === customerId
    );
    const employeeSocket = Array.from(io.sockets.sockets.values()).find(
      (s) => s.userInfo?.id === employeeId
    );

    console.log(`
      customerSocketId: ${customerSocket}
      employeeSocketId: ${employeeSocket}
      customerRoomSize: ${customerSocket.rooms.size}
      employeeSocket room: ${employeeSocket.userInfo.room}
      user in chat?: ${customerSocket.userInfo.inChat}
      line 93
    `);

    if (
      customerSocket &&
      employeeSocket &&
      customerSocket.rooms.size === 1 &&
      !employeeSocket.userInfo.room &&
      !customerSocket.userInfo.inChat
    ) {
      // Mark the customer as in chat
      customerSocket.userInfo.inChat = true;

      // First make employee leave the employeesRoom
      employeeSocket.leave("employeesRoom");

      // Add both customer and employee to the provided room
      customerSocket.join(room);
      employeeSocket.join(room);

      customerSocket.userInfo.room = room;
      employeeSocket.userInfo.room = room;

      io.to(room).emit("chatStarted", {
        room,
        customer: customerSocket.userInfo,
        employee: employeeSocket.userInfo,
        primaryMessage: customerSocket.userInfo.message,
        primaryMessageTime: customerSocket.userInfo.time,
      });
    } else {
      socket.emit(
        "chatError",
        "The chat could not be initiated. The customer may have left or is currently engaged with another employee, or the employee is already in a chat."
      );
    }
  });

  socket.on("employeeLeaveChat", (room, employeeName) => {
    console.log(room, "line 131");
    socket.leave(room);
    delete socket.userInfo.room;
    socket.join("employeesRoom");
    console.log(
      `${employeeName} left the room ${room} and joined employeesRoom. Current rooms:`,
      socket.rooms
    );

    // Notify the customer
    io.to(room).emit("receiveMessage", {
      messageType: "l",
      sender: { firstName: "System" },
      message: `${employeeName} has left the chat.`,
      time: getCurrentTime(),
      gender: socket.userInfo.gender,
    });

    // Find the customer socket in the room and update their status
    const customerSocket = Array.from(io.sockets.sockets.values()).find(
      (s) =>
        s.userInfo?.room === room &&
        s.userInfo?.role.toLowerCase() === "customer"
    );
    if (customerSocket) {
      customerSocket.userInfo.inChat = false;
      delete customerSocket.userInfo.room;
    }

    // Send any pending customer help requests to the employee
    Array.from(io.sockets.sockets.values()).forEach((s) => {
      if (
        s.userInfo?.id.startsWith("CUS_") &&
        s.rooms.size === 1 &&
        !s.userInfo.inChat
      ) {
        socket.emit("customerHelpRequest", {
          customerId: s.userInfo.id,
          customerFirstName: s.userInfo.firstName,
          customerLastName: s.userInfo.lastName,
          customerGender: s.userInfo.gender,
          time: s.userInfo.time,
          message: s.userInfo.message,
        });
      }
    });
  });

  // Handle message events
  socket.on("sendMessage", ({ room, message }) => {
    const messageType =
      socket.userInfo.role.toLowerCase() === "employee" ? "e" : "c";
    io.to(room).emit("receiveMessage", {
      messageType,
      sender: socket.userInfo,
      message,
      time: getCurrentTime(),
      gender: socket.userInfo.gender,
    });
  });

  // Handle disconnects
  socket.on("disconnect", () => {
    if (socket.userInfo && socket.userInfo.room) {
      const room = socket.userInfo.room;
      io.to(room).emit("receiveMessage", {
        messageType:
          socket.userInfo.role.toLowerCase() === "employee" ? "e" : "c",
        sender: socket.userInfo,
        message: `${socket.userInfo.firstName} has left the chat.`,
        time: getCurrentTime(),
        gender: socket.userInfo.gender,
      });

      // If the disconnected user is an employee, handle customer status
      if (socket.userInfo.role.toLowerCase() === "employee") {
        // Find the customer socket in the room and update their status
        const customerSocket = Array.from(io.sockets.sockets.values()).find(
          (s) =>
            s.userInfo?.room === room &&
            s.userInfo?.role.toLowerCase() === "customer"
        );

        const employeeSocket = Array.from(io.sockets.sockets.values()).find(
          (s) =>
            s.userInfo?.room === room &&
            s.userInfo?.role.toLowerCase() === "employee"
        );
        if (customerSocket) {
          customerSocket.userInfo.inChat = false;
          delete customerSocket.userInfo.room;
        }
        delete socket.userInfo.room;
      } else {
        socket.userInfo.inChat = false;
        delete socket.userInfo.room;
      }
    }

    if (socket.userInfo && !socket.userInfo.room) {
      if (socket.userInfo?.role.toLowerCase() === "customer") {
        console.log(socket.userInfo.id, socket.userInfo.time);
        const allRooms = Array.from(io.sockets.adapter.rooms.keys());

        io.emit("customerDisconnect", {
          customerId: socket.userInfo.id,
          time: socket.userInfo.time,
          allRooms, // Include all existing rooms
        });
      }

      console.log(`${socket.userInfo.firstName} disconnected...`);
      // Clean up user data
      delete socket.userInfo;
    } else {
      console.log("A user disconnected before identifying themselves.");
    }
  });
});

function getCurrentTime() {
  return moment().format("hh:mm:ss A");
}

module.exports = io;
