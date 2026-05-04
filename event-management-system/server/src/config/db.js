const mongoose = require("mongoose");
const dns = require("dns");

module.exports = async function connectDB() {
  try {
    // Some networks block SRV queries on the default resolver used by Node.
    // Force public DNS for Atlas SRV lookup unless explicitly disabled.
    if (process.env.MONGO_USE_PUBLIC_DNS !== "false") {
      const servers = (process.env.MONGO_DNS_SERVERS || "8.8.8.8,1.1.1.1")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (servers.length) dns.setServers(servers);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
    });
    console.log(`Mongo connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Mongo connection error:", error.message);
    process.exit(1);
  }
};
