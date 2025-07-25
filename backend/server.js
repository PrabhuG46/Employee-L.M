const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { requestLogger } = require("./middleware/logger");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Add request logger for debugging
app.use(requestLogger);

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/employee_management", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
app.use("/api/employees", require("./routes/employees"));
app.use("/api/leave-requests", require("./routes/leaveRequests"));
app.use("/api/auth", require("./routes/auth"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
