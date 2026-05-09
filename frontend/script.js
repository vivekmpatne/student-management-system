// ============================================================
// script.js — Student Management System Frontend Logic
// Uses: fetch API, Vanilla JS, Bootstrap Toast
// Backend: Express + MySQL on http://localhost:5000
// ============================================================

// -----------------------------------------------------------
// CONFIGURATION
// Change this URL if your backend runs on a different port.
// -----------------------------------------------------------
const API_BASE = "https://student-management-backend-n02t.onrender.com";

// -----------------------------------------------------------
// STATE
// isEditMode: tracks whether the form is in Add or Edit mode
// -----------------------------------------------------------
let isEditMode = false;

// ============================================================
// ON PAGE LOAD — fetch and display all students immediately
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  fetchAllStudents();
  fetchAllSubjects();

  // Populate the dropdowns in the marks form
  populateStudentDropdown();
  populateSubjectDropdown();
  
  fetchAllMarks();
});

// ============================================================
// FETCH ALL STUDENTS
// GET /students
// Populates the student table with all records from the DB.
// ============================================================
async function fetchAllStudents() {
  // Show the spinner, hide the table and empty state
  showSpinner();

  try {
    const response = await fetch(`${API_BASE}/students`);
    const result = await response.json();

    if (result.success) {
      renderStudentTable(result.data); // Render fetched data into the table
    } else {
      showToast("Failed to load students.", "error");
      showEmptyState();
    }
  } catch (err) {
    // Network error or backend not running
    console.error("Fetch error:", err);
    showToast("Could not connect to the server. Is the backend running?", "error");
    showEmptyState();
  }
}

// ============================================================
// RENDER STUDENT TABLE
// Takes an array of student objects and builds the HTML table.
// ============================================================
function renderStudentTable(students) {
  const tbody = document.getElementById("studentTableBody");
  const countBadge = document.getElementById("studentCountBadge");

  // Update the record count badge
  countBadge.textContent = `${students.length} Record${students.length !== 1 ? "s" : ""}`;

  // If no students exist, show the empty state instead of the table
  if (students.length === 0) {
    showEmptyState();
    return;
  }

  // Build table rows dynamically
  tbody.innerHTML = students.map((student, index) => `
    <tr>
      <!-- Serial number (1-based) -->
      <td>${index + 1}</td>

      <!-- Student name -->
      <td>${escapeHtml(student.name)}</td>

      <!-- Email address -->
      <td>${escapeHtml(student.email)}</td>

      <!-- Phone (show '—' if not provided) -->
      <td>${student.phone ? escapeHtml(student.phone) : "<span style='color:#444c5e'>—</span>"}</td>

      <!-- Department pill tag -->
      <td><span class="dept-tag">${escapeHtml(student.department)}</span></td>

      <!-- Semester badge -->
      <td><span class="sem-badge">Sem ${escapeHtml(String(student.semester))}</span></td>

      <!-- Action buttons: Edit + Delete -->
      <td class="text-center">
        <!--
          onclick passes the full student object as a JSON string.
          We use encodeURIComponent to safely handle special characters.
        -->
        <button
          class="btn-edit"
          onclick='openEditMode(${JSON.stringify(student)})'
          title="Edit Student"
        >
          <i class="bi bi-pencil-fill me-1"></i>Edit
        </button>

        <button
          class="btn-delete"
          onclick="deleteStudent(${student.student_id})"
          title="Delete Student"
        >
          <i class="bi bi-trash3-fill me-1"></i>Delete
        </button>
      </td>
    </tr>
  `).join(""); // join removes commas between array items

  // Show the table, hide spinner and empty state
  showTable();
}

// ============================================================
// HANDLE FORM SUBMIT
// Decides whether to call addStudent() or updateStudent()
// based on the current mode (isEditMode flag).
// ============================================================
function handleFormSubmit() {
  if (isEditMode) {
    updateStudent(); // Update existing student
  } else {
    addStudent();    // Add new student
  }
}

