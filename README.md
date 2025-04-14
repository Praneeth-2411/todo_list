# ✅ Done and Dusted - To-Do List App

A full-stack To-Do List web application built using the **MERN** stack (MongoDB, Express.js, React, Node.js). It offers real-time reminders, dark mode, task search, toast notifications, and a user-friendly interface — all designed to help users manage tasks efficiently.

---

## ✨ Features

- 🔐 User authentication (Signup/Login)
- 🧾 Create, Read, Update, Delete (CRUD) tasks
- ⏰ Real-time reminders using Socket.IO
- 🌙 Dark mode with persistent theme
- 📢 Toast notifications (React Toastify)
- 🔍 Task search with filtered results
- 🔄 Inline editing and completion toggles
- ⚡ Fast, clean, and responsive UI

---

## 🛠️ Tech Stack

### 🖥️ Frontend
- [React](https://reactjs.org/)
- [React Router DOM](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [React Toastify](https://fkhadra.github.io/react-toastify/)
- [Framer Motion](https://www.framer.com/motion/)
- [Socket.IO Client](https://socket.io/)

### ⚙️ Backend
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Socket.IO](https://socket.io/)
- dotenv, cors, body-parser

---

## 📁 Folder Structure

```text
client/
├── components/
│   ├── AddTask.jsx
│   ├── TaskList.jsx
│   └── SearchBar.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── SearchResult.jsx
├── styles/
│   ├── home.css
│   ├── login.css
│   ├── signup.css
│   └── search.css
├── App.jsx
├── socket.js
└── index.js

server/
├── models/
│   └── Task.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── controllers/
│   └── taskController.js
├── socket/
│   └── reminders.js
├── .env
└── index.js

