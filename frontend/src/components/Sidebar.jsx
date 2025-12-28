import React, { useState, useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/layout.css";
import { useSelector } from "react-redux";

// Helper function for Sidebar persistence
const usePersistentSidebar = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const storedValue = localStorage.getItem("sidebarOpen");
      return storedValue ? JSON.parse(storedValue) : initialState;
    } catch (error) {
      console.error("Error reading sidebar state from localStorage", error);
      return initialState;
    }
  });

  const toggle = (newState = !isOpen) => {
    setIsOpen(newState);
    try {
      localStorage.setItem("sidebarOpen", JSON.stringify(newState));
    } catch (error) {
      console.error("Error saving sidebar state to localStorage", error);
    }
  };

  return [isOpen, toggle];
};

const topItems = [
  {
    key: "shorts",
    label: "Shorts",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 3v18l15-9L5 3z" />
      </svg>
    ),
    to: "/shorts",
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 8v5l6 3v-8" />
      </svg>
    ),
    to: "/subscriptions",
  },
  {
    key: "library",
    label: "Library",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h12v2H6zM6 10h12v2H6zM6 14h8v2H6z" />
      </svg>
    ),
    to: "/library",
  },
  {
    key: "history",
    label: "History",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 3a9 9 0 100 18 9 9 0 000-18zm1 10H8V7h2v4h4v2z" />
      </svg>
    ),
    to: "/history",
  },
];

const moreUser = [
  {
    key: "your-videos",
    label: "Your videos",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 8v7l6-3.5L10 8z" />
      </svg>
    ),
    to: "/your-videos",
  },
  {
    key: "playlists",
    label: "Playlists",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 6h14v2H3zM3 10h14v2H3zM3 14h10v2H3z" />
      </svg>
    ),
    to: "/playlists",
  },
  {
    key: "watch-later",
    label: "Watch later",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7v6l5 3 1-1.73-4-2.27V7zM12 3a9 9 0 100 18 9 9 0 000-18z" />
      </svg>
    ),
    to: "/watch-later",
  },
  {
    key: "liked",
    label: "Liked videos",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-7-4.35-9-7.1C1.4 11 3 6 7 4c2-1 4 0 5 1 1-1 3-2 5-1 4 2 5.6 7 4 9.9C19 16.65 12 21 12 21z" />
      </svg>
    ),
    to: "/liked",
  },
];

const explore = [
  {
    key: "trending",
    label: "Trending",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17h4v4H3zM10 10h4v11h-4zM17 3h4v18h-4z" />
      </svg>
    ),
  },
  {
    key: "shopping",
    label: "Shopping",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 4h10l1.4 6H5.6L7 4zM6 20a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    ),
  },
  {
    key: "music",
    label: "Music",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55A4 4 0 1114 21V11h-4V3z" />
      </svg>
    ),
  },
  {
    key: "films",
    label: "Films",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 6H3v12h18V6zM7 8h2v2H7V8zm0 4h2v2H7v-2z" />
      </svg>
    ),
  },
  {
    key: "live",
    label: "Live",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 6v8l6-4z" />
      </svg>
    ),
  },
  {
    key: "gaming",
    label: "Gaming",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v2H6v2h2v2h2V9h2V7H10V5H8z" />
      </svg>
    ),
  },
  {
    key: "news",
    label: "News",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 5h18v4H3zM3 11h14v8H3z" />
      </svg>
    ),
  },
  {
    key: "sports",
    label: "Sports",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
      </svg>
    ),
  },
  {
    key: "learning",
    label: "Learning",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 11l-10-5v6l10 5 10-5v-6l-10 5z" />
      </svg>
    ),
  },
  {
    key: "fashion",
    label: "Fashion & beauty",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2s3 4 3 6-3 6-3 6-3-4-3-6 3-6 3-6z" />
      </svg>
    ),
  },
];

const moreFromYT = [
  { label: "YouTube Premium", iconColor: "#FF0000" },
  { label: "YouTube Music", iconColor: "#FF3B30" },
  { label: "YouTube Kids", iconColor: "#FF3B30" },
];

