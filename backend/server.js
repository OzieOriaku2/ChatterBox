const express = require("express");
const cors = require("cors");
const connectDatabase = require("./database/databaseInit");
const { SERVER_PORT } = require("./constants");
const errorHandler = require("./middleware/errorHandler");

const authRouter = require("./routes/authRoutes");
const channelRouter = require("./routes/channelRoutes");
const messageRouter = require("./routes/messageRoutes");

const app = express();


connectDatabase();


app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({
  limit: "5mb",
  extended: true,
  parameterLimit: 50000,
}));


app.get("/", (req, res) => {
  res.send("ChatterBox API Server Running...");
});

// Health check endpoint
app.get("/PING", (req, res) => {
  res.status(200).json({
    message: "PONG",
  });
});


app.use("/api/auth", authRouter);
app.use("/api/channels", channelRouter);
app.use("/api/channels", messageRouter); // ✅ Fixed: mount under /api/channels


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});


app.use(errorHandler); // ✅ Fixed: moved to the end


app.listen(SERVER_PORT, () => {
  console.log(`ChatterBox Server is running at port: ${SERVER_PORT}`);
});

module.exports = app;