import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import VideoCard from "../components/VideoCard";
import { fetchVideos } from "../store/VideoSlice";
import "../styles/Home.css";

export default function Home() {
  const dispatch = useDispatch();
  const videos = useSelector((s) => s.videos.list);
  const loading = useSelector((s) => s.videos.loading);
  const error = useSelector((s) => s.videos.error);
  const auth = useSelector((s) => s.auth);

  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const [category, setCategory] = useState("All");

  const categoryList = [
    "All",
    "Web Development",
    "JavaScript",
    "Data Structures",
    "Server",
    "Music",
    "Information Technology",
    "Resume",
    "Gaming",
    "Live",
    "React",
    "Node.js",
    "Full Stack",
  ];

  const filtersRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const filtersWrapRef = useRef(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    if (!auth || !auth.user) return;
    dispatch(fetchVideos({ q: qParam || undefined, category }));
  }, [dispatch, qParam, category, auth]);

  // Check scroll position and update arrow visibility
  const updateArrows = () => {
    const el = filtersRef.current;
    const wrapEl = filtersWrapRef.current;

    // Check for mobile screen size (<= 767px)
    const isMobile = window.innerWidth < 768;

    if (!el || !wrapEl) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      return;
    }

    // If on mobile, explicitly hide arrows via state (CSS handles the actual display: none)
    if (isMobile) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      wrapEl.classList.remove("has-left-arrow", "has-right-arrow");
      return;
    }

    // Logic for Desktop/Tablet arrows
    const isScrollable = el.scrollWidth > el.clientWidth + 5;

    if (!isScrollable) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      wrapEl.classList.remove("has-left-arrow", "has-right-arrow");
      return;
    }

    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;

    const showLeft = scrollLeft > 10;
    const showRight = scrollLeft < maxScroll - 10;

    setShowLeftArrow(showLeft);
    setShowRightArrow(showRight);

    // Update wrapper classes for padding/fade effect
    if (showLeft) {
      wrapEl.classList.add("has-left-arrow");
    } else {
      wrapEl.classList.remove("has-left-arrow");
    }

    if (showRight) {
      wrapEl.classList.add("has-right-arrow");
    } else {
      wrapEl.classList.remove("has-right-arrow");
    }
  };

  useEffect(() => {
    const timer = setTimeout(updateArrows, 50);

    const el = filtersRef.current;
    if (el) {
      el.addEventListener("scroll", updateArrows);
    }

    window.addEventListener("resize", updateArrows);
    const ro = new ResizeObserver(updateArrows);
    if (filtersRef.current) ro.observe(filtersRef.current);

    // Ensure arrows are updated when component mounts or filters change
    updateArrows();

    return () => {
      clearTimeout(timer);
      if (el) {
        el.removeEventListener("scroll", updateArrows);
      }
      window.removeEventListener("resize", updateArrows);
      ro.disconnect();
    };
  }, [categoryList]);

  const scrollFiltersBy = (distance) => {
    const el = filtersRef.current;
    if (!el) return;
    el.scrollBy({ left: distance, behavior: "smooth" });
  };

  const renderFilterBar = () => (
    <div ref={filtersWrapRef} className="filters-wrap">
      {showLeftArrow && (
        <button
          className="filter-arrow filter-arrow-left"
          aria-label="Scroll left"
          onClick={() => scrollFiltersBy(-200)}
        >
          ◄
        </button>
      )}

      <div ref={filtersRef} className="filters-row" aria-label="Categories">
        {categoryList.map((ch) => (
          <button
            key={ch}
            onClick={() => setCategory(ch)}
            className={`chip ${category === ch ? "chip-active" : ""}`}
            aria-pressed={category === ch}
          >
            {ch}
          </button>
        ))}
      </div>

      {showRightArrow && (
        <button
          className="filter-arrow filter-arrow-right"
          aria-label="Scroll right"
          onClick={() => scrollFiltersBy(200)}
        >
          ►
        </button>
      )}
    </div>
  );

  // Fallback for non-signed in user (Full component scrolling)
  if (!auth || !auth.user) {
    return (
      <div className="h-full p-6 overflow-y-auto">
        {renderFilterBar()}

        <div className="flex justify-center mt-12">
          <div className="w-full max-w-3xl p-8 text-center bg-white rounded-lg shadow-xl">
            <h2 className="mb-3 text-2xl font-bold">
              Try searching to get started
            </h2>
            <p className="text-gray-600">
              Start watching videos to help us build a feed of videos that
              you'll love.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main authenticated user content
  return (
    // The main scroll container for the video feed.
    <div className="h-full p-6 overflow-y-auto">
      {renderFilterBar()}

      {error && (
        <div className="max-w-3xl mx-auto mb-4">
          <div className="p-3 text-red-700 border border-red-100 rounded bg-red-50">
            {`Unable to load videos from backend: ${error}. Please check the backend server.`}
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center">Loading videos...</div>
      ) : !videos || videos.length === 0 ? (
        <div className="flex justify-center">
          <div className="w-full max-w-3xl p-8 text-center bg-white rounded-lg shadow-xl">
            <h2 className="mb-3 text-2xl font-bold">
              Try searching to get started
            </h2>
            <p className="text-gray-600">
              Start watching videos to help us build a feed of videos that
              you'll love.
            </p>
          </div>
        </div>
      ) : (
        // Video Grid Section 
        // applied to make the sticky bar full width. This keeps the grid content correctly spaced.
        <div className="px-6 pb-4 mt-4 -mx-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((v, idx) => (
              <VideoCard key={v._id} video={v} index={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
