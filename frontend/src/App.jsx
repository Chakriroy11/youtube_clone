/* frontend/src/App.jsx */
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import VideoPlayer from "./pages/VideoPlayer";
import ChannelPage from "./pages/ChannelPage";
import CreateVideo from "./pages/CreateVideo";
import { fetchMe } from "./store/authSlice";
import API from "./api/axios";

export default function App() {
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const storedValue = localStorage.getItem("sidebarOpen");
      return storedValue !== null ? JSON.parse(storedValue) : true;
    } catch (error) {
      console.error("Error reading sidebar state from localStorage", error);
      return true; // Default to opened on error
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      try {
        localStorage.setItem("sidebarOpen", JSON.stringify(newState));
      } catch (error) {
        console.error("Error saving sidebar state to localStorage", error);
      }
      return newState;
    });
  };

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Attach token to axios
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      dispatch(fetchMe());
    }
  }, [dispatch]);

  let mainContentClass = "flex-1 min-h-screen pt-14 overflow-x-hidden";

  if (isHomePage) {
    if (sidebarOpen) {
      mainContentClass += " xl:ml-0 transition-all duration-150";
    } else {
      mainContentClass += " xl:ml-20 transition-all duration-150";
    }
  } else {
    mainContentClass += " xl:ml-0 md:ml-0";
  }

  if (isHomePage && !sidebarOpen) {
    mainContentClass += " md:ml-14";
  }

  return (
    <div className="min-h-screen bg-yc-bg">
      <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="flex w-full">
        <Sidebar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />

        <main className={mainContentClass}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/video/:id" element={<VideoPlayer />} />
            <Route path="/channel" element={<ChannelPage />} />
            <Route path="/channel/:id" element={<ChannelPage />} />
            <Route path="/create-video" element={<CreateVideo />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
