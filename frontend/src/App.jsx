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
      return true;
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newState));
      return newState;
    });
  };

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      dispatch(fetchMe());
    }
  }, [dispatch]);

  /* RECTIFICATION LOGIC:
     - transition-all duration-300: Animates the margin so there is no flickering gap.
     - md:ml-[240px]: Matches the expanded sidebar exactly.
     - md:ml-[72px]: Matches the mini sidebar exactly.
  */
  let mainContentClass = "flex-1 min-h-screen pt-14 overflow-x-hidden transition-all duration-300 ml-0";

  if (isHomePage) {
    if (sidebarOpen) {
      mainContentClass += " md:ml-[240px]"; 
    } else {
      mainContentClass += " md:ml-[72px]";
    }
  } else {
    // For Video Player page, we use 0 margin so it takes full width
    mainContentClass += " ml-0";
  }

  return (
    <div className="min-h-screen bg-white">
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