// ============================================================
// ADD STUDENT
// POST /students
// Reads form values, sends POST request, refreshes table.
// ============================================================
async function addStudent() {
  // Read values from the form
  const studentData = getFormValues();

  // Frontend validation
  if (!validateForm(studentData)) return;

  try {
    const response = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData), // Send data as JSON
    });

    const result = await response.json();

    if (result.success) {
      showToast("Student added successfully! ✅", "success");
      clearForm();           // Clear the form inputs
      fetchAllStudents();    // Refresh the table
    } else {
      // Show backend error message (e.g., duplicate email)
      showToast(result.message || "Failed to add student.", "error");
    }
  } catch (err) {
    console.error("Add student error:", err);
    showToast("Server error. Please try again.", "error");
  }
}

// ============================================================
// OPEN EDIT MODE
// Called when the Edit button in a table row is clicked.
// Pre-fills the form with the student's current data.
// ============================================================
function openEditMode(student) {
  isEditMode = true; // Switch to edit mode

  // Store the student ID in the hidden field
  document.getElementById("studentId").value = student.student_id;

  // Pre-fill all form fields with the student's current values
  document.getElementById("name").value       = student.name;
  document.getElementById("email").value      = student.email;
  document.getElementById("phone").value      = student.phone || "";
  document.getElementById("department").value = student.department;
  document.getElementById("semester").value   = student.semester;

  // Update the form header text and button label
  document.getElementById("formTitle").innerHTML =
    `<i class="bi bi-pencil-fill me-2" style="color:var(--accent)"></i>Edit Student — ${escapeHtml(student.name)}`;
  document.getElementById("submitBtn").innerHTML =
    `<i class="bi bi-check-circle me-2"></i>Update Student`;

  // Show the Cancel button
  document.getElementById("cancelEditBtn").classList.remove("d-none");

  // Scroll to the form so the user sees it
  document.querySelector(".sms-card").scrollIntoView({ behavior: "smooth" });
}

// ============================================================
// UPDATE STUDENT
// PUT /students/:id
// Sends updated form data to the backend.
// ============================================================
async function updateStudent() {
  const id = document.getElementById("studentId").value; // Get stored student ID
  const studentData = getFormValues();

  // Frontend validation
  if (!validateForm(studentData)) return;

  try {
    const response = await fetch(`${API_BASE}/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });

    const result = await response.json();

    if (result.success) {
      showToast("Student updated successfully! ✅", "success");
      cancelEdit();        // Reset form to Add mode
      fetchAllStudents();  // Refresh the table
    } else {
      showToast(result.message || "Failed to update student.", "error");
    }
  } catch (err) {
    console.error("Update student error:", err);
    showToast("Server error. Please try again.", "error");
  }
}

// ============================================================
// DELETE STUDENT
// DELETE /students/:id
// Asks for confirmation before deleting.
// ============================================================
async function deleteStudent(id) {
  // Show a browser confirmation dialog
  const confirmed = confirm("Are you sure you want to delete this student? This action cannot be undone.");
  if (!confirmed) return; // User clicked Cancel

  try {
    const response = await fetch(`${API_BASE}/students/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      showToast("Student deleted successfully.", "success");
      fetchAllStudents(); // Refresh the table
    } else {
      showToast(result.message || "Failed to delete student.", "error");
    }
  } catch (err) {
    console.error("Delete student error:", err);
    showToast("Server error. Please try again.", "error");
  }
}

// ============================================================
// CANCEL EDIT MODE
// Resets the form back to "Add Student" mode.
// ============================================================
function cancelEdit() {
  isEditMode = false;

  // Clear all form fields and the hidden student ID
  clearForm();

  // Restore original form header text and button label
  document.getElementById("formTitle").innerHTML =
    `<i class="bi bi-person-plus-fill me-2"></i>Add New Student`;
  document.getElementById("submitBtn").innerHTML =
    `<i class="bi bi-plus-circle me-2"></i>Add Student`;

  // Hide the Cancel button again
  document.getElementById("cancelEditBtn").classList.add("d-none");
}