const settingsLinks = [
  {
    key: "settings",
    label: "Settings",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm8 4a6.97 6.97 0 01-.13 1.2l2 1.5-1.5 2-1.5-2a6.97 6.97 0 01-1.2.13 6.97 6.97 0 01-1.2-.13l-1.5 2-2-1.5 1.5-2c-.08-.4-.13-.8-.13-1.2s.05-.8.13-1.2L7 8.4 5 6.9l1.5-2 1.5 2c.4-.08.8-.13 1.2-.13s.8.05 1.2.13l1.5-2 2 1.5-1.5 2c.08.4.13.8.13 1.2z" />
      </svg>
    ),
  },
  {
    key: "report",
    label: "Report history",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3 7v6c0 5 3 9 9 9s9-4 9-9V7l-9-5z" />
      </svg>
    ),
  },
  {
    key: "help",
    label: "Help",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-.8.45-1.5 1.17-2.17l1.24-1.26A1.99 1.99 0 0012 7c-1.11 0-2 .89-2 2H8c0-2.21 1.79-4 4-4 1.1 0 2 .9 2 2 0 .7-.35 1.25-.93 1.75z" />
      </svg>
    ),
  },
  {
    key: "feedback",
    label: "Send feedback",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 6h-18v12h4v4l4-4h10z" />
      </svg>
    ),
  },
];

