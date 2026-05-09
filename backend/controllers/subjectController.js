// ============================================================
// controllers/subjectController.js
// Handles all business logic for Subject CRUD operations
// Table: subjects (subject_id, subject_name, credits)
// ============================================================

const db = require("../db"); // Import the MySQL database connection

// -------------------------------------------------------
// @desc    Get all subjects
// @route   GET /subjects
// -------------------------------------------------------
const getAllSubjects = (req, res) => {
  const sql = "SELECT * FROM subjects ORDER BY subject_id ASC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching subjects:", err.message);
      return res.status(500).json({ success: false, message: "Database error while fetching subjects." });
    }

    res.status(200).json({ success: true, data: results });
  });
};

// -------------------------------------------------------
// @desc    Add a new subject
// @route   POST /subjects
// @body    { subject_name, credits }
// -------------------------------------------------------
const addSubject = (req, res) => {
  const { subject_name, credits } = req.body;

  // Validate required fields
  if (!subject_name || credits === undefined || credits === "") {
    return res.status(400).json({ success: false, message: "Subject name and credits are required." });
  }

  // Credits must be a positive integer
  const creditsInt = parseInt(credits);
  if (isNaN(creditsInt) || creditsInt < 1 || creditsInt > 10) {
    return res.status(400).json({ success: false, message: "Credits must be a number between 1 and 10." });
  }

  const sql = "INSERT INTO subjects (subject_name, credits) VALUES (?, ?)";
  const values = [subject_name.trim(), creditsInt];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error adding subject:", err.message);

      // Handle duplicate subject name (if UNIQUE constraint exists)
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, message: "A subject with this name already exists." });
      }

      return res.status(500).json({ success: false, message: "Database error while adding subject." });
    }

    res.status(201).json({
      success: true,
      message: "Subject added successfully.",
      subject_id: result.insertId, // Return new subject's ID
    });
  });
};

// -------------------------------------------------------
// @desc    Update an existing subject by ID
// @route   PUT /subjects/:id
// @params  id — subject_id in the database
// @body    { subject_name, credits }
// -------------------------------------------------------
const updateSubject = (req, res) => {
  const { id } = req.params;
  const { subject_name, credits } = req.body;

  // Validate required fields
  if (!subject_name || credits === undefined || credits === "") {
    return res.status(400).json({ success: false, message: "Subject name and credits are required." });
  }

  // Credits must be a valid number
  const creditsInt = parseInt(credits);
  if (isNaN(creditsInt) || creditsInt < 1 || creditsInt > 10) {
    return res.status(400).json({ success: false, message: "Credits must be a number between 1 and 10." });
  }

  const sql = "UPDATE subjects SET subject_name = ?, credits = ? WHERE subject_id = ?";
  const values = [subject_name.trim(), creditsInt, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating subject:", err.message);
      return res.status(500).json({ success: false, message: "Database error while updating subject." });
    }

    // No rows affected means the ID doesn't exist
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `No subject found with ID ${id}.` });
    }

    res.status(200).json({ success: true, message: "Subject updated successfully." });
  });
};

// -------------------------------------------------------
// @desc    Delete a subject by ID
// @route   DELETE /subjects/:id
// @params  id — subject_id in the database
// -------------------------------------------------------
const deleteSubject = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM subjects WHERE subject_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting subject:", err.message);

      // If subject is referenced in marks table (foreign key constraint)
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({
          success: false,
          message: "Cannot delete subject — it is linked to existing marks records.",
        });
      }

      return res.status(500).json({ success: false, message: "Database error while deleting subject." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `No subject found with ID ${id}.` });
    }

    res.status(200).json({ success: true, message: "Subject deleted successfully." });
  });
};

// Export all controller functions
module.exports = {
  getAllSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
};