// ============================================================
// HELPER: GET FORM VALUES
// Reads all input fields and returns a clean object.
// ============================================================
function getFormValues() {
  return {
    name:       document.getElementById("name").value.trim(),
    email:      document.getElementById("email").value.trim(),
    phone:      document.getElementById("phone").value.trim(),
    department: document.getElementById("department").value,
    semester:   document.getElementById("semester").value,
  };
}

// ============================================================
// HELPER: VALIDATE FORM
// Returns true if all required fields are filled.
// ============================================================
function validateForm(data) {
  if (!data.name) {
    showToast("Please enter the student's name.", "error");
    return false;
  }
  if (!data.email) {
    showToast("Please enter the student's email.", "error");
    return false;
  }
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showToast("Please enter a valid email address.", "error");
    return false;
  }
  if (!data.department) {
    showToast("Please select a department.", "error");
    return false;
  }
  if (!data.semester) {
    showToast("Please select a semester.", "error");
    return false;
  }
  return true; // All checks passed
}

// ============================================================
// HELPER: CLEAR FORM FIELDS
// Resets all input fields to empty / default state.
// ============================================================
function clearForm() {
  document.getElementById("studentId").value   = "";
  document.getElementById("name").value        = "";
  document.getElementById("email").value       = "";
  document.getElementById("phone").value       = "";
  document.getElementById("department").value  = "";
  document.getElementById("semester").value    = "";
}

// ============================================================
// HELPER: ESCAPE HTML
// Prevents XSS by escaping special characters in user data
// before injecting into the DOM.
// ============================================================
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================
// HELPER: SHOW TOAST NOTIFICATION
// type: "success" or "error"
// ============================================================
function showToast(message, type = "success") {
  const toastEl  = document.getElementById("smsToast");
  const toastMsg = document.getElementById("toastMessage");

  // Set message text
  toastMsg.textContent = message;

  // Remove any previous type classes and apply the correct one
  toastEl.classList.remove("toast-success", "toast-error");
  toastEl.classList.add(type === "error" ? "toast-error" : "toast-success");

  // Initialize and show the Bootstrap Toast
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
}

// ============================================================
// HELPER: UI STATE SWITCHERS
// Controls what's visible: spinner / table / empty state
// ============================================================

function showSpinner() {
  document.getElementById("loadingSpinner").style.display = "block";
  document.getElementById("tableWrapper").style.display   = "none";
  document.getElementById("emptyState").style.display     = "none";
}

function showTable() {
  document.getElementById("loadingSpinner").style.display = "none";
  document.getElementById("tableWrapper").style.display   = "block";
  document.getElementById("emptyState").style.display     = "none";
}

function showEmptyState() {
  document.getElementById("loadingSpinner").style.display = "none";
  document.getElementById("tableWrapper").style.display   = "none";
  document.getElementById("emptyState").style.display     = "block";
}


// ============================================================
// SUBJECT MODULE — Append this entire block to your script.js
// These are additions only — nothing above is changed.
// ============================================================

// -----------------------------------------------------------
// SUBJECT STATE
// isSubjectEditMode: tracks Add vs Edit mode for subject form
// -----------------------------------------------------------
let isSubjectEditMode = false;

// ============================================================
// ON PAGE LOAD — also fetch subjects when the page loads.
//
// ACTION REQUIRED in your existing script.js:
// Find this line at the top of script.js:
//
//   document.addEventListener("DOMContentLoaded", () => {
//     fetchAllStudents();
//   });
//
// Change it to:
//
//   document.addEventListener("DOMContentLoaded", () => {
//     fetchAllStudents();
//     fetchAllSubjects();   // ← ADD THIS LINE
//   });
// ============================================================


// ============================================================
// FETCH ALL SUBJECTS
// GET /subjects
// Populates the subject table with all records from the DB.
// ============================================================
async function fetchAllSubjects() {
  // Show spinner, hide table and empty state
  showSubjectSpinner();

  try {
    const response = await fetch(`${API_BASE}/subjects`);
    const result   = await response.json();

    if (result.success) {
      renderSubjectTable(result.data);
    } else {
      showToast("Failed to load subjects.", "error");
      showSubjectEmptyState();
    }
  } catch (err) {
    console.error("Subject fetch error:", err);
    showToast("Could not load subjects. Is the backend running?", "error");
    showSubjectEmptyState();
  }
}

