# 🎓 Student Management System

A modern full-stack Student Management System built using HTML, CSS, JavaScript, Node.js, Express.js, and MySQL.

Designed as a DBMS mini project to manage student records, subjects, academic marks, and performance data through a clean and responsive interface with complete CRUD operations.

---

## 🌐 Live Demo

### Frontend
https://student-management-ui-two.vercel.app

### Backend API
https://student-management-backend-n02t.onrender.com

---

# 📌 Problem Statement

Managing academic records manually becomes difficult as student data grows.

This project solves that problem by providing a centralized platform to:

- Manage student information
- Manage subjects and credits
- Store and update marks
- Track academic records
- Perform CRUD operations efficiently

The system demonstrates practical implementation of:
- Relational databases
- REST APIs
- Backend integration
- Cloud deployment
- Full-stack application workflow

---

# ✨ Features

## 👨‍🎓 Student Management
- Add new students
- Update student details
- Delete students
- View all student records

## 📚 Subject Management
- Add subjects
- Assign subject credits
- Update/Delete subjects

## 📊 Marks Management
- Add marks for students
- Grade calculation
- Academic performance tracking
- Edit/Delete marks

## ☁️ Deployment Features
- Cloud-hosted frontend
- Hosted backend APIs
- Managed MySQL database
- Production-ready deployment workflow

---

# 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Deployment | Vercel, Render, Railway |
| Version Control | Git & GitHub |

---

# 🏗️ System Architecture

```text
Frontend (HTML/CSS/JS)
        ↓
REST API Requests
        ↓
Node.js + Express Backend
        ↓
MySQL Database (Railway)
```

---

# ⚡ Key Functionalities

- Full CRUD operations
- REST API integration
- Dynamic dropdown management
- Student-subject relation handling
- Marks and grades management
- Cloud database connectivity
- Responsive modern UI
- Real-time data rendering

---

# 📂 Project Structure

```bash
student_mgmt_system/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── db.js
│   ├── server.js
│   └── .env
│
├── database/
│
├── frontend/
│   ├── assets/
│   │   ├── logo.png
│   │   └── favicon.svg
│   │
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

# 🚀 Getting Started

## 1️⃣ Clone Repository

```bash
git clone https://github.com/vivekmpatne/student-management-system.git
```

---

## 2️⃣ Navigate to Project

```bash
cd student-management-system
```

---

## 3️⃣ Install Dependencies

```bash
npm install
```

---

## 4️⃣ Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_mysql_connection_url
PORT=10000
```

---

## 5️⃣ Run the Project

```bash
npm run dev
```

Server runs on:

```bash
http://localhost:10000
```

---

# 🔌 API Endpoints

## Student APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | /students | Fetch all students |
| POST | /students | Add student |
| PUT | /students/:id | Update student |
| DELETE | /students/:id | Delete student |

---

## Subject APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | /subjects | Fetch subjects |
| POST | /subjects | Add subject |
| PUT | /subjects/:id | Update subject |
| DELETE | /subjects/:id | Delete subject |

---

## Marks APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | /marks | Fetch marks |
| POST | /marks | Add marks |
| PUT | /marks/:id | Update marks |
| DELETE | /marks/:id | Delete marks |


# 📈 Future Improvements

- JWT Authentication
- Role-based access control
- Search & filtering
- Pagination
- Dashboard analytics
- Attendance system
- Result export (PDF/Excel)
- Mobile responsive optimization
- Docker deployment
- Admin panel

---

# 👨‍💻 Author

## Vivek Patne

- GitHub: https://github.com/vivekmpatne
- LinkedIn: https://www.linkedin.com/in/vivekpatnem/

---

# 🙌 Acknowledgements

This project was developed as a DBMS mini project for learning:
- Full-stack development
- REST APIs
- Database management
- Cloud deployment
- Real-world CRUD workflows

Special thanks to:
- Node.js community
- Express.js documentation
- Railway, Render & Vercel platforms

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you liked this project:
- Star the repository
- Share feedback
- Connect on LinkedIn
