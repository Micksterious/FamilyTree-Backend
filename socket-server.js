const { Server } = require("socket.io");

let io;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const initSocketServer = (server) => {
  try {
    io = new Server(server, {
      cors: {
        origin: [
          "https://family-tree-frontend-alpha.vercel.app",
          "http://localhost:3000"
        ],
        credentials: true,
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      console.log(`🔗 User ${socket.id} connected to sockets`);

      socket.on("disconnect", () => {
        console.log(`🔗 User ${socket.id} disconnected from sockets`);
      });

      // Define event handlers here...
    });
  } catch (error) {
    console.error("❌ Error initializing socket server:");
    console.error(error);
  }
};

module.exports = initSocketServer;