// ============================================================
// RENDER SUBJECT TABLE
// Takes an array of subject objects and builds the HTML table.
// ============================================================
function renderSubjectTable(subjects) {
  const tbody      = document.getElementById("subjectTableBody");
  const countBadge = document.getElementById("subjectCountBadge");

  // Update record count badge
  countBadge.textContent = `${subjects.length} Record${subjects.length !== 1 ? "s" : ""}`;

  if (subjects.length === 0) {
    showSubjectEmptyState();
    return;
  }

  // Build table rows dynamically
  tbody.innerHTML = subjects.map((subject, index) => `
    <tr>
      <!-- Serial number -->
      <td>${index + 1}</td>

      <!-- Subject name -->
      <td>${escapeHtml(subject.subject_name)}</td>

      <!-- Credits badge -->
      <td>
        <span class="credits-badge">
          <i class="bi bi-award-fill me-1" style="font-size:0.7rem;"></i>
          ${escapeHtml(String(subject.credits))} Credit${subject.credits !== 1 ? "s" : ""}
        </span>
      </td>

      <!-- Action buttons -->
      <td class="text-center">
        <button
          class="btn-edit"
          onclick='openSubjectEditMode(${JSON.stringify(subject)})'
          title="Edit Subject"
        >
          <i class="bi bi-pencil-fill me-1"></i>Edit
        </button>

        <button
          class="btn-delete"
          onclick="deleteSubject(${subject.subject_id})"
          title="Delete Subject"
        >
          <i class="bi bi-trash3-fill me-1"></i>Delete
        </button>
      </td>
    </tr>
  `).join("");

  showSubjectTable();
}

// ============================================================
// HANDLE SUBJECT FORM SUBMIT
// Decides Add or Update based on isSubjectEditMode flag.
// ============================================================
function handleSubjectFormSubmit() {
  if (isSubjectEditMode) {
    updateSubject();
  } else {
    addSubject();
  }
}

// ============================================================
// ADD SUBJECT
// POST /subjects
// ============================================================
async function addSubject() {
  const subjectData = getSubjectFormValues();

  if (!validateSubjectForm(subjectData)) return;

  try {
    const response = await fetch(`${API_BASE}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subjectData),
    });

    const result = await response.json();

    if (result.success) {
      showToast("Subject added successfully! ✅", "success");
      clearSubjectForm();
      fetchAllSubjects(); // Refresh table
    } else {
      showToast(result.message || "Failed to add subject.", "error");
    }
  } catch (err) {
    console.error("Add subject error:", err);
    showToast("Server error. Please try again.", "error");
  }
}

// ============================================================
// OPEN SUBJECT EDIT MODE
// Pre-fills the subject form with existing values.
// ============================================================
function openSubjectEditMode(subject) {
  isSubjectEditMode = true;

  // Store the subject ID in the hidden field
  document.getElementById("subjectId").value    = subject.subject_id;

  // Pre-fill form fields
  document.getElementById("subjectName").value  = subject.subject_name;
  document.getElementById("credits").value      = subject.credits;

  // Update form header and button label
  document.getElementById("subjectFormTitle").innerHTML =
    `<i class="bi bi-pencil-fill me-2" style="color:var(--accent)"></i>Edit Subject — ${escapeHtml(subject.subject_name)}`;
  document.getElementById("subjectSubmitBtn").innerHTML =
    `<i class="bi bi-check-circle me-2"></i>Update Subject`;

  // Show Cancel button
  document.getElementById("cancelSubjectEditBtn").classList.remove("d-none");

  // Scroll to subject form
  document.getElementById("subjectFormCard").scrollIntoView({ behavior: "smooth" });
}

// ============================================================
// UPDATE SUBJECT
// PUT /subjects/:id
// ============================================================
async function updateSubject() {
  const id          = document.getElementById("subjectId").value;
  const subjectData = getSubjectFormValues();

  if (!validateSubjectForm(subjectData)) return;

  try {
    const response = await fetch(`${API_BASE}/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subjectData),
    });

    const result = await response.json();

    if (result.success) {
      showToast("Subject updated successfully! ✅", "success");
      cancelSubjectEdit();   // Reset to Add mode
      fetchAllSubjects();    // Refresh table
    } else {
      showToast(result.message || "Failed to update subject.", "error");
    }
  } catch (err) {
    console.error("Update subject error:", err);
    showToast("Server error. Please try again.", "error");
  }
}

// ============================================================
// DELETE SUBJECT
// DELETE /subjects/:id
// ============================================================
async function deleteSubject(id) {
  const confirmed = confirm("Are you sure you want to delete this subject? This may also affect marks records.");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/subjects/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      showToast("Subject deleted successfully.", "success");
      fetchAllSubjects(); // Refresh table
    } else {
      // Shows the FK constraint message if subject is used in marks
      showToast(result.message || "Failed to delete subject.", "error");
    }
  } catch (err) {
    console.error("Delete subject error:", err);
    showToast("Server error. Please try again.", "error");
  }
}

// ============================================================
// CANCEL SUBJECT EDIT MODE
// Resets the subject form back to "Add Subject" mode.
// ============================================================
function cancelSubjectEdit() {
  isSubjectEditMode = false;

  clearSubjectForm();

  document.getElementById("subjectFormTitle").innerHTML =
    `<i class="bi bi-journal-plus me-2"></i>Add New Subject`;
  document.getElementById("subjectSubmitBtn").innerHTML =
    `<i class="bi bi-plus-circle me-2"></i>Add Subject`;

  document.getElementById("cancelSubjectEditBtn").classList.add("d-none");
}

// ============================================================
// HELPER: GET SUBJECT FORM VALUES
// ============================================================
function getSubjectFormValues() {
  return {
    subject_name: document.getElementById("subjectName").value.trim(),
    credits:      document.getElementById("credits").value,
  };
}

// ============================================================
// HELPER: VALIDATE SUBJECT FORM
// ============================================================
function validateSubjectForm(data) {
  if (!data.subject_name) {
    showToast("Please enter a subject name.", "error");
    return false;
  }
  if (data.subject_name.length < 2) {
    showToast("Subject name must be at least 2 characters.", "error");
    return false;
  }
  if (!data.credits) {
    showToast("Please select the number of credits.", "error");
    return false;
  }
  return true;
}

// ============================================================
// HELPER: CLEAR SUBJECT FORM FIELDS
// ============================================================
function clearSubjectForm() {
  document.getElementById("subjectId").value   = "";
  document.getElementById("subjectName").value = "";
  document.getElementById("credits").value     = "";
}

// ============================================================
// HELPER: SUBJECT UI STATE SWITCHERS
// Controls spinner / table / empty state visibility
// ============================================================

function showSubjectSpinner() {
  document.getElementById("subjectLoadingSpinner").style.display = "block";
  document.getElementById("subjectTableWrapper").style.display   = "none";
  document.getElementById("subjectEmptyState").style.display     = "none";
}

function showSubjectTable() {
  document.getElementById("subjectLoadingSpinner").style.display = "none";
  document.getElementById("subjectTableWrapper").style.display   = "block";
  document.getElementById("subjectEmptyState").style.display     = "none";
}

function showSubjectEmptyState() {
  document.getElementById("subjectLoadingSpinner").style.display = "none";
  document.getElementById("subjectTableWrapper").style.display   = "none";
  document.getElementById("subjectEmptyState").style.display     = "block";
}

// ============================================================
// MARKS MODULE — Append this entire block to your script.js
// These are additions only — nothing above is changed.
//
// ACTION REQUIRED in your existing script.js:
// Find the DOMContentLoaded listener and add two lines:
//
//   document.addEventListener("DOMContentLoaded", () => {
//     fetchAllStudents();
//     fetchAllSubjects();
//     populateStudentDropdown();   // ← ADD THIS
//     populateSubjectDropdown();   // ← ADD THIS
//     fetchAllMarks();             // ← ADD THIS
//   });
// ============================================================


