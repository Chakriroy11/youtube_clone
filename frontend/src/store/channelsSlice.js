// frontend/src/store/channelsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

export const fetchChannels = createAsyncThunk("channels/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await API.get("/channels");
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: "Failed to load channels" });
  }
});

export const fetchChannelById = createAsyncThunk("channels/fetchById", async (id, { rejectWithValue }) => {
  try {
    const res = await API.get(`/channels/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: "Failed to load channel" });
  }
});

// Important: createChannel now expects server to return { channel, user }
export const createChannel = createAsyncThunk("channels/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await API.post("/channels", payload);
    // return the full response (so UI / auth slice can update)
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: "Failed to create channel" });
  }
});

const channelsSlice = createSlice({
  name: "channels",
  initialState: { list: [], current: null, loading: false, error: null },
  reducers: {
    clearCurrentChannel(state) { state.current = null; state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchChannels.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchChannels.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      .addCase(fetchChannelById.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchChannelById.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(fetchChannelById.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      .addCase(createChannel.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createChannel.fulfilled, (s, a) => {
        s.loading = false;
        // server returned { channel, user }
        // add channel to list and set current channel
        const channel = a.payload?.channel ?? a.payload;
        if (channel) {
          // avoid duplicates
          if (!s.list.find((c) => String(c._id) === String(channel._id))) {
            s.list.unshift(channel);
          }
          s.current = channel;
        }
      })
      .addCase(createChannel.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; });
  }
});

export const { clearCurrentChannel } = channelsSlice.actions;
export default channelsSlice.reducer;
