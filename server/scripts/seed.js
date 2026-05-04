require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");
const User = require("../src/models/User");
const Event = require("../src/models/Event");
const Registration = require("../src/models/Registration");

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment.");
  }

  if (process.env.MONGO_USE_PUBLIC_DNS !== "false") {
    const servers = (process.env.MONGO_DNS_SERVERS || "8.8.8.8,1.1.1.1")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (servers.length) dns.setServers(servers);
  }

  await mongoose.connect(process.env.MONGO_URI, { autoIndex: true });
  console.log("Connected to MongoDB for seeding.");

  await Registration.deleteMany({});
  await Event.deleteMany({});
  await User.deleteMany({});

  const admin = await User.create({
    name: "Platform Admin",
    email: "admin@eventflow.com",
    password: "password123",
    role: "admin",
  });

  const organizer = await User.create({
    name: "Demo Organizer",
    email: "organizer@demo.com",
    password: "password123",
    role: "organizer",
  });


  const attendeeA = await User.create({
    name: "Attendee One",
    email: "attendee1@demo.com",
    password: "password123",
    role: "attendee",
  });

  const attendeeB = await User.create({
    name: "Attendee Two",
    email: "attendee2@demo.com",
    password: "password123",
    role: "attendee",
  });

  await User.create({
    name: "Attendee Three",
    email: "attendee3@demo.com",
    password: "password123",
    role: "attendee",
  });

  const event = await Event.create({
    organizerId: organizer._id,
    name: "Capacity Stress Test Event",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    time: "18:30",
    venue: "Demo Hall, Main City",
    description: "Use this event to verify seat limit handling.",
    maxSeatCapacity: 2,
    currentRegisteredCount: 2,
    bannerImageURL: "https://source.unsplash.com/1600x900/?event,conference,stage",
    status: "approved",
  });

  const attendeeAToken = `EVT-SEED-${Date.now()}-A`;
  const attendeeBToken = `EVT-SEED-${Date.now()}-B`;

  await Registration.create([
    {
      eventId: event._id,
      attendeeId: attendeeA._id,
      token: attendeeAToken,
      ticketToken: attendeeAToken,
      registrationDate: new Date(),
    },
    {
      eventId: event._id,
      attendeeId: attendeeB._id,
      token: attendeeBToken,
      ticketToken: attendeeBToken,
      registrationDate: new Date(),
    },
  ]);

  console.log("Seed complete.");
  console.log("Admin: admin@eventflow.com / password123");
  console.log("Organizer: organizer@demo.com / password123");
  console.log("Attendees: attendee1@demo.com, attendee2@demo.com, attendee3@demo.com / password123");

  console.log(`Seeded Event: ${event.name} (capacity ${event.maxSeatCapacity}, full)`);
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  });


