import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchChannelById } from "../store/channelsSlice";
import API from "../api/axios";
import CreateChannelModal from "../components/CreateChannelModal";
import { fetchMe } from "../store/authSlice";

function extractChannelId(maybe) {
  if (!maybe) return null;
  if (typeof maybe === "string") return maybe;
  if (typeof maybe === "object") return maybe._id || maybe.id || null;
  return null;
}

const DeleteConfirmationModal = ({ videoId, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
    <div className="w-11/12 max-w-md p-6 mx-auto transition-all transform bg-white rounded-lg shadow-2xl">
      <h3 className="mb-4 text-xl font-semibold text-gray-900">
        Delete Video?
      </h3>
      <p className="mb-6 text-gray-600">
        Are you sure you want to permanently delete this video? This action
        cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 transition border border-gray-300 rounded-full hover:bg-gray-100"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm(videoId)}
          className="px-4 py-2 text-white transition bg-red-600 rounded-full hover:bg-red-700"
          disabled={loading}
        >
          {loading === videoId ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

export default function ChannelPage() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const channel = useSelector((s) => s.channels.current);
  const auth = useSelector((s) => s.auth);

  const [loadingDelete, setLoadingDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("Videos");
  const [sortBy, setSortBy] = useState("Latest");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [videoToDeleteId, setVideoToDeleteId] = useState(null);

  const token = localStorage.getItem("token");

  const localUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const effectiveUser = auth.user || localUser;

  const firstChannelEntry =
    effectiveUser?.channels?.[0] || effectiveUser?.channelId || null;
  const resolvedId = paramId || extractChannelId(firstChannelEntry) || null;

  useEffect(() => {
    if (token && !auth.user) {
      dispatch(fetchMe());
    }
  }, [token, auth.user, dispatch]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      window.scrollTo({ top: 0, behavior: "auto" });

      if (resolvedId) {
        dispatch(fetchChannelById(resolvedId));
        setCreateModalOpen(false);
        return;
      }

      if (!token) {
        navigate("/auth");
        return;
      }

      if (!effectiveUser) return;

      if (!cancelled) setCreateModalOpen(true);
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [dispatch, resolvedId, effectiveUser, navigate, token]);

  const isOwner = useMemo(() => {
    if (!effectiveUser || !channel) return false;
    const userId = effectiveUser._id || effectiveUser.id;
    const ownerId = channel.owner?._id || channel.owner;
    return String(userId) === String(ownerId);
  }, [effectiveUser, channel]);

  const videos = useMemo(() => {
    if (!channel?.videos) return [];
    const arr = [...channel.videos];
    if (sortBy === "Latest") {
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "Oldest") {
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "Popular") {
      arr.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return arr;
  }, [channel?.videos, sortBy]);

  const handleDeleteClick = (vidId) => {
    setVideoToDeleteId(vidId);
    setOpenMenuFor(null);
  };

  const handleDeleteConfirm = async (vidId) => {
    setLoadingDelete(vidId);
    setVideoToDeleteId(null);
    try {
      await API.delete(`/videos/${vidId}`);
      if (resolvedId) dispatch(fetchChannelById(resolvedId));
    } catch (err) {
      alert("Delete failed");
    } finally {
      setLoadingDelete(null);
    }
  };

  const fmtNumber = (n) => {
    if (n == null) return "0";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${n}`;
  };

  const openCreateModal = () => setCreateModalOpen(true);

  if (!channel && resolvedId) {
    return (
      <div className="py-24 text-center text-gray-600">Loading channel...</div>
    );
  }

  return (
    <div className="min-h-screen bg-yc-bg md:pl-[88px] xl:pl-0">
      {!channel ? (
        <div className="max-w-[1200px] mx-auto p-6">
          <div className="py-24 text-center text-gray-600">
            {effectiveUser ? (
              <>
                You don't have a channel yet.{" "}
                <button
                  onClick={openCreateModal}
                  className="px-3 py-1 ml-2 text-white bg-black rounded"
                >
                  Create channel
                </button>
              </>
            ) : (
              <>Please sign in to view or create a channel.</>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-[1200px] mx-auto pb-12 overflow-visible">
          {/* Banner */}
          <div className="mt-6">
            <div
              className="w-full bg-center bg-cover rounded-lg shadow-sm h-44 md:h-52"
              style={{
                backgroundImage: `url(${
                  channel.channelBanner ||
                  "https://picsum.photos/seed/channel-banner/1200/300"
                })`,
              }}
            />
          </div>

          {/* Channel header */}
          <div className="flex flex-col items-start w-full gap-4 mt-4 overflow-visible md:flex-row md:items-center">
            <div className="flex items-center flex-shrink-0 gap-4">
              <img
                src={
                  channel.owner?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    channel.channelName || "C"
                  )}`
                }
                alt={channel.channelName}
                className="object-cover border rounded-full w-28 h-28 md:w-32 md:h-32"
              />
            </div>

            <div className="flex-1 w-full min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold md:text-3xl">
                  {channel.channelName}
                </h1>
              </div>

              <div className="mt-1 text-sm text-gray-600">
                @{channel.owner?.username || "channelhandle"} •{" "}
                <span className="font-medium">
                  {fmtNumber(channel.subscribers)} subscribers
                </span>
              </div>

              {channel.description && (
                <div className="max-w-3xl mt-3 text-sm text-gray-700">
                  {channel.description}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <button className="px-4 py-1 text-white bg-black rounded-full">
                  Subscribe
                </button>
                <button className="px-3 py-1 border rounded">About</button>
                <button className="px-3 py-1 border rounded">Community</button>
                {isOwner && (
                  <>
                    <button
                      onClick={() => navigate("/create-video")}
                      className="px-3 py-1 text-white transition bg-red-600 border rounded hover:bg-red-700"
                    >
                      Upload Video
                    </button>
                    <button
                      onClick={openCreateModal}
                      className="px-3 py-1 border rounded"
                    >
                      Create / Edit channel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b">
            <nav className="flex gap-6">
              {[
                "Home",
                "Videos",
                "Shorts",
                "Live",
                "Playlists",
                "Community",
              ].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`pb-3 ${
                    activeTab === t
                      ? "border-b-2 border-black font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </nav>
          </div>

          {/* Videos */}
          {activeTab === "Videos" && (
            <>
              <div className="flex items-center justify-between my-4">
                <div className="flex gap-3">
                  {["Latest", "Popular", "Oldest"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        sortBy === s
                          ? "bg-black text-white"
                          : "border text-gray-700"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  {videos.length} videos
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 overflow-visible sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {videos.map((v) => (
                  <div
                    key={v._id}
                    className="relative overflow-visible bg-white rounded shadow-sm"
                  >
                    <div
                      className="relative cursor-pointer"
                      onClick={() => navigate(`/video/${v._id}`)}
                    >
                      <img
                        src={
                          v.thumbnailUrl ||
                          `https://picsum.photos/seed/${v._id}/400/225`
                        }
                        alt={v.title}
                        className="object-cover w-full h-48 rounded-t"
                      />
                    </div>

                    <div className="p-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            channel.owner?.avatar ||
                            v.uploader?.avatar ||
                            "https://i.pravatar.cc/40"
                          }
                          className="w-10 h-10 rounded-full"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium line-clamp-2">
                            {v.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {fmtNumber(v.views)} views
                          </div>
                        </div>

                        {isOwner && (
                          <div
                            data-menu
                            className="relative flex-shrink-0 overflow-visible"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuFor(
                                  openMenuFor === v._id ? null : v._id
                                );
                              }}
                              className="p-1 border rounded"
                            >
                              ⋮
                            </button>

                            {openMenuFor === v._id && (
                              <div className="absolute right-0 z-[9999] mt-2 w-40 bg-white border rounded shadow-lg">
                                <button
                                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50"
                                  onClick={() =>
                                    navigate(`/create-video?videoId=${v._id}`)
                                  }
                                >
                                  Edit
                                </button>
                                <button
                                  className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-gray-50"
                                  onClick={() => handleDeleteClick(v._id)} // Call the new click handler
                                >
                                  {loadingDelete === v._id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {/* Create Channel Modal */}
      {createModalOpen && (
        <CreateChannelModal
          onClose={async () => {
            setCreateModalOpen(false);
            try {
              const stored = JSON.parse(localStorage.getItem("user") || "null");
              const newId =
                paramId ||
                extractChannelId(stored?.channels?.[0]) ||
                stored?.channelId;
              if (newId) await dispatch(fetchChannelById(newId));
            } catch {}
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {videoToDeleteId && (
        <DeleteConfirmationModal
          videoId={videoToDeleteId}
          onClose={() => setVideoToDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          loading={loadingDelete}
        />
      )}
    </div>
  );
}
