/* frontend/src/pages/CreateVideo.jsx */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createVideo, fetchVideoById } from "../store/VideoSlice";
import { fetchChannels } from "../store/channelsSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
// Import the toast notification library
import toast from "react-hot-toast";
import API from "../api/axios";

// Placeholder updateVideo function (as discussed, assumes logic in backend/API is correct)
const updateVideo = async (payload) => {
  const { videoId, data } = payload;
  try {
    const res = await API.put(`/videos/${videoId}`, data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export default function CreateVideo() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if we are in Edit mode
  const videoId = searchParams.get("videoId");
  const isEditMode = !!videoId;

  const channels = useSelector((s) => s.channels.list);
  const auth = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(isEditMode);
  const [form, setForm] = useState({
    title: "",
    thumbnailUrl: "",
    videoUrl: "",
    description: "",
    category: "General",
    channelId: "",
  });

  // 1. Fetch channels on mount
  useEffect(() => {
    dispatch(fetchChannels());
  }, [dispatch]);

  // 2. Fetch existing video data if in Edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchExistingVideo = async () => {
        try {
          const video = await dispatch(fetchVideoById(videoId)).unwrap();
          setForm({
            title: video.title || "",
            thumbnailUrl: video.thumbnailUrl || "",
            videoUrl: video.videoUrl || "",
            description: video.description || "",
            category: video.category || "General",
            channelId: video.channel?._id || video.channel || "",
          });
        } catch (err) {
          toast.error("Failed to load video for editing.");
          navigate("/");
        } finally {
          setLoading(false);
        }
      };
      fetchExistingVideo();
    }
  }, [isEditMode, videoId, dispatch, navigate]);

  // Handle form submission (Create or Update)
  const submit = async (e) => {
    e.preventDefault();

    // Use toast notification instead of alert
    if (!auth.user)
      return toast.error("Sign in required to upload/edit videos.");

    setLoading(true);
    let successMessage = isEditMode
      ? "Video updated successfully!"
      : "Video uploaded successfully!";
    let errorMessage = isEditMode ? "Update failed: " : "Upload failed: ";

    try {
      if (isEditMode) {
        await updateVideo({ videoId, data: form });
      } else {
        await dispatch(createVideo(form)).unwrap();
      }

      // Success Notification
      toast.success(successMessage);

      // Navigate back to the channel page or home after successful operation
      navigate(isEditMode ? `/channel/${form.channelId}` : "/");
    } catch (err) {
      // Error Notification
      toast.error(
        errorMessage + (err.response?.data?.message || "Server Error.")
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center text-gray-600">Loading form...</div>;

  return (
    <div className="flex justify-center min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-xl md:p-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          {isEditMode ? "Edit Video" : "Upload Video"}
        </h2>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* Input fields */}
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            required
            className="p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          />
          <input
            value={form.thumbnailUrl}
            onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
            placeholder="Thumbnail URL"
            className="p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          />
          <input
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            placeholder="Video URL (mp4 link)"
            required
            className="p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows="4"
            className="p-3 border border-gray-300 rounded-lg resize-y focus:ring-red-500 focus:border-red-500"
          />

          {/* Category Dropdown */}
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="p-3 bg-white border border-gray-300 rounded-lg appearance-none focus:ring-red-500 focus:border-red-500"
          >
            <option>General</option>
            <option>Programming</option>
            <option>React</option>
            <option>Node</option>
            <option>Music</option>
            <option>Data Structures</option>
            <option>Server</option>
          </select>

          {/* Channel Selection Dropdown */}
          <select
            value={form.channelId}
            onChange={(e) => setForm({ ...form, channelId: e.target.value })}
            className="p-3 bg-white border border-gray-300 rounded-lg appearance-none focus:ring-red-500 focus:border-red-500"
            required
          >
            <option value="">Select channel</option>
            {channels.map((c) => (
              <option key={c._id} value={c._id}>
                {c.channelName}
              </option>
            ))}
          </select>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 text-lg font-semibold text-white transition duration-200 bg-red-600 rounded-lg hover:bg-red-700"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : isEditMode
                ? "Save Changes"
                : "Upload"}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(isEditMode ? `/channel/${form.channelId}` : "/")
              }
              className="flex-1 px-6 py-3 text-lg font-semibold text-gray-700 transition duration-200 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
