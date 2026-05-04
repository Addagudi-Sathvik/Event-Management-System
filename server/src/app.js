const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const registrationRoutes = require("./routes/registration.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const adminRoutes = require("./routes/admin.routes");
const ticketRoutes = require("./routes/ticket.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

const corsOptions = {
  origin: "https://event-management-system-ivory-ten.vercel.app",
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api", ticketRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

