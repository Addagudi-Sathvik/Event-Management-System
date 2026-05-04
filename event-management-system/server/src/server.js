require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const { startReminderCron } = require("./jobs/reminder.job");

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  app.set("io", io);
  io.on("connection", (socket) => {
    socket.on("joinEvent", (eventId) => {
      socket.join(`event:${eventId}`);
    });
  });

  startReminderCron();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