export default function Sidebar({ sidebarOpen, onToggleSidebar }) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Use the hook to manage persistent state if not controlled by parent
  const [internalExpanded, internalToggle] = usePersistentSidebar(false);
  
  // Determine the effective expanded state
  const expanded = sidebarOpen !== undefined ? sidebarOpen : internalExpanded;

  // Custom toggle function that calls the prop and updates localStorage
  const handleToggleSidebar = () => {
    // If controlled, call the parent's handler
    if (typeof onToggleSidebar === "function") {
      onToggleSidebar();
    }
    
    // If uncontrolled, update internal state (which saves to localStorage via the hook)
    if (sidebarOpen === undefined) {
      internalToggle();
    } else {
      // If controlled, ensure we still persist the user's action
      const newState = !expanded;
      try {
        localStorage.setItem("sidebarOpen", JSON.stringify(newState));
      } catch (error) {
        console.error("Error saving sidebar state to localStorage", error);
      }
    }
  };

  const auth = useSelector((s) => s.auth);
  const effectiveUser =
    auth?.user ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return null;
      }
    })();

  const signedIn = !!effectiveUser;

  // Reusable Drawer content JSX (without wrapping div)
  const DrawerContent = () => (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-between w-full p-4 bg-white border-b">
        <div className="flex items-center gap-3">
          <svg className="w-7 h-7" viewBox="0 0 24 24" aria-hidden>
            <rect x="2" y="5" width="20" height="14" rx="3" fill="#FF0000" />
            <path d="M9.5 8.5v7l6-3.5-6-3.5z" fill="#fff" />
          </svg>
          <div className="text-base font-semibold">YouClone</div>
        </div>
        <button
          aria-label="Close menu"
          className="p-2 rounded-md hover:bg-gray-100"
          onClick={handleToggleSidebar} // Use the custom handler
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
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <nav className="p-4 pt-0 mt-4 space-y-2">
        <Link
          to="/"
          onClick={handleToggleSidebar} // Use the custom handler
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
        >
          <div className="p-2 bg-gray-100 rounded-md">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          <div className="text-sm">Home</div>
        </Link>

        {topItems.map((it) => (
          <Link
            key={it.key}
            to={it.to}
            onClick={handleToggleSidebar} // Use the custom handler
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            <div className="p-2 rounded-md">{it.icon}</div>
            <div className="text-sm">{it.label}</div>
          </Link>
        ))}

        <div className="my-3 border-t" />

        {!signedIn && (
          <div className="p-3 border rounded-lg">
            <div className="mb-2 text-sm text-gray-700">
              Sign in to like videos, comment and subscribe.
            </div>
            <Link
              onClick={handleToggleSidebar} // Use the custom handler
              to="/auth"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded"
            >
              <svg
                className="w-5 h-5 text-blue-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" />
              </svg>
              Sign in
            </Link>
          </div>
        )}

        <div className="my-3 border-t" />

        <div>
          <div className="mb-2 text-sm font-semibold">Explore</div>
          {explore.map((it) => (
            <button
              key={it.key}
              className="flex items-center w-full gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-50"
            >
              <div className="p-2 rounded-md">{it.icon}</div>
              <div className="text-sm">{it.label}</div>
            </button>
          ))}
          <button className="flex items-center w-full gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-50">
            <div className="p-2 rounded-md" />
            <div className="text-sm">Show more</div>
          </button>
        </div>

        <div className="my-3 border-t" />

        <div>
          <div className="mb-2 text-sm font-semibold">More from YouTube</div>
          {moreFromYT.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center justify-center bg-white border rounded-md w-9 h-9">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill={m.iconColor}>
                  <path d="M10 8v7l6-3.5L10 8z" />
                </svg>
              </div>
              <div className="text-sm">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="my-3 border-t" />

        <div>
          {settingsLinks.map((s) => (
            <button
              key={s.key}
              className="flex items-center w-full gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-50"
            >
              <div className="p-2 rounded-md">{s.icon}</div>
              <div className="text-sm">{s.label}</div>
            </button>
          ))}
        </div>

        <div className="pt-3 mt-6 text-xs text-gray-500 border-t">
          <div className="flex flex-wrap gap-2">
            <span>About</span>
            <span>Press</span>
            <span>Copyright</span>
            <span>Contact us</span>
          </div>
          <div className="mt-2">© 2025 YouClone</div>
        </div>
      </nav>
    </>
  );

  /* -------------------------
       Desktop Sidebar (XL, Pushes content) - Only for Home Page
       ------------------------- */
  const DesktopSidebar = isHomePage ? (
    <aside
      className={`app-sidebar bg-white border-r p-4 ${
        expanded ? "w-72" : "w-20"
      } transition-all duration-150 hidden xl:block`}
      aria-label="Main sidebar"
    >
      <div className="space-y-3">
        <Link
          to="/"
          className="flex items-center gap-4 px-2 py-3 bg-gray-100 rounded-lg hover:bg-gray-100"
        >
          <div className="p-2 bg-gray-200 rounded-md">
            <svg
              className="w-6 h-6 text-gray-800"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          {expanded && <div className="text-sm font-medium">Home</div>}
        </Link>

        {topItems.map((it) => (
          <Link
            key={it.key}
            to={it.to}
            className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-gray-50"
          >
            <div className="p-2 bg-white border border-transparent rounded-md hover:border-gray-200">
              {it.icon}
            </div>
            {expanded && (
              <div className="text-sm text-gray-700">{it.label}</div>
            )}
          </Link>
        ))}
      </div>

      <div className="my-4 border-t" />

      {expanded && (
        <>
          <div className="space-y-4">
            {!signedIn && (
              <div className="p-3 border rounded-lg">
                <div className="mb-2 text-sm text-gray-700">
                  Sign in to like videos, comment and subscribe.
                </div>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded"
                >
                  <svg
                    className="w-5 h-5 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" />
                  </svg>
                  Sign in
                </Link>
              </div>
            )}
            <div className="space-y-2">
              {moreUser.map((m) => (
                <Link
                  key={m.key}
                  to={m.to}
                  className="flex items-center gap-4 px-2 py-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="p-2 bg-white border border-transparent rounded-md hover:border-gray-200">
                    {m.icon}
                  </div>
                  <div className="text-sm text-gray-700">{m.label}</div>
                </Link>
              ))}
            </div>
          </div>
          <div className="my-4 border-t" />
          <div className="space-y-3">
            <div className="text-sm font-semibold">Explore</div>
            <div className="flex flex-col gap-2">
              {explore.map((it) => (
                <button
                  key={it.key}
                  title={it.label}
                  className="flex items-center gap-4 px-2 py-3 text-sm rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-white border border-transparent rounded-md hover:border-gray-200">
                    {it.icon}
                  </div>
                  <span className="text-gray-700">{it.label}</span>
                </button>
              ))}
              <button className="flex items-center gap-4 px-2 py-3 text-sm rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10"></div>
                <span>Show more</span>
              </button>
            </div>
          </div>
          <div className="my-4 border-t" />
          <div className="space-y-3">
            <div className="text-sm font-semibold">More from YouTube</div>
            {moreFromYT.map((m) => (
              <div
                key={m.label}
                className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-white border border-transparent rounded-md">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill={m.iconColor}
                  >
                    <path d="M10 8v7l6-3.5L10 8z" />
                  </svg>
                </div>
                <div className="text-sm">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="my-4 border-t" />
          <div className="space-y-2">
            {settingsLinks.map((s) => (
              <button
                key={s.key}
                title={s.label}
                className="flex items-center gap-4 px-2 py-3 text-sm rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-white border border-transparent rounded-md">
                  {s.icon}
                </div>
                <div className="text-sm text-gray-700">{s.label}</div>
              </button>
            ))}
          </div>
          <div className="pt-4 mt-6 text-xs text-gray-500 border-t">
            <div className="flex flex-wrap gap-2">
              <span>About</span>
              <span>Press</span>
              <span>Copyright</span>
              <span>Contact us</span>
            </div>
            <div className="mt-3">© 2025 YouClone</div>
          </div>
        </>
      )}
    </aside>
  ) : null;

  /* -------------------------
       Medium Compact Rail (MD-LG screens, fixed, for Home Page when closed)
       ------------------------- */
  const MediumCompactRail =
    isHomePage && !expanded ? (
      // Only visible on Home page, when collapsed (MD/LG screens)
      <div className="fixed top-[var(--header-height)] left-0 z-30 flex-col items-center hidden h-[calc(100vh-var(--header-height))] px-1 py-3 bg-white border-r md:flex xl:hidden w-14 overflow-y-auto">
        <Link
          to="/"
          className="p-2 mb-2 rounded hover:bg-gray-100"
          title="Home"
        >
          <svg
            className="w-5 h-5 text-gray-800"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </Link>
        {topItems.map((it) => (
          <Link
            key={it.key}
            to={it.to}
            className="p-2 mb-2 rounded hover:bg-gray-100"
            title={it.label}
          >
            {it.icon}
          </Link>
        ))}
        <div className="px-1 mt-auto text-xs text-gray-400">Menu</div>
      </div>
    ) : null;

  /* -------------------------
       Universal Drawer (MD/LG screens, Fixed Overlay)
       ------------------------- */
  const UniversalDrawer = expanded ? (
    // Renders on MD, LG screens. Hidden on XL via xl:hidden.
    <div
      className={`hidden md:block xl:hidden fixed inset-0 z-40`}
      aria-hidden={!expanded}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleToggleSidebar} // Use the custom handler
      />
      {/* Drawer content positioned below the header, ensuring it's visible */}
      <div className="fixed left-0 z-50 max-w-full overflow-y-auto bg-white shadow-xl w-72 top-[var(--header-height)] h-[calc(100vh-var(--header-height))]">
        <DrawerContent />
      </div>
    </div>
  ) : null;

  /* -------------------------
       XL Overlay Drawer (XL screens, Fixed Overlay) - ONLY for Non-Home pages.
       ------------------------- */
  const XLOverlayDrawer =
    expanded && !isHomePage ? (
      <div
        className={`hidden xl:block fixed inset-0 z-40`}
        aria-hidden={!expanded}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={handleToggleSidebar} // Use the custom handler
        />
        <div className="fixed left-0 z-50 max-w-full overflow-y-auto bg-white shadow-xl w-72 top-[var(--header-height)] h-[calc(100vh-var(--header-height))]">
          <DrawerContent />
        </div>
      </div>
    ) : null;

  /* -------------------------
       Mobile Drawer (SM screens, Fixed Overlay) - Always renders when expanded
       ------------------------- */
  const MobileDrawer = expanded ? (
    <div className={`fixed inset-0 z-40 md:hidden`} aria-hidden={!expanded}>
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleToggleSidebar} // Use the custom handler
      />
      {/* Drawer content positioned below the header, ensuring it's visible */}
      <div className="fixed left-0 z-50 max-w-full overflow-y-auto bg-white shadow-xl w-80 top-[var(--header-height)] h-[calc(100vh-var(--header-height))]">
        <div className="p-4">
          {/* Sticky header inside the drawer */}
          <div className="sticky top-0 z-50 flex items-center justify-between px-4 pt-0 mb-4 -mx-4 bg-white border-b">
            <div className="flex items-center gap-3">
              <svg className="w-7 h-7" viewBox="0 0 24 24" aria-hidden>
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
              <div className="text-base font-semibold">YouClone</div>
            </div>
            <button
              aria-label="Close menu"
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={handleToggleSidebar} // Use the custom handler
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
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <nav className="pt-0 mt-4 space-y-2">
            <Link
              to="/"
              onClick={handleToggleSidebar} // Use the custom handler
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <div className="p-2 bg-gray-100 rounded-md">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </div>
              <div className="text-sm">Home</div>
            </Link>

            {topItems.map((it) => (
              <Link
                key={it.key}
                to={it.to}
                onClick={handleToggleSidebar} // Use the custom handler
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <div className="p-2 rounded-md">{it.icon}</div>
                <div className="text-sm">{it.label}</div>
              </Link>
            ))}

            <div className="my-3 border-t" />

            {!signedIn && (
              <div className="p-3 border rounded-lg">
                <div className="mb-2 text-sm text-gray-700">
                  Sign in to like videos, comment and subscribe.
                </div>
                <Link
                  onClick={handleToggleSidebar} // Use the custom handler
                  to="/auth"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded"
                >
                  <svg
                    className="w-5 h-5 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" />
                  </svg>
                  Sign in
                </Link>
              </div>
            )}

            <div className="my-3 border-t" />

            <div>
              <div className="mb-2 text-sm font-semibold">Explore</div>
              {explore.map((it) => (
                <button
                  key={it.key}
                  className="flex items-center w-full gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-50"
                >
                  <div className="p-2 rounded-md">{it.icon}</div>
                  <div className="text-sm">{it.label}</div>
                </button>
              ))}
              <button className="flex items-center w-full gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-50">
                <div className="p-2 rounded-md" />
                <div className="text-sm">Show more</div>
              </button>
            </div>

            <div className="my-3 border-t" />

            <div>
              <div className="mb-2 text-sm font-semibold">
                More from YouTube
              </div>
              {moreFromYT.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-center bg-white border rounded-md w-9 h-9">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill={m.iconColor}
                    >
                      <path d="M10 8v7l6-3.5L10 8z" />
                    </svg>
                  </div>
                  <div className="text-sm">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="my-3 border-t" />

            <div>
              {settingsLinks.map((s) => (
                <button
                  key={s.key}
                  className="flex items-center w-full gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-50"
                >
                  <div className="p-2 rounded-md">{s.icon}</div>
                  <div className="text-sm">{s.label}</div>
                </button>
              ))}
            </div>

            <div className="pt-3 mt-6 text-xs text-gray-500 border-t">
              <div className="flex flex-wrap gap-2">
                <span>About</span>
                <span>Press</span>
                <span>Copyright</span>
                <span>Contact us</span>
              </div>
              <div className="mt-2">© 2025 YouClone</div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  ) : null;

  /* -------------------------
       Mobile bottom nav (quick access) - visible only on small screens (<768px)
       ------------------------- */
  const MobileBottomNav = (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-inner md:hidden"
      aria-label="Mobile quick nav"
    >
      <div className="max-w-4xl px-2 mx-auto">
        <div className="flex items-center justify-between">
          {topItems.slice(0, 4).map((it) => (
            <Link
              key={it.key}
              to={it.to}
              className="flex flex-col items-center justify-center w-full px-1 py-2 text-xs text-gray-700 hover:bg-gray-50"
              aria-label={it.label}
            >
              <div className="flex items-center justify-center w-7 h-7">
                {it.icon}
              </div>
              <span className="mt-1 text-[11px]">{it.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Pushing Sidebar (Home Page XL) */}
      {DesktopSidebar}

      {/* Fixed Compact Rail (Home Page MD/LG) */}
      {MediumCompactRail}

      {/* Overlay Drawer (MD/LG screens, regardless of route) */}
      {UniversalDrawer}

      {/* XL Overlay Drawer (ONLY for Non-Home XL pages) */}
      {XLOverlayDrawer}

      {/* Overlay Drawer (Mobile) */}
      {MobileDrawer}

      {MobileBottomNav}
    </>
  );
}