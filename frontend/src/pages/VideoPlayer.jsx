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

  // Load video and comments on mount or ID change [cite: 43, 63]
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

  // Reaction Logic [cite: 112]
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

  if (!video) return <div className="p-10 text-center">Loading Video...</div>;

  return (
    // FIX: overflow-x-hidden and max-w-screen prevent horizontal overflow 
    <div className="w-full overflow-x-hidden bg-white min-h-screen">
      <div className="max-w-[1280px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Main Section (Player + Details + Comments) */}
        <div className="flex-1 w-full lg:max-w-[75%]">
          
          {/* Video Player Surface [cite: 37, 124] */}
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-sm">
            <video 
              key={video.videoUrl} 
              src={video.videoUrl} 
              poster={video.thumbnailUrl} 
              controls 
              className="w-full h-full"
            />
          </div>

          {/* Title and Stats [cite: 12, 15, 38] */}
          <h1 className="mt-4 text-xl font-bold text-gray-900">{video.title}</h1>
          
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b">
            <div className="flex items-center gap-3">
              <img 
                src={video.uploader?.avatar || "https://i.pravatar.cc/44"} 
                className="w-10 h-10 rounded-full object-cover" 
                alt="uploader"
              />
              <div>
                <div className="font-bold text-sm">{video.uploader?.username || "Channel Name"}</div>
                <div className="text-xs text-gray-500">{video.views?.toLocaleString()} views</div>
              </div>
              <button className="ml-4 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800">
                Subscribe
              </button>
            </div>

            {/* Like/Dislike Buttons [cite: 40, 112] */}
            <div className="flex items-center bg-gray-100 rounded-full overflow-hidden">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-200 border-r ${isLiked ? 'text-blue-600' : ''}`}
              >
                <span>{video.likes || 0}</span>
              </button>
              <button 
                onClick={handleDislike}
                className={`px-4 py-2 hover:bg-gray-200 ${isDisliked ? 'text-red-600' : ''}`}
              >
                Dislike
              </button>
            </div>
          </div>

          {/* Description [cite: 38] */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm whitespace-pre-wrap">{video.description}</p>
          </div>

          {/* Comment Section [cite: 41, 125] */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">{comments?.length || 0} Comments</h3>
            
            <div className="flex gap-4 mb-8">
              <img src={auth?.user?.avatar || "https://i.pravatar.cc/40"} className="w-10 h-10 rounded-full" alt="me" />
              <div className="flex-1">
                <input 
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border-b border-gray-300 focus:border-black py-1 outline-none transition"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setText("")} className="text-sm font-bold px-3 py-1">Cancel</button>
                  <button 
                    onClick={postComment}
                    disabled={!text.trim() || commentsLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold disabled:bg-gray-300"
                  >Comment</button>
                </div>
              </div>
            </div>

            <ul className="space-y-6">
              {comments?.map((c) => (
                <li key={c._id} className="flex gap-4 group">
                  <img src={c.userId?.avatar || "https://i.pravatar.cc/32"} className="w-8 h-8 rounded-full" alt="user" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold">@{c.userId?.username}</span>
                      <span className="text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>

                    {editingId === c._id ? (
                      <div className="mt-2">
                        <input 
                          value={editingText} 
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full border-b border-black outline-none"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => setEditingId(null)} className="text-xs">Cancel</button>
                          <button onClick={() => saveEdit(c._id)} className="text-xs font-bold">Save</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm mt-1">{c.text}</p>
                    )}

                    {/* Show Actions only if user owns the comment  */}
                    {(c.userId?._id === currentUserId || c.userId === currentUserId) && editingId !== c._id && (
                      <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => { setEditingId(c._id); setEditingText(c.text); }} className="text-xs font-bold text-gray-500">Edit</button>
                        <button onClick={() => removeComment(c._id)} className="text-xs font-bold text-red-500">Delete</button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar / Recommendations */}
        <aside className="w-full lg:w-[25%] space-y-4">
          <h4 className="font-bold text-sm">Recommended</h4>
          <div className="flex gap-2">
            <div className="w-40 h-24 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-2 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}