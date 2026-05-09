// ============================================================
// routes/marksRoutes.js
// Defines all API routes for the Marks module
// and maps them to their controller functions
// ============================================================

const express = require("express");
const router  = express.Router();

// Import all marks controller functions
const {
  getAllMarks,
  addMark,
  updateMark,
  deleteMark,
} = require("../controllers/marksController");

// -------------------------------------------------------
// Route Definitions
// Base path: /marks  (mounted in server.js)
// -------------------------------------------------------

// GET    /marks       → Fetch all marks (with JOIN data)
router.get("/", getAllMarks);

// POST   /marks       → Add a new marks entry
router.post("/", addMark);

// PUT    /marks/:id   → Update a marks entry by mark_id
router.put("/:id", updateMark);

// DELETE /marks/:id   → Delete a marks entry by mark_id
router.delete("/:id", deleteMark);

module.exports = router;