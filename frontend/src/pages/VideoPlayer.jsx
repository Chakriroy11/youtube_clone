import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchVideoById, likeVideo, dislikeVideo } from "../store/VideoSlice";
import {
  fetchComments,
  addComment,
  updateComment,
  deleteComment,
} from "../store/commentsSlice";
import API from "../api/axios";

export default function VideoPlayer() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux Selectors
  const video = useSelector((s) => s.videos.current);
  const auth = useSelector((s) => s.auth);
  const comments = useSelector((s) => s.comments.list);
  const commentsLoading = useSelector((s) => s.comments.loading);

  // Local State
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);

  // Load video and comments on mount or ID change
  useEffect(() => {
    if (!id) return;
    dispatch(fetchVideoById(id));
    dispatch(fetchComments(id));
    
    // Record view to backend
    API.post(`/videos/${id}/view`).catch(() => {});
    
    // Reset local UI states
    setText("");
    setEditingId(null);
  }, [dispatch, id]);

  // Handle click outside for comment menus
  useEffect(() => {
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const currentUserId = useMemo(() => {
    return auth?.user?._id || auth?.user?.id || null;
  }, [auth]);

  // Reaction Logic
  const isLiked = video?.likedBy?.includes(currentUserId);
  const isDisliked = video?.dislikedBy?.includes(currentUserId);

  const handleLike = async () => {
    if (!currentUserId) return navigate("/auth");
    await dispatch(likeVideo(id));
    dispatch(fetchVideoById(id));
  };

  const handleDislike = async () => {
    if (!currentUserId) return navigate("/auth");
    await dispatch(dislikeVideo(id));
    dispatch(fetchVideoById(id));
  };

  // Comment CRUD Logic 
  const postComment = async () => {
    if (!currentUserId) return navigate("/auth");
    if (!text.trim()) return;
    await dispatch(addComment({ videoId: id, text: text.trim() }));
    dispatch(fetchComments(id));
    setText("");
  };

  const saveEdit = async (commentId) => {
    if (!editingText.trim()) return;
    await dispatch(updateComment({ id: commentId, text: editingText.trim() }));
    dispatch(fetchComments(id));
    setEditingId(null);
  };

  const removeComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    await dispatch(deleteComment(commentId));
    dispatch(fetchComments(id));
  };

  if (!video) return <div className="p-10 text-center animate-pulse text-gray-500">Loading Video...</div>;

  return (
    // RECTIFICATION: overflow-x-hidden and w-full prevent horizontal overflow on desktop
    <div className="w-full max-w-full overflow-x-hidden bg-white min-h-screen">
      <div className="max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Main Section (Player + Details + Comments) */}
        <div className="flex-1 w-full lg:max-w-[72%]">
          
          {/* Video Player Surface - Watchable Fix */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <video 
              key={video.videoUrl} 
              poster={video.thumbnailUrl} 
              controls 
              className="w-full h-full object-contain"
              onError={(e) => console.error("Video failed to load:", e)}
            >
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
          </div>

          {/* Title and Stats */}
          <div className="mt-5">
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{video.title}</h1>
            
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 mt-2">
              <div className="flex items-center gap-4">
                <img 
                  src={video.uploader?.avatar || "https://i.pravatar.cc/100"} 
                  className="w-11 h-11 rounded-full border border-gray-200 object-cover" 
                  alt="uploader"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-base text-gray-900">{video.uploader?.username || "Channel Name"}</span>
                  <span className="text-xs text-gray-500">1.2M subscribers</span>
                </div>
                <button className="ml-4 px-6 py-2 bg-black text-white rounded-full text-sm font-bold transition hover:bg-gray-800">
                  Subscribe
                </button>
              </div>

              {/* Like/Dislike Buttons */}
              <div className="flex items-center bg-gray-100 rounded-full px-1">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-5 py-2 hover:bg-gray-200 transition rounded-l-full border-r border-gray-300 ${isLiked ? 'text-blue-600' : 'text-gray-700'}`}
                >
                  <span className="font-bold">{video.likes || 0}</span>
                </button>
                <button 
                  onClick={handleDislike}
                  className={`flex items-center px-5 py-2 hover:bg-gray-200 transition rounded-r-full ${isDisliked ? 'text-red-600' : 'text-gray-700'}`}
                >
                  Dislike
                </button>
              </div>
            </div>

            {/* Description Box */}
            <div className="mt-2 p-4 bg-gray-100 hover:bg-gray-200 transition rounded-xl">
              <div className="flex gap-3 text-sm font-bold mb-1">
                <span>{video.views?.toLocaleString()} views</span>
                <span>{new Date(video.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{video.description}</p>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-6 text-gray-900">{comments?.length || 0} Comments</h3>
            
            <div className="flex gap-4 mb-10">
              <img src={auth?.user?.avatar || "https://i.pravatar.cc/100"} className="w-10 h-10 rounded-full border" alt="me" />
              <div className="flex-1">
                <input 
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border-b border-gray-300 focus:border-black py-2 outline-none transition text-sm"
                />
                <div className="flex justify-end gap-3 mt-3">
                  <button onClick={() => setText("")} className="text-sm font-bold px-4 py-2 hover:bg-gray-100 rounded-full">Cancel</button>
                  <button 
                    onClick={postComment}
                    disabled={!text.trim() || commentsLoading}
                    className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold disabled:bg-gray-200 disabled:text-gray-400 transition"
                  >Comment</button>
                </div>
              </div>
            </div>

            <ul className="space-y-8">
              {comments?.map((c) => (
                <li key={c._id} className="flex gap-4 group">
                  <img src={c.userId?.avatar || "https://i.pravatar.cc/100"} className="w-10 h-10 rounded-full border" alt="user" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs">@{c.userId?.username}</span>
                      <span className="text-[10px] text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>

                    {editingId === c._id ? (
                      <div className="mt-2">
                        <input 
                          value={editingText} 
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full border-b border-black outline-none text-sm py-1"
                          autoFocus
                        />
                        <div className="flex justify-end gap-3 mt-3">
                          <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1">Cancel</button>
                          <button onClick={() => saveEdit(c._id)} className="text-xs font-bold px-3 py-1 bg-black text-white rounded-full">Save</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-800 leading-snug">{c.text}</p>
                    )}

                    {(c.userId?._id === currentUserId || c.userId === currentUserId) && editingId !== c._id && (
                      <div className="flex gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingId(c._id); setEditingText(c.text); }} className="text-[10px] font-bold text-gray-500 hover:text-black">Edit</button>
                        <button onClick={() => removeComment(c._id)} className="text-[10px] font-bold text-red-500 hover:text-red-700">Delete</button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar / Recommendations */}
        <aside className="w-full lg:w-[28%] space-y-6">
          <h4 className="font-bold text-base text-gray-900">Recommended for you</h4>
          <div className="space-y-4">
             {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex gap-3 group cursor-pointer">
                    <div className="w-44 h-24 bg-gray-200 rounded-xl flex-shrink-0 animate-pulse group-hover:bg-gray-300 transition" />
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse group-hover:bg-gray-300" />
                        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse group-hover:bg-gray-300" />
                    </div>
                </div>
             ))}
          </div>
        </aside>

      </div>
    </div>
  );
}