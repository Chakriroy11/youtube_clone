/* frontend/src/components/CreateChannelModal.jsx */
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createChannel } from "../store/channelsSlice";
import { fetchMe } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

function extractFirstChannelId(user) {
  if (!user) return null;
  const first = user.channels?.[0] ?? null;
  if (!first) return null;
  if (typeof first === "string") return first;
  if (typeof first === "object") return first._id || first.id || null;
  return null;
}

export default function CreateChannelModal({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: me } = useSelector((s) => s.auth);

  const initialName = me?.username ? `${me.username}'s Channel` : "";
  const [channelName, setChannelName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  // avatar file preview (local only)
  const [avatarPreview, setAvatarPreview] = useState(me?.avatar || null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!me) return;
    setAvatarPreview(me.avatar || null);
    if (!channelName && me.username) {
      setChannelName(`${me.username}'s Channel`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  const onFileSelected = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    onFileSelected(file);
    // NOTE: preview only (no upload here)
  };

  const triggerFilePicker = () => {
    if (fileRef.current) fileRef.current.click();
  };

  const handleCreate = async () => {
    if (!channelName || !channelName.trim()) {
      alert("Please enter a channel name.");
      return;
    }

    setLoading(true);
    try {
      const action = await dispatch(
        createChannel({ channelName: channelName.trim() })
      );

      if (action.error) {
        throw action.payload || action.error;
      }

      // Re-fetch user + channels from backend
      const fetchAction = await dispatch(fetchMe());
      const updatedUser = fetchAction.payload;

      if (onClose) onClose();

      const newChannelId =
        action.payload?.channel?._id || extractFirstChannelId(updatedUser);

      if (newChannelId) {
        navigate(`/channel/${newChannelId}`);
      }
    } catch (err) {
      console.error("Create channel failed:", err);
      alert(
        err?.message ||
          (err?.payload && JSON.stringify(err.payload)) ||
          "Failed to create channel"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-14 sm:pt-20"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-channel-title"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          if (!loading && onClose) onClose();
        }}
      />

      {/* modal */}
      <div
        className="relative z-10 w-full max-w-lg p-5 bg-white shadow-xl rounded-2xl sm:max-w-2xl sm:p-6 md:p-8"
        style={{ maxHeight: "86vh" }}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="create-channel-title"
              className="text-lg font-semibold sm:text-2xl"
            >
              How you'll appear
            </h2>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              A simple profile for your channel. You can change it later.
            </p>
          </div>

          <button
            onClick={() => !loading && onClose?.()}
            className="p-2 rounded-md hover:bg-gray-100"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-3">
          {/* avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="overflow-hidden border rounded-full w-28 h-28">
              <img
                src={
                  avatarPreview ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    me?.username || "User"
                  )}`
                }
                className="object-cover w-full h-full"
                alt="avatar"
              />
            </div>

            <button
              onClick={triggerFilePicker}
              className="text-sm underline"
              disabled={loading}
            >
              Select picture
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* inputs */}
          <div className="sm:col-span-2">
            <label className="block text-sm">Name</label>
            <input
              className="w-full p-3 mt-2 border rounded-lg"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              disabled={loading}
            />

            <div className="mt-4">
              <label className="block text-sm">Handle</label>
              <input
                className="w-full p-3 mt-2 border rounded-lg bg-gray-50"
                value={
                  me?.username
                    ? `@${String(me.username).replace(/\s+/g, "")}`
                    : ""
                }
                readOnly
              />
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => !loading && onClose?.()}
            className="px-4 py-2 border rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create channel"}
          </button>
        </div>
      </div>
    </div>
  );
}
