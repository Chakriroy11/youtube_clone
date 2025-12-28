// frontend/src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

/**
 * Fetch logged-in user (rehydration)
 * GET /api/auth/me
 */
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/auth/me");
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Fetch me failed" });
    }
  }
);

/**
 * LOGIN
 * POST /api/auth/login
 */
export const login = createAsyncThunk(
  "auth/login",
  async ({ emailOrUsername, password }, { rejectWithValue, dispatch }) => {
    try {
      const res = await API.post("/auth/login", {
        emailOrUsername,
        password
      });

      const { token } = res.data;

      // save token
      localStorage.setItem("token", token);
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 🔥 fetch full user
      const me = await dispatch(fetchMe()).unwrap();

      // persist user
      localStorage.setItem("user", JSON.stringify(me));

      return {
        token,
        user: me
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Login failed" });
    }
  }
);

/**
 * REGISTER
 */
export const register = createAsyncThunk(
  "auth/register",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const res = await API.post("/auth/register", {
        username,
        email,
        password
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Register failed" });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: (() => {
      try {
        return JSON.parse(localStorage.getItem("user"));
      } catch {
        return null;
      }
    })(),
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      delete API.defaults.headers.common["Authorization"];
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      })

      // FETCH ME
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
      })

      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