// -----------------------------------------------------------
// MARKS STATE
// isMarksEditMode: tracks Add vs Edit mode for marks form
// -----------------------------------------------------------
let isMarksEditMode = false;


// ============================================================
// POPULATE STUDENT DROPDOWN
// Fetches all students from GET /students and fills the
// "Select Student" <select> in the marks form.
// ============================================================
async function populateStudentDropdown() {
  const select = document.getElementById("markStudentId");

  try {
    const response = await fetch(`${API_BASE}/students`);
    const result   = await response.json();

    if (result.success && result.data.length > 0) {
      // Build one <option> per student
      // value = student_id, label = name + department + sem
      select.innerHTML = `<option value="" disabled selected>Select a Student</option>` +
        result.data.map(s =>
          `<option value="${s.student_id}">
            ${escapeHtml(s.name)} — ${escapeHtml(s.department)}, Sem ${s.semester}
          </option>`
        ).join("");
    } else {
      select.innerHTML = `<option value="" disabled selected>No students found</option>`;
    }
  } catch (err) {
    console.error("Error loading student dropdown:", err);
    select.innerHTML = `<option value="" disabled selected>Error loading students</option>`;
  }
}


// ============================================================
// POPULATE SUBJECT DROPDOWN
// Fetches all subjects from GET /subjects and fills the
// "Select Subject" <select> in the marks form.
// ============================================================
async function populateSubjectDropdown() {
  const select = document.getElementById("markSubjectId");

  try {
    const response = await fetch(`${API_BASE}/subjects`);
    const result   = await response.json();

    if (result.success && result.data.length > 0) {
      // value = subject_id, label = subject_name + credits
      select.innerHTML = `<option value="" disabled selected>Select a Subject</option>` +
        result.data.map(sub =>
          `<option value="${sub.subject_id}">
            ${escapeHtml(sub.subject_name)} (${sub.credits} cr)
          </option>`
        ).join("");
    } else {
      select.innerHTML = `<option value="" disabled selected>No subjects found</option>`;
    }
  } catch (err) {
    console.error("Error loading subject dropdown:", err);
    select.innerHTML = `<option value="" disabled selected>Error loading subjects</option>`;
  }
}


// ============================================================
// FETCH ALL MARKS
// GET /marks
// Returns marks joined with student name and subject name.
// ============================================================
async function fetchAllMarks() {
  showMarksSpinner();

  try {
    const response = await fetch(`${API_BASE}/marks`);
    const result   = await response.json();

    if (result.success) {
      renderMarksTable(result.data);
    } else {
      showToast("Failed to load marks.", "error");
      showMarksEmptyState();
    }
  } catch (err) {
    console.error("Marks fetch error:", err);
    showToast("Could not load marks. Is the backend running?", "error");
    showMarksEmptyState();
  }
}


// ============================================================
// RENDER MARKS TABLE
// Builds the HTML rows from the JOIN result data.
// ============================================================
function renderMarksTable(marksList) {
  const tbody      = document.getElementById("marksTableBody");
  const countBadge = document.getElementById("marksCountBadge");

  // Update record count badge
  countBadge.textContent = `${marksList.length} Record${marksList.length !== 1 ? "s" : ""}`;

  if (marksList.length === 0) {
    showMarksEmptyState();
    return;
  }

  tbody.innerHTML = marksList.map((m, index) => `
    <tr>
      <!-- Serial number -->
      <td>${index + 1}</td>

      <!-- Student name (from JOIN) -->
      <td><strong>${escapeHtml(m.student_name)}</strong></td>

      <!-- Department -->
      <td><span class="dept-tag">${escapeHtml(m.department)}</span></td>

      <!-- Semester -->
      <td><span class="sem-badge">Sem ${m.semester}</span></td>

      <!-- Subject name (from JOIN) -->
      <td>${escapeHtml(m.subject_name)}</td>

      <!-- Credits -->
      <td><span class="credits-badge">${m.credits} Cr</span></td>

      <!-- Marks value -->
      <td>
        <span class="marks-value">
          ${m.marks}<span>/100</span>
        </span>
      </td>

      <!-- Auto-calculated grade badge -->
      <td>${buildGradeBadge(m.marks)}</td>

      <!-- Edit + Delete action buttons -->
      <td class="text-center">
        <button
          class="btn-edit"
          onclick='openMarksEditMode(${JSON.stringify(m)})'
          title="Edit Marks"
        >
          <i class="bi bi-pencil-fill me-1"></i>Edit
        </button>

        <button
          class="btn-delete"
          onclick="deleteMark(${m.mark_id})"
          title="Delete Marks"
        >
          <i class="bi bi-trash3-fill me-1"></i>Delete
        </button>
      </td>
    </tr>
  `).join("");

  showMarksTable();
}


