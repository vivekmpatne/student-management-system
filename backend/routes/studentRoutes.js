// ============================================================
// routes/studentRoutes.js
// Defines all API routes for the Student module
// and maps them to their controller functions
// ============================================================

const express = require("express");
const router = express.Router(); // Create an Express Router instance

// Import all student controller functions
const {
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

// -------------------------------------------------------
// Route Definitions
// Base path: /students  (mounted in server.js)
// -------------------------------------------------------

// GET  /students       → Fetch all students
router.get("/", getAllStudents);

// POST /students       → Add a new student
router.post("/", addStudent);

// PUT  /students/:id   → Update a student by their ID
router.put("/:id", updateStudent);

// DELETE /students/:id → Delete a student by their ID
router.delete("/:id", deleteStudent);

// Export the router to be used in server.js
module.exports = router;