# YouTube Clone - Full Stack MERN Application

##  Project Overview
A robust, full-stack video-sharing platform built with the MERN stack. This application replicates core YouTube functionalities, including video streaming, content search/filtering, user authentication, and interactive social features like comments and likes.

---
**Repository Link:** [https://github.com/Chakriroy11/youtube_clone.git](https://github.com/Chakriroy11/youtube_clone.git)

---

##  Key Features

### **Front-End (React + Vite)**
* **Dynamic Home Page**: A responsive grid layout featuring video thumbnails, titles, and view counts.
* **Smart Search & Filters**: Functional search bar and 13+ category chips for real-time content filtering.
* **Video Player Page**: Custom-built player interface with metadata display and interactive Like/Dislike buttons.
* **Complete Comment CRUD**: Authenticated users can post, view, edit, and delete comments on any video.
* **Channel Dashboard**: Creator-specific page to manage uploaded content, edit video details, or remove videos.
* **Responsive Design**: Fully optimized for mobile, tablet, and desktop using Tailwind CSS.

### **Back-End (Node.js + Express)**
* **JWT Authentication**: Secure login and registration system with protected routes and encrypted passwords.
* **RESTful API**: Modular architecture for managing Users, Videos, Channels, and Comments.
* **Database**: Optimized MongoDB schemas for efficient data retrieval and population.

---

## Tech Stack
* **Frontend**: React.js, Redux Toolkit (State Management), React Router, Axios, Tailwind CSS.
* **Backend**: Node.js, Express.js (ES Modules).
* **Database**: MongoDB (Local instance managed via MongoDB Compass).
* **Security**: JWT (JSON Web Tokens) and Bcrypt.js.

---




##  Installation & Setup

### **1. Prerequisites**
* Node.js (v18 or higher)
* MongoDB Compass (Running locally)

### **2. Setup Instructions**
1. **Clone the repository**:
   ```bash
   git clone [https://github.com/Chakriroy11/youtube_clone.git](https://github.com/Chakriroy11/youtube_clone.git)

##  Project Structure
```text
/CAPSTONE-PROJECT
├── /backend
│   ├── /config       # MongoDB connection logic
│   ├── /controllers  # API Logic (Auth, Video, Comment, Channel)
│   ├── /models       # Mongoose Schemas
│   ├── /routes       # Express Route definitions
│   ├── /middleware   # JWT verification logic
│   └── server.js     # Server entry point
└── /frontend
    ├── /src
    │   ├── /components  # VideoCard, Sidebar, Header, etc.
    │   ├── /pages       # Home, VideoPlayer, ChannelPage, Auth
    │   ├── /store       # Redux Slices (VideoSlice, AuthSlice)
    │   └── /styles      # Global CSS and Tailwind configuration
    └── vite.config.js