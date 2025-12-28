/* frontend/src/store/VideoSlice.js */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

/* fetchVideos is the action you said you import in components */
export const fetchVideos = createAsyncThunk(
  "videos/fetchAll",
  async ({ q, category } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (q) params.q = q;
      if (category && category !== "All") params.category = category;
      const res = await API.get("/videos", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to load videos" });
    }
  }
);

export const fetchVideoById = createAsyncThunk(
  "videos/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/videos/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to load video" });
    }
  }
);

export const createVideo = createAsyncThunk(
  "videos/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await API.post("/videos", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to create" });
    }
  }
);

export const likeVideo = createAsyncThunk(
  "videos/like",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.post(`/videos/${id}/like`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Like failed" });
    }
  }
);

export const dislikeVideo = createAsyncThunk(
  "videos/dislike",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.post(`/videos/${id}/dislike`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Dislike failed" });
    }
  }
);

const videosSlice = createSlice({
  name: "videos",
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null
  },
  reducers: {
    clearCurrent(state) {
      state.current = null;
      state.error = null;
    },
    // new reducer to clear all video-related UI state (used on sign out)
    clearVideos(state) {
      state.list = [];
      state.current = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchVideos.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchVideos.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      .addCase(fetchVideoById.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchVideoById.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(fetchVideoById.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      .addCase(createVideo.fulfilled, (s, a) => { s.list.unshift(a.payload); })

      .addCase(likeVideo.fulfilled, (s, a) => { s.current = a.payload; })
      .addCase(dislikeVideo.fulfilled, (s, a) => { s.current = a.payload; });
  }
});

export const { clearCurrent, clearVideos } = videosSlice.actions;
export default videosSlice.reducer;
