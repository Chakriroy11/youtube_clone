import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "../store/authSlice";
import { clearVideos } from "../store/VideoSlice";
import API from "../api/axios";
import CreateChannelModal from "./CreateChannelModal";

// Function to get initials or default
function getInitials(user) {
  const username = user?.username;
  if (username && typeof username === "string" && username.length > 0) {
    return username.charAt(0).toUpperCase();
  }
  return "U"; // Default initial
}

export default function Header({ onToggleSidebar }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // mobile search overlay toggle
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // avatar DOM ref (anchor for the portal)
  const avatarRef = useRef(null);
  const portalMenuRef = useRef(null);
  const portalRootRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth);

  // Use state data first, then localStorage fallback
  const effectiveUser =
    auth?.user ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch (e) {
        return null;
      }
    })();

  useEffect(() => {
    if (!portalRootRef.current) {
      const container = document.createElement("div");
      container.setAttribute("data-header-portal", "true");
      portalRootRef.current = container;
      document.body.appendChild(container);
    }
    return () => {
      if (portalRootRef.current && portalRootRef.current.parentNode) {
        portalRootRef.current.parentNode.removeChild(portalRootRef.current);
      }
      portalRootRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 1) {
      setSuggestions([]);
      setNoResults(false);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    setNoResults(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await API.get("/videos", {
          params: { q: query.trim(), limit: 6 },
        });
        const list = Array.isArray(res.data) ? res.data : res.data.videos || [];
        setSuggestions(list.slice(0, 6));
        setNoResults(list.length === 0);
      } catch (err) {
        setSuggestions([]);
        setNoResults(true);
      } finally {
        setLoadingSuggestions(false);
        setShowSuggestions(true);
      }
    }, 260);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelectSuggestion = (video) => {
    setShowSuggestions(false);
    setQuery("");
    setShowMobileSearch(false);
    navigate(`/video/${video._id}`);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    setShowSuggestions(false);
    setShowMobileSearch(false);
    if (!q) return;
    navigate(`/?q=${encodeURIComponent(q)}`);
    setQuery("");
  };

  const removeAuthHeader = () => {
    try {
      delete API.defaults.headers.common["Authorization"];
    } catch (e) {}
  };

  const handleSignOut = async () => {
    try {
      await dispatch(logoutAction());
    } catch (e) {}
    dispatch(clearVideos());
    try {
      localStorage.removeItem("token");
    } catch (e) {}
    try {
      localStorage.removeItem("user");
    } catch (e) {}
    removeAuthHeader();
    setShowProfileMenu(false);
    setShowSuggestions(false);
    setSuggestions([]);
    setQuery("");
    navigate("/");
  };

  function getFirstChannelIdFromUser(user) {
    if (!user) return null;
    const first = user.channels?.[0] ?? user.channelId ?? null;
    if (!first) return null;
    if (typeof first === "string") return first;
    if (typeof first === "object") return first._id || first.id || null;
    return null;
  }

  const handleAvatarToggle = () => {
    setShowProfileMenu((s) => !s);
  };

  const openProfileFromMenu = () => {
    setShowProfileMenu(false);
    if (!effectiveUser) {
      navigate("/auth");
      return;
    }
    const chId = getFirstChannelIdFromUser(effectiveUser);
    if (chId) navigate(`/channel/${chId}`);
    else navigate("/channel");
  };

  const openCreateFromMenu = () => {
    setShowProfileMenu(false);
    setCreateModalOpen(true);
  };

  const isLoggedIn = !!effectiveUser;

  const [menuPos, setMenuPos] = useState({ top: 0, right: 8 });

  useLayoutEffect(() => {
    if (!showProfileMenu || !avatarRef.current) return;

    function updatePos() {
      const avatarRect = avatarRef.current.getBoundingClientRect();
      const gap = 8;
      const top = avatarRect.bottom + gap;
      const right = window.innerWidth - avatarRect.right + gap;
      setMenuPos({ top: Math.max(8, top), right });
    }

    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [showProfileMenu]);

  useEffect(() => {
    function onDocClick(e) {
      const target = e.target;
      const clickedInsideAvatar =
        avatarRef.current && avatarRef.current.contains(target);
      const clickedInsidePortal =
        portalMenuRef.current && portalMenuRef.current.contains(target);
      const clickedInsideSuggestions =
        suggestionsRef.current && suggestionsRef.current.contains(target);

      if (!clickedInsideSuggestions && target !== inputRef.current) {
        setShowSuggestions(false);
      }

      if (!clickedInsideAvatar && !clickedInsidePortal) {
        setShowProfileMenu(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setShowProfileMenu(false);
        setShowMobileSearch(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const profileMenuContent = (
    <div
      ref={portalMenuRef}
      role="menu"
      aria-hidden={!showProfileMenu}
      className="py-2 bg-white border rounded-md shadow-lg"
      style={{
        position: "fixed",
        top: `${menuPos.top}px`,
        right: `${menuPos.right}px`,
        minWidth: 224,
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={openProfileFromMenu}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
      >
        {effectiveUser ? "Your channel / Profile" : "Sign in"}
      </button>

      {/* Only show Create channel if logged in */}
      {isLoggedIn && (
        <button
          onClick={openCreateFromMenu}
          className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
        >
          Create channel
        </button>
      )}

      {isLoggedIn && (
        <Link
          to="/settings"
          onClick={() => setShowProfileMenu(false)}
          className="block px-4 py-2 text-sm hover:bg-gray-50"
        >
          Settings
        </Link>
      )}
      <Link
        to="/help"
        onClick={() => setShowProfileMenu(false)}
        className="block px-4 py-2 text-sm hover:bg-gray-50"
      >
        Help
      </Link>

      {isLoggedIn && (
        <>
          <div className="my-1 border-t" />

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-50"
          >
            Sign out
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-3 h-14">
            {/* left area: burger + logo */}
            <div className="flex items-center gap-3 min-w-[140px]">
              <button
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5 text-gray-800"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
                </svg>
              </button>

              <Link to="/" className="flex items-center gap-3 select-none">
                <svg
                  className="flex-shrink-0 w-8 h-8"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <rect
                    x="2"
                    y="5"
                    width="20"
                    height="14"
                    rx="3"
                    fill="#FF0000"
                  />
                  <path d="M9.5 8.5v7l6-3.5-6-3.5z" fill="#fff" />
                </svg>
                <span className="hidden text-lg font-semibold text-gray-900 sm:inline">
                  YouClone
                </span>
              </Link>
            </div>

            {/* center area: search */}
            <div className="relative flex items-center justify-center flex-1 px-2">
              {/* Desktop & tablet search */}
              <form
                onSubmit={onSearchSubmit}
                className="hidden w-full max-w-2xl sm:block"
              >
                <div className="flex items-center">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    placeholder="Search"
                    aria-label="Search"
                    className="w-full px-4 py-2 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="px-3 py-2 ml-2 bg-white border border-gray-200 rounded-full hover:shadow"
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="11" cy="11" r="6" strokeWidth="2"></circle>
                      <path
                        d="M21 21l-4.35-4.35"
                        strokeWidth="2"
                        strokeLinecap="round"
                      ></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Voice search"
                    className="p-2 ml-3 rounded-full hover:bg-gray-100"
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
                      <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21h-3a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-3.08A7 7 0 0 0 19 11z" />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Mobile: small search icon that toggles overlay */}
              <div className="flex items-center justify-end w-full gap-2 sm:hidden">
                <button
                  aria-label="Open search"
                  onClick={() => {
                    setShowMobileSearch(true);
                    setTimeout(() => inputRef.current?.focus?.(), 0);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="6" strokeWidth="2"></circle>
                    <path
                      d="M21 21l-4.35-4.35"
                      strokeWidth="2"
                      strokeLinecap="round"
                    ></path>
                  </svg>
                </button>
              </div>

              {/* suggestions container (positioned under search), reused for mobile overlay too */}
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-0 z-50 flex justify-center mt-2 pointer-events-none top-full"
              >
                <div className="w-full max-w-2xl pointer-events-auto">
                  {showSuggestions &&
                    (loadingSuggestions ||
                      suggestions.length > 0 ||
                      noResults) && (
                      <div className="overflow-hidden bg-white border rounded-lg shadow-lg">
                        {loadingSuggestions && (
                          <div className="p-3 text-sm text-gray-600">
                            Searching...
                          </div>
                        )}
                        {!loadingSuggestions && suggestions.length > 0 && (
                          <ul>
                            {suggestions.map((s) => (
                              <li
                                key={s._id}
                                onClick={() => handleSelectSuggestion(s)}
                                className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
                              >
                                <img
                                  src={
                                    s.thumbnailUrl ||
                                    s.thumbnail ||
                                    "https://picsum.photos/seed/default/80/45"
                                  }
                                  alt={s.title}
                                  className="object-cover w-20 h-12 rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium line-clamp-2">
                                    {s.title}
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500">
                                    {s.uploader?.username ||
                                      s.channel?.channelName ||
                                      ""}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                        {!loadingSuggestions &&
                          suggestions.length === 0 &&
                          noResults && (
                            <div className="p-3 text-sm text-gray-600">
                              No results found
                            </div>
                          )}
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* right area: actions */}
            <div className="flex items-center gap-2 min-w-[140px] justify-end">
              {isLoggedIn && (
                <button
                  aria-label="Notifications"
                  className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2a6 6 0 00-6 6v4l-2 2v1h16v-1l-2-2V8a6 6 0 00-6-6z" />
                  </svg>
                  <span className="hidden sm:inline absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1 rounded-full">
                    3
                  </span>
                </button>
              )}

              {isLoggedIn ? (
                <>
                  <button
                    title="Create"
                    onClick={() => setCreateModalOpen(true)}
                    className="flex items-center justify-center p-1 rounded-full hover:bg-gray-100"
                    aria-label="Create"
                  >
                    <svg
                      className="w-6 h-6 text-gray-700"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11 11V6a1 1 0 112 0v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H6a1 1 0 110-2h5z" />
                    </svg>
                  </button>

                  <div className="relative flex items-center">
                    <button
                      ref={avatarRef}
                      onClick={handleAvatarToggle}
                      title="Profile"
                      className="p-0 rounded-full focus:outline-none"
                    >
                      {effectiveUser?.avatar ? (
                        <img
                          src={effectiveUser.avatar}
                          alt="Avatar"
                          className="object-cover w-8 h-8 border rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 font-semibold text-white bg-gray-500 border rounded-full text-md">
                          {getInitials(effectiveUser)}
                        </div>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-3 py-1 border rounded-full hover:bg-gray-50"
                >
                  <svg
                    className="w-5 h-5 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M12 11a4 4 0 100-8 4 4 0 000 8z" />
                    <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                  </svg>
                  <span className="hidden text-sm font-medium text-blue-600 sm:inline">
                    Sign in
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search overlay (full-width under header) */}
      {showMobileSearch && (
        <div className="sm:hidden fixed inset-x-0 top-[56px] z-50 px-3">
          <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Search"
                aria-label="Search"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <button
                type="submit"
                aria-label="Search"
                className="px-3 py-2 bg-white border border-gray-200 rounded-full hover:shadow"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="6" strokeWidth="2"></circle>
                  <path
                    d="M21 21l-4.35-4.35"
                    strokeWidth="2"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMobileSearch(false);
                  setShowSuggestions(false);
                }}
                aria-label="Close search"
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </form>
            {/* suggestions for mobile overlay will show in the same suggestionsRef area because top-full positions relative to header; but to be safe show them here too */}
            <div className="mt-2">
              {showSuggestions &&
                (loadingSuggestions || suggestions.length > 0 || noResults) && (
                  <div className="overflow-hidden bg-white border rounded-lg shadow-lg">
                    {loadingSuggestions && (
                      <div className="p-3 text-sm text-gray-600">
                        Searching...
                      </div>
                    )}
                    {!loadingSuggestions && suggestions.length > 0 && (
                      <ul>
                        {suggestions.map((s) => (
                          <li
                            key={s._id}
                            onClick={() => handleSelectSuggestion(s)}
                            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
                          >
                            <img
                              src={
                                s.thumbnailUrl ||
                                s.thumbnail ||
                                "https://picsum.photos/seed/default/80/45"
                              }
                              alt={s.title}
                              className="object-cover w-20 h-12 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium line-clamp-2">
                                {s.title}
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {s.uploader?.username ||
                                  s.channel?.channelName ||
                                  ""}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!loadingSuggestions &&
                      suggestions.length === 0 &&
                      noResults && (
                        <div className="p-3 text-sm text-gray-600">
                          No results found
                        </div>
                      )}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {portalRootRef.current &&
        showProfileMenu &&
        ReactDOM.createPortal(profileMenuContent, portalRootRef.current)}
      {createModalOpen && (
        <CreateChannelModal onClose={() => setCreateModalOpen(false)} />
      )}
    </>
  );
}
