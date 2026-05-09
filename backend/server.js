// ============================================================
// server.js
// Entry point of the backend server
// ============================================================

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

// -------------------------------------------------------
// Middleware
// -------------------------------------------------------
app.use(cors());                  // Allow cross-origin requests from frontend
app.use(express.json());          // Parse incoming JSON request bodies

// -------------------------------------------------------
// Import Route Files
// -------------------------------------------------------
const studentRoutes = require("./routes/studentRoutes"); // Student CRUD routes
const subjectRoutes = require("./routes/subjectRoutes"); // Subject CRUD routes  ← NEW
const marksRoutes   = require("./routes/marksRoutes");   // Marks CRUD routes

// -------------------------------------------------------
// Mount Routes
// All student routes will be prefixed with /students
// Example: GET /students, POST /students, DELETE /students/:id
// -------------------------------------------------------
app.use("/students", studentRoutes);
app.use("/subjects", subjectRoutes); // All subject routes → /subjects  ← NEW
app.use("/marks", marksRoutes);       // All marks routes → /marks   ← NEW
// -------------------------------------------------------
// Root Route — Health check
// -------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Student Management Backend Running ✅");
});

// -------------------------------------------------------
// Start Server
// -------------------------------------------------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

