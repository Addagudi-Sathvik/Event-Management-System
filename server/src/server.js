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
      origin: "https://event-management-system-ivory-ten.vercel.app",
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

  const startServer = (port) => {
    const listener = server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    listener.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} in use, trying ${port + 1}...`);
        listener.close();
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  };

  startServer(PORT);
})();


