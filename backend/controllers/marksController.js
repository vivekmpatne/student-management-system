// ============================================================
// controllers/marksController.js
// Handles all business logic for Marks CRUD operations.
//
// Table: marks (mark_id, student_id, subject_id, marks)
// Uses INNER JOIN with students and subjects tables on GET.
// ============================================================

const db = require("../db"); // MySQL database connection

// -------------------------------------------------------
// @desc    Get all marks with student and subject details
// @route   GET /marks
//
// INNER JOIN explanation:
//   marks           → base table
//   JOIN students   → to get student name from student_id
//   JOIN subjects   → to get subject name from subject_id
//
// Result columns returned:
//   mark_id, marks, student_id, student_name,
//   subject_id, subject_name
// -------------------------------------------------------
const getAllMarks = (req, res) => {
  const sql = `
    SELECT
      m.mark_id,
      m.marks,
      s.student_id,
      s.name        AS student_name,
      s.department,
      s.semester,
      sub.subject_id,
      sub.subject_name,
      sub.credits
    FROM marks m
    INNER JOIN students s   ON m.student_id  = s.student_id
    INNER JOIN subjects sub ON m.subject_id  = sub.subject_id
    ORDER BY m.mark_id ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching marks:", err.message);
      return res.status(500).json({ success: false, message: "Database error while fetching marks." });
    }

    res.status(200).json({ success: true, data: results });
  });
};

// -------------------------------------------------------
// @desc    Add a new marks entry
// @route   POST /marks
// @body    { student_id, subject_id, marks }
// -------------------------------------------------------
const addMark = (req, res) => {
  const { student_id, subject_id, marks } = req.body;

  // --- Validate all required fields are present ---
  if (!student_id || !subject_id || marks === undefined || marks === "") {
    return res.status(400).json({
      success: false,
      message: "student_id, subject_id, and marks are all required.",
    });
  }

  // --- Validate marks is a number between 0 and 100 ---
  const marksNum = parseFloat(marks);
  if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
    return res.status(400).json({
      success: false,
      message: "Marks must be a number between 0 and 100.",
    });
  }

  // --- Check if the student actually exists ---
  db.query("SELECT student_id FROM students WHERE student_id = ?", [student_id], (err, studentRows) => {
    if (err) return res.status(500).json({ success: false, message: "DB error checking student." });
    if (studentRows.length === 0) {
      return res.status(404).json({ success: false, message: "Selected student does not exist." });
    }

    // --- Check if the subject actually exists ---
    db.query("SELECT subject_id FROM subjects WHERE subject_id = ?", [subject_id], (err, subjectRows) => {
      if (err) return res.status(500).json({ success: false, message: "DB error checking subject." });
      if (subjectRows.length === 0) {
        return res.status(404).json({ success: false, message: "Selected subject does not exist." });
      }

      // --- Check for duplicate: same student + same subject ---
      db.query(
        "SELECT mark_id FROM marks WHERE student_id = ? AND subject_id = ?",
        [student_id, subject_id],
        (err, dupRows) => {
          if (err) return res.status(500).json({ success: false, message: "DB error checking duplicates." });
          if (dupRows.length > 0) {
            return res.status(409).json({
              success: false,
              message: "Marks for this student and subject already exist. Use Edit to update.",
            });
          }

          // --- All checks passed — insert the marks record ---
          const sql    = "INSERT INTO marks (student_id, subject_id, marks) VALUES (?, ?, ?)";
          const values = [student_id, subject_id, marksNum];

          db.query(sql, values, (err, result) => {
            if (err) {
              console.error("Error adding marks:", err.message);
              return res.status(500).json({ success: false, message: "Database error while adding marks." });
            }

            res.status(201).json({
              success: true,
              message: "Marks added successfully.",
              mark_id: result.insertId,
            });
          });
        }
      );
    });
  });
};

// -------------------------------------------------------
// @desc    Update marks for an existing entry by ID
// @route   PUT /marks/:id
// @params  id — mark_id in the database
// @body    { student_id, subject_id, marks }
// -------------------------------------------------------
const updateMark = (req, res) => {
  const { id } = req.params;
  const { student_id, subject_id, marks } = req.body;

  // Validate required fields
  if (!student_id || !subject_id || marks === undefined || marks === "") {
    return res.status(400).json({
      success: false,
      message: "student_id, subject_id, and marks are all required.",
    });
  }

  // Validate marks range
  const marksNum = parseFloat(marks);
  if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
    return res.status(400).json({
      success: false,
      message: "Marks must be a number between 0 and 100.",
    });
  }

  const sql = `
    UPDATE marks
    SET student_id = ?, subject_id = ?, marks = ?
    WHERE mark_id = ?
  `;
  const values = [student_id, subject_id, marksNum, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating marks:", err.message);
      return res.status(500).json({ success: false, message: "Database error while updating marks." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `No marks record found with ID ${id}.` });
    }

    res.status(200).json({ success: true, message: "Marks updated successfully." });
  });
};

// -------------------------------------------------------
// @desc    Delete a marks entry by ID
// @route   DELETE /marks/:id
// @params  id — mark_id in the database
// -------------------------------------------------------
const deleteMark = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM marks WHERE mark_id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting marks:", err.message);
      return res.status(500).json({ success: false, message: "Database error while deleting marks." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `No marks record found with ID ${id}.` });
    }

    res.status(200).json({ success: true, message: "Marks deleted successfully." });
  });
};

// Export all controller functions
module.exports = {
  getAllMarks,
  addMark,
  updateMark,
  deleteMark,
};