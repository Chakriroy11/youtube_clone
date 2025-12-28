/* frontend/src/store/store.js */
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import videosReducer from "./VideoSlice";
import channelsReducer from "./channelsSlice";
import commentsReducer from "./commentsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    videos: videosReducer,
    channels: channelsReducer,
    comments: commentsReducer,
  },
});

export default store;
