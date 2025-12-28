/* frontend/src/store/commentsSlice.js */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

export const fetchComments = createAsyncThunk(
  "comments/fetch",
  async (videoId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/comments/${videoId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to load comments" });
    }
  }
);

export const addComment = createAsyncThunk(
  "comments/add",
  async ({ videoId, text }, { rejectWithValue }) => {
    try {
      const res = await API.post(`/comments/${videoId}`, { text });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to add comment" });
    }
  }
);

export const updateComment = createAsyncThunk(
  "comments/update",
  async ({ id, text }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/comments/${id}`, { text });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to update comment" });
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.delete(`/comments/${id}`);
      return { id, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to delete" });
    }
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState: { list: [], loading: false, error: null },
  reducers: {
    clearComments(state) {
      state.list = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchComments.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchComments.fulfilled, (s, a) => { s.loading = false; s.list = a.payload || []; })
      .addCase(fetchComments.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      // add
      .addCase(addComment.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(addComment.fulfilled, (s, a) => {
        s.loading = false;
        // frontend will keep newest at top
        s.list.unshift(a.payload);
      })
      .addCase(addComment.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      // update
      .addCase(updateComment.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateComment.fulfilled, (s, a) => {
        s.loading = false;
        const idx = s.list.findIndex(c => c._id === a.payload._id);
        if (idx !== -1) s.list[idx] = a.payload;
      })
      .addCase(updateComment.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      // delete
      .addCase(deleteComment.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteComment.fulfilled, (s, a) => {
        s.loading = false;
        s.list = s.list.filter(c => c._id !== a.payload.id);
      })
      .addCase(deleteComment.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; });
  }
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;
