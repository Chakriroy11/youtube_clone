// frontend/src/pages/Auth.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

/**
 * Auth page
 * - nicer centered card
 * - clear field validation + inline errors
 * - server-side errors shown
 * - sign in / register toggle
 * - optional Google Form is collapsed by default
 */
export default function Auth() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showFormEmbed, setShowFormEmbed] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    emailOrUsername: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({}); // { field: message }
  const [submitError, setSubmitError] = useState(null);

  const resetErrors = () => {
    setFieldErrors({});
    setSubmitError(null);
  };

  const validate = () => {
    const errs = {};
    if (!isLogin) {
      // register validations
      if (!form.username || form.username.trim().length < 3)
        errs.username = "Username must be at least 3 characters.";
      if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
        errs.email = "Please enter a valid email address.";
      if (!form.password || form.password.length < 6)
        errs.password = "Password must be at least 6 characters.";
    } else {
      // login validations
      if (!form.emailOrUsername || form.emailOrUsername.trim().length < 1)
        errs.emailOrUsername = "Email or username is required.";
      if (!form.password || form.password.length < 6)
        errs.password = "Password must be at least 6 characters.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    resetErrors();

    if (!validate()) return;

    try {
      if (isLogin) {
        const res = await dispatch(
          login({
            emailOrUsername: form.emailOrUsername || form.email,
            password: form.password,
          })
        );
        if (res.type && res.type.endsWith("fulfilled")) {
          navigate("/");
        } else {
          // handle server error payload (authSlice rejects with err.response?.data)
          const err = res.payload || res.error || {};
          setSubmitError(err.message || "Sign in failed. Check credentials.");
        }
      } else {
        const res = await dispatch(
          register({
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
          })
        );
        if (res.type && res.type.endsWith("fulfilled")) {
          // successful register -> switch to login with message
          setIsLogin(true);
          setForm({ ...form, emailOrUsername: form.email });
          setSubmitError(null);
          alert("Registered successfully — please sign in.");
        } else {
          const err = res.payload || res.error || {};
          setSubmitError(err.message || "Registration failed.");
        }
      }
    } catch (err) {
      setSubmitError(err?.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-start justify-center py-12 px-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          {isLogin ? "Sign in" : "Create account"}
        </h2>

        {/* Server / submit error */}
        {submitError || auth.error ? (
          <div className="p-3 mb-3 text-sm text-red-700 border border-red-100 rounded bg-red-50">
            {submitError ||
              (auth.error &&
                (auth.error.message || JSON.stringify(auth.error)))}
          </div>
        ) : null}

        <form onSubmit={submit} className="flex flex-col gap-3">
          {!isLogin && (
            <>
              <label className="text-sm text-gray-700">Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Choose a username"
                className={`p-3 border rounded focus:outline-none ${
                  fieldErrors.username ? "border-red-400" : "border-gray-200"
                }`}
                aria-invalid={!!fieldErrors.username}
              />
              {fieldErrors.username && (
                <div className="text-xs text-red-600">
                  {fieldErrors.username}
                </div>
              )}
            </>
          )}

          {!isLogin && (
            <>
              <label className="text-sm text-gray-700">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                className={`p-3 border rounded focus:outline-none ${
                  fieldErrors.email ? "border-red-400" : "border-gray-200"
                }`}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <div className="text-xs text-red-600">{fieldErrors.email}</div>
              )}
            </>
          )}

          {isLogin && (
            <>
              <label className="text-sm text-gray-700">Email or Username</label>
              <input
                value={form.emailOrUsername}
                onChange={(e) =>
                  setForm({ ...form, emailOrUsername: e.target.value })
                }
                placeholder="Email or username"
                className={`p-3 border rounded focus:outline-none ${
                  fieldErrors.emailOrUsername
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
                aria-invalid={!!fieldErrors.emailOrUsername}
              />
              {fieldErrors.emailOrUsername && (
                <div className="text-xs text-red-600">
                  {fieldErrors.emailOrUsername}
                </div>
              )}
            </>
          )}

          <label className="text-sm text-gray-700">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
            className={`p-3 border rounded focus:outline-none ${
              fieldErrors.password ? "border-red-400" : "border-gray-200"
            }`}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password && (
            <div className="text-xs text-red-600">{fieldErrors.password}</div>
          )}

          <button
            type="submit"
            className="py-2 mt-1 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none disabled:opacity-60"
            disabled={auth.loading}
          >
            {auth.loading
              ? isLogin
                ? "Signing in..."
                : "Registering..."
              : isLogin
              ? "Sign in"
              : "Register"}
          </button>
        </form>

        <div className="flex items-center justify-between mt-4 text-sm">
          <button
            onClick={() => {
              resetErrors();
              setIsLogin(!isLogin);
            }}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? "Create an account" : "Have an account? Sign in"}
          </button>

          {/* optional toggle for Google form embed */}
          <button
            onClick={() => setShowFormEmbed((s) => !s)}
            className="text-xs text-gray-600 hover:underline"
            aria-expanded={showFormEmbed}
          >
            {showFormEmbed ? "Hide optional form" : "Show optional form"}
          </button>
        </div>

        {/* optional Google Form area (collapsed by default) */}
        {showFormEmbed && (
          <div className="mt-6 text-sm text-gray-600">
            <div className="mb-2">Embedded Google Form (optional)</div>
            <div className="h-56 overflow-auto border rounded">
              {/* Use your own valid embedded form link here. If the URL is invalid you'll see an external message. */}
              <iframe
                title="google-form"
                src="https://docs.google.com/forms/d/e/1FAIpQLSd-placeholder/viewform?embedded=true"
                className="w-full h-[480px] min-h-[300px]"
                style={{ border: "none" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}