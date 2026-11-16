# Codec Flow – Full-Stack MERN Project Management Tool

> **Internship Project at Codec Technologies**  
> Developed by **Boopalan**

Codec Flow is an enterprise-grade, modern, and responsive Project Management and Team Collaboration SaaS application built with the **MERN Stack** (MongoDB, Express.js, React 18, Node.js). Inspired by modern agile platforms like ClickUp, Trello, and Asana, it delivers complete project lifecycle management, interactive Kanban workflows, and advanced chronological Gantt chart scheduling.

---

## 🌟 Key Features

### 1. Interactive Drag-and-Drop Kanban Board
- Move task cards fluidly between stages: **To Do**, **In Progress**, **In Review**, and **Completed**.
- **Optimistic UI Updates**: Changes appear immediately on the board with automatic rollback on network errors.
- **Persistent State**: Full synchronization with MongoDB via backend REST APIs (`PATCH /api/tasks/:id/status`).
- Dynamic task search and priority filters (`Low`, `Medium`, `High`, `Critical`).

### 2. Advanced Interactive Gantt Chart
- Visualizes project timelines, milestones, deliverables, and progress percentages.
- **Weekly & Monthly View Modes**: Easily toggle between detailed weekly views and high-level monthly summaries.
- **Timeline Navigation**: Previous (`<`), Next (`>`), and Reset buttons to shift the timeline window.
- **Today Marker**: Automatically highlights the current date with a vertical indicator line.
- **Sticky Column Architecture**: Freezes task names, assignees, and metadata to the left during horizontal scrolling.
- **Two-Tone Progress Indicators**: Outer pill width represents task duration; inner fill denotes completion percentage (`0%`, `40%`, `65%`, `75%`, `100%`).
- **Live Editing**: Authorized Project Managers and Admins can update start dates, deadlines, and progress directly with instant MongoDB persistence.

### 3. Role-Based Access Control (RBAC) & Security
- **Admin**: Full oversight across all users, projects, and platform analytics.
- **Project Manager**: Project ownership, task delegation, timeline adjustments, and reporting.
- **Team Member**: Task status updates, comment discussions, and deadline tracking.
- Password hashing with **bcryptjs** and session management via **JSON Web Tokens (JWT)**.

### 4. Team Collaboration & Notifications
- Task-level threaded comment discussions with author details and timestamps.
- In-app notification center alerting members when tasks are assigned or commented on.
- Mark individual notifications as read or clear all with one click.

### 5. Project Analytics & Intelligence Dashboard
- KPI summaries: Total Tasks, Completed Tasks, Active Execution, and Overdue Tasks.
- Interactive charts powered by **Recharts**:
  - Task Status Breakdown (Donut Pie Chart)
  - Task Priority Distribution (Bar Chart)
  - Team Workload and Allocation Table

### 6. Fully Responsive SaaS UI/UX
- Designed with **Plus Jakarta Sans** typography, dark charcoal navigation accents, and 1.5px high-contrast grid lines.
- Optimized across **desktops, laptops, tablets, and mobile devices** with hamburger navigation drawers and smooth horizontal touch-scrolling.

---

## 🛠️ Technology Stack

### Frontend:
- **React.js 18** with **Vite**
- **Bootstrap 5** & Custom Responsive CSS3
- **React Router DOM v7**
- **React Icons**
- **Recharts** for analytics and data visualization
- **Axios** (with JWT Bearer interceptors)

### Backend:
- **Node.js** & **Express.js** (MVC RESTful API Architecture)
- **MongoDB** & **Mongoose ODM**
- **JSON Web Token (JWT)** authentication
- **bcryptjs** password encryption
- **Morgan** HTTP request logger & **CORS** middleware

---

## 📁 Project Architecture

```text
Project Management Tool/
├── client/
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, Modals)
│   │   ├── context/          # AuthContext for session management
│   │   ├── pages/            # KanbanBoard, GanttChart, Analytics, Notifications, Login
│   │   ├── services/         # Axios API client & interceptors
│   │   ├── App.jsx           # Main tab routing and application shell
│   │   └── index.css         # Global SaaS design system & scroll settings
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/           # MongoDB database connection
│   │   ├── controllers/      # auth, project, task, comment, notification, analytics
│   │   ├── middleware/       # JWT auth & RBAC authorization
│   │   ├── models/           # User, Project, Task, Comment, Notification
│   │   ├── routes/           # Express API route declarations
│   │   └── utils/            # JWT token generator & database seeder
│   ├── .env.example
│   ├── server.js
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017` (or MongoDB Atlas connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/Boopalan03/project-management-tool.git
cd project-management-tool
```

### 2. Configure Backend Environment
Navigate to the `server/` directory and configure environment variables:
```bash
cd server
cp .env.example .env
```
Ensure your `server/.env` includes:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/project_management_db
JWT_SECRET=supersecret_jwt_key_codec_intern_2026_dev
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies & Seed Initial Data
```bash
# In the server/ directory:
npm install
npm run seed     # Seeds realistic demo projects, users, tasks, and timelines
```

### 4. Configure & Start Frontend
In a new terminal window:
```bash
cd client
npm install
npm run dev
```

### 5. Start Backend Server
In your server terminal:
```bash
cd server
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Login Credentials

The built-in database seeder initializes the following test accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Project Manager** | `pm@codec.com` | `password123` |
| **Team Member (Frontend)** | `alex@codec.com` | `password123` |
| **Team Member (Backend)** | `david@codec.com` | `password123` |
| **System Admin** | `admin@codec.com` | `password123` |

---

## 📜 License
This project was developed for academic and evaluation purposes during the internship program at **Codec Technologies**.