// ============================================================
// HANDLE MARKS FORM SUBMIT
// Routes to addMark() or updateMark() based on edit mode.
// ============================================================
function handleMarksFormSubmit() {
  if (isMarksEditMode) {
    updateMark();
  } else {
    addMark();
  }
}


// ============================================================
// ADD MARK
// POST /marks
// ============================================================
async function addMark() {
  const markData = getMarksFormValues();
  if (!validateMarksForm(markData)) return;

  try {
    const response = await fetch(`${API_BASE}/marks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(markData),
    });

    const result = await response.json();

    if (result.success) {
      showToast("Marks added successfully! ✅", "success");
      clearMarksForm();
      fetchAllMarks(); // Refresh the table
    } else {
      // e.g. "Marks for this student and subject already exist"
      showToast(result.message || "Failed to add marks.", "error");
    }
  } catch (err) {
    console.error("Add marks error:", err);
    showToast("Server error. Please try again.", "error");
  }
}


// ============================================================
// OPEN MARKS EDIT MODE
// Pre-fills the form with the clicked row's data.
// Called via onclick on each table row's Edit button.
// ============================================================
function openMarksEditMode(mark) {
  isMarksEditMode = true;

  // Store mark_id in hidden field
  document.getElementById("markId").value = mark.mark_id;

  // Pre-select the student and subject in the dropdowns
  document.getElementById("markStudentId").value = mark.student_id;
  document.getElementById("markSubjectId").value = mark.subject_id;

  // Fill in the marks value
  document.getElementById("marksValue").value = mark.marks;

  // Update form header and button
  document.getElementById("marksFormTitle").innerHTML =
    `<i class="bi bi-pencil-fill me-2" style="color:var(--accent)"></i>
     Edit Marks — ${escapeHtml(mark.student_name)} / ${escapeHtml(mark.subject_name)}`;
  document.getElementById("marksSubmitBtn").innerHTML =
    `<i class="bi bi-check-circle me-2"></i>Update Marks`;

  // Show Cancel button
  document.getElementById("cancelMarksEditBtn").classList.remove("d-none");

  // Scroll to form
  document.getElementById("marksFormCard").scrollIntoView({ behavior: "smooth" });
}


// ============================================================
// UPDATE MARK
// PUT /marks/:id
// ============================================================
async function updateMark() {
  const id       = document.getElementById("markId").value;
  const markData = getMarksFormValues();

  if (!validateMarksForm(markData)) return;

  try {
    const response = await fetch(`${API_BASE}/marks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(markData),
    });

    const result = await response.json();

    if (result.success) {
      showToast("Marks updated successfully! ✅", "success");
      cancelMarksEdit();  // Reset to Add mode
      fetchAllMarks();    // Refresh table
    } else {
      showToast(result.message || "Failed to update marks.", "error");
    }
  } catch (err) {
    console.error("Update marks error:", err);
    showToast("Server error. Please try again.", "error");
  }
}


// ============================================================
// DELETE MARK
// DELETE /marks/:id
// ============================================================
async function deleteMark(id) {
  const confirmed = confirm("Are you sure you want to delete this marks entry?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/marks/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      showToast("Marks entry deleted.", "success");
      fetchAllMarks();
    } else {
      showToast(result.message || "Failed to delete marks.", "error");
    }
  } catch (err) {
    console.error("Delete marks error:", err);
    showToast("Server error. Please try again.", "error");
  }
}


// ============================================================
// CANCEL MARKS EDIT MODE
// Resets form back to "Add Marks Entry" state.
// ============================================================
function cancelMarksEdit() {
  isMarksEditMode = false;

  clearMarksForm();

  document.getElementById("marksFormTitle").innerHTML =
    `<i class="bi bi-pencil-square me-2"></i>Add Marks Entry`;
  document.getElementById("marksSubmitBtn").innerHTML =
    `<i class="bi bi-plus-circle me-2"></i>Add Marks`;

  document.getElementById("cancelMarksEditBtn").classList.add("d-none");
}


// ============================================================
// HELPER: GET MARKS FORM VALUES
// ============================================================
function getMarksFormValues() {
  return {
    student_id: document.getElementById("markStudentId").value,
    subject_id: document.getElementById("markSubjectId").value,
    marks:      document.getElementById("marksValue").value,
  };
}


// ============================================================
// HELPER: VALIDATE MARKS FORM
// ============================================================
function validateMarksForm(data) {
  if (!data.student_id) {
    showToast("Please select a student.", "error");
    return false;
  }
  if (!data.subject_id) {
    showToast("Please select a subject.", "error");
    return false;
  }
  if (data.marks === "" || data.marks === null || data.marks === undefined) {
    showToast("Please enter the marks.", "error");
    return false;
  }
  const marksNum = parseFloat(data.marks);
  if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
    showToast("Marks must be between 0 and 100.", "error");
    return false;
  }
  return true;
}


// ============================================================
// HELPER: CLEAR MARKS FORM FIELDS
// ============================================================
function clearMarksForm() {
  document.getElementById("markId").value       = "";
  document.getElementById("markStudentId").value = "";
  document.getElementById("markSubjectId").value = "";
  document.getElementById("marksValue").value    = "";
}


// ============================================================
// HELPER: BUILD GRADE BADGE HTML
// Calculates letter grade from numeric marks and returns
// a styled badge HTML string.
//
// Grading scale:
//   90–100 → O   (Outstanding)
//   80–89  → A+  (Excellent)
//   70–79  → A   (Very Good)
//   60–69  → B+  (Good)
//   50–59  → B   (Average)
//   0–49   → F   (Fail)
// ============================================================
function buildGradeBadge(marks) {
  const m = parseFloat(marks);
  let grade, cssClass;

  if (m >= 90)      { grade = "O";   cssClass = "grade-O";     }
  else if (m >= 80) { grade = "A+";  cssClass = "grade-Aplus"; }
  else if (m >= 70) { grade = "A";   cssClass = "grade-A";     }
  else if (m >= 60) { grade = "B+";  cssClass = "grade-Bplus"; }
  else if (m >= 50) { grade = "B";   cssClass = "grade-B";     }
  else              { grade = "F";   cssClass = "grade-F";     }

  return `<span class="grade-badge ${cssClass}">${grade}</span>`;
}


// ============================================================
// HELPER: MARKS UI STATE SWITCHERS
// ============================================================

function showMarksSpinner() {
  document.getElementById("marksLoadingSpinner").style.display = "block";
  document.getElementById("marksTableWrapper").style.display   = "none";
  document.getElementById("marksEmptyState").style.display     = "none";
}

function showMarksTable() {
  document.getElementById("marksLoadingSpinner").style.display = "none";
  document.getElementById("marksTableWrapper").style.display   = "block";
  document.getElementById("marksEmptyState").style.display     = "none";
}

function showMarksEmptyState() {
  document.getElementById("marksLoadingSpinner").style.display = "none";
  document.getElementById("marksTableWrapper").style.display   = "none";
  document.getElementById("marksEmptyState").style.display     = "block";
}