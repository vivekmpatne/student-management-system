// ============================================================
// controllers/studentController.js
// Handles all business logic for Student CRUD operations
// ============================================================

const db = require("../db"); // Import the MySQL database connection

// -------------------------------------------------------
// @desc    Get all students
// @route   GET /students
// -------------------------------------------------------
const getAllStudents = (req, res) => {
  const sql = "SELECT * FROM students ORDER BY student_id ASC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching students:", err.message);
      return res.status(500).json({ success: false, message: "Database error while fetching students." });
    }

    res.status(200).json({ success: true, data: results });
  });
};

// -------------------------------------------------------
// @desc    Add a new student
// @route   POST /students
// @body    { name, email, phone, department, semester }
// -------------------------------------------------------
const addStudent = (req, res) => {
  const { name, email, phone, department, semester } = req.body;

  // Basic validation — check required fields
  if (!name || !email || !department || !semester) {
    return res.status(400).json({ success: false, message: "Name, email, department, and semester are required." });
  }

  const sql = "INSERT INTO students (name, email, phone, department, semester) VALUES (?, ?, ?, ?, ?)";
  const values = [name, email, phone, department, semester];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error adding student:", err.message);

      // Handle duplicate email error (MySQL error code 1062)
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, message: "A student with this email already exists." });
      }

      return res.status(500).json({ success: false, message: "Database error while adding student." });
    }

    res.status(201).json({
      success: true,
      message: "Student added successfully.",
      student_id: result.insertId, // Return the new student's ID
    });
  });
};

// -------------------------------------------------------
// @desc    Update an existing student by ID
// @route   PUT /students/:id
// @params  id — student_id in the database
// @body    { name, email, phone, department, semester }
// -------------------------------------------------------
const updateStudent = (req, res) => {
  const { id } = req.params;
  const { name, email, phone, department, semester } = req.body;

  // Basic validation
  if (!name || !email || !department || !semester) {
    return res.status(400).json({ success: false, message: "Name, email, department, and semester are required." });
  }

  const sql = `
    UPDATE students 
    SET name = ?, email = ?, phone = ?, department = ?, semester = ?
    WHERE student_id = ?
  `;
  const values = [name, email, phone, department, semester, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating student:", err.message);
      return res.status(500).json({ success: false, message: "Database error while updating student." });
    }

    // affectedRows = 0 means no student was found with that ID
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `No student found with ID ${id}.` });
    }

    res.status(200).json({ success: true, message: "Student updated successfully." });
  });
};

// -------------------------------------------------------
// @desc    Delete a student by ID
// @route   DELETE /students/:id
// @params  id — student_id in the database
// -------------------------------------------------------
const deleteStudent = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM students WHERE student_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting student:", err.message);
      return res.status(500).json({ success: false, message: "Database error while deleting student." });
    }

    // affectedRows = 0 means no student was found with that ID
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `No student found with ID ${id}.` });
    }

    res.status(200).json({ success: true, message: "Student deleted successfully." });
  });
};

// Export all controller functions for use in routes
module.exports = {
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
};