// ============================================================
// routes/subjectRoutes.js
// Defines all API routes for the Subject module
// and maps them to their controller functions
// ============================================================

const express = require("express");
const router = express.Router(); // Create an Express Router instance

// Import all subject controller functions
const {
  getAllSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");

// -------------------------------------------------------
// Route Definitions
// Base path: /subjects  (mounted in server.js)
// -------------------------------------------------------

// GET    /subjects      → Fetch all subjects
router.get("/", getAllSubjects);

// POST   /subjects      → Add a new subject
router.post("/", addSubject);

// PUT    /subjects/:id  → Update a subject by ID
router.put("/:id", updateSubject);

// DELETE /subjects/:id  → Delete a subject by ID
router.delete("/:id", deleteSubject);

// Export the router to be used in server.js
module.exports = router;