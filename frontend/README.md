# YouTube Clone - Full Stack MERN Application

## 📌 Project Overview
[cite_start]This project is a full-stack YouTube clone built using the MERN stack (MongoDB, Express, React, Node.js)[cite: 3, 69]. [cite_start]It allows users to browse videos, search and filter by category, watch videos with real-time view counts, and engage through a complete comment management system[cite: 2, 41, 125]. [cite_start]Authenticated users can also create their own channels and manage their video content[cite: 45, 123].

---

## 🚀 Key Features

### **Front-End (React)**
* [cite_start]**Home Page**: Features a YouTube header, a toggleable static sidebar, and a responsive grid of video thumbnails[cite: 7, 8, 10].
* [cite_start]**Video Player Page**: Includes a functional video player, title/description display, and interactive Like/Dislike buttons[cite: 37, 38, 40].
* [cite_start]**Comment System**: Full CRUD (Create, Read, Update, Delete) operations for comments directly from the video player page[cite: 42, 125].
* [cite_start]**Channel Page**: Personalized user channels where creators can list, edit, or delete their uploaded videos[cite: 46, 47, 123].
* [cite_start]**Search & Filter**: Implementation of a search bar in the header and 6+ category filter buttons to dynamically sort content[cite: 32, 110, 111].
* [cite_start]**Responsive Design**: Fully optimized for Mobile, Tablet, and Desktop layouts[cite: 51, 95].

### **Back-End (Node.js & Express)**
* [cite_start]**JWT Authentication**: Secure user registration and login using JSON Web Tokens (JWT)[cite: 25, 106].
* [cite_start]**API Design**: Clean, modular RESTful API routes for users, videos, channels, and comments[cite: 55, 88].
* [cite_start]**Database**: MongoDB collections for storing user profiles, video metadata, channel details, and comment threads[cite: 65, 89].

---

## 🛠️ Tech Stack
* [cite_start]**Frontend**: React, Vite, Redux Toolkit, React Router, Axios, Tailwind CSS[cite: 68, 115].
* [cite_start]**Backend**: Node.js, Express.js (Using ES Modules - import/export)[cite: 69, 114].
* [cite_start]**Database**: MongoDB (Local instance via MongoDB Compass)[cite: 71, 120].
* [cite_start]**Security**: JWT for token-based authentication and Bcryptjs for password hashing[cite: 25, 70].

---

## ⚙️ Project Setup & Installation

### **1. Prerequisites**
* Node.js (v18+)
* MongoDB Compass installed and running locally

### **2. Backend Setup**
1.  Navigate to the backend directory: `cd backend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file in the `backend` folder and add:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/youtube_clone
    JWT_SECRET=your_unique_random_secret_string
    ```
4.  **Seed the Database**: Run the seed script to populate 20 videos and sample users:
    ```bash
    node seed.js
    ```
5.  Start the server: `npm start`

### **3. Frontend Setup**
1.  Navigate to the frontend directory: `cd frontend`
2.  Install dependencies: `npm install`
3.  Start the development server:
    ```bash
    npm run dev
    ```

---

## 📂 Folder Structure
```text
/CAPSTONE-PROJECT
├── /backend
│   ├── /config       # Database connection logic
│   ├── /controllers  # Logic for Auth, Videos, Channels, Comments
│   ├── /models       # Mongoose Schemas (User, Video, etc.)
│   ├── /routes       # Express API Endpoints
│   ├── /middleware   # JWT Verification middleware
│   ├── server.js     # Entry point (ES Modules)
│   └── seed.js       # Database seeding script
└── /frontend
    ├── /src
    │   ├── /components  # Reusable UI components
    │   ├── /pages       # Home, VideoPlayer, ChannelPage, Auth
    │   ├── /store       # Redux Slices (State management)
    │   └── /styles      # Tailwind/CSS files
    └── package.json