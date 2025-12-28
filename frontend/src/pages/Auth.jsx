import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

/**
 * Auth page
 * - Enhanced centered card with YouTube-style clean UI
 * - Stricter password validation (Upper/Lower/Number/Special)
 * - Dynamic password requirement feedback
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

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Stricter Password Validation Regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const resetErrors = () => {
    setFieldErrors({});
    setSubmitError(null);
  };

  const validate = () => {
    const errs = {};
    if (!isLogin) {
      if (!form.username || form.username.trim().length < 3)
        errs.username = "Username must be at least 3 characters.";
      if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
        errs.email = "Please enter a valid email address.";
      
      // RECTIFICATION: Match stricter backend password rules
      if (!passwordRegex.test(form.password)) {
        errs.password = "Password does not meet the security requirements.";
      }
    } else {
      if (!form.emailOrUsername || form.emailOrUsername.trim().length < 1)
        errs.emailOrUsername = "Email or username is required.";
      if (form.password.length < 6)
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#f9f9f9]">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Sign in" : "Create account"}
          </h2>
          <p className="text-gray-600 text-sm mt-2">to continue to YouTube Clone</p>
        </div>

        {submitError || auth.error ? (
          <div className="p-4 mb-6 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
            {submitError || (auth.error && (auth.error.message || JSON.stringify(auth.error)))}
          </div>
        ) : null}

        <form onSubmit={submit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Username"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  fieldErrors.username ? "border-red-400" : "border-gray-300"
                }`}
              />
              {fieldErrors.username && <p className="text-[10px] text-red-600 mt-1 ml-1">{fieldErrors.username}</p>}
            </div>
          )}

          {!isLogin && (
            <div>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  fieldErrors.email ? "border-red-400" : "border-gray-300"
                }`}
              />
              {fieldErrors.email && <p className="text-[10px] text-red-600 mt-1 ml-1">{fieldErrors.email}</p>}
            </div>
          )}

          {isLogin && (
            <div>
              <input
                value={form.emailOrUsername}
                onChange={(e) => setForm({ ...form, emailOrUsername: e.target.value })}
                placeholder="Email or username"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  fieldErrors.emailOrUsername ? "border-red-400" : "border-gray-300"
                }`}
              />
              {fieldErrors.emailOrUsername && <p className="text-[10px] text-red-600 mt-1 ml-1">{fieldErrors.emailOrUsername}</p>}
            </div>
          )}

          <div>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                fieldErrors.password ? "border-red-400" : "border-gray-300"
              }`}
            />
            {fieldErrors.password && <p className="text-[10px] text-red-600 mt-1 ml-1">{fieldErrors.password}</p>}
            
            {/* RECTIFICATION: Visual feedback for password requirements */}
            {!isLogin && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-[11px] text-gray-500 space-y-1">
                <p className="font-bold mb-1">Password must include:</p>
                <p className={/[A-Z]/.test(form.password) ? "text-green-600" : ""}>• One uppercase letter</p>
                <p className={/[a-z]/.test(form.password) ? "text-green-600" : ""}>• One lowercase letter</p>
                <p className={/\d/.test(form.password) ? "text-green-600" : ""}>• One number</p>
                <p className={/[@$!%*?&]/.test(form.password) ? "text-green-600" : ""}>• One special character (@$!%*?&)</p>
                <p className={form.password.length >= 8 ? "text-green-600" : ""}>• Minimum 8 characters</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 text-white bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            disabled={auth.loading}
          >
            {auth.loading ? "Processing..." : isLogin ? "Sign in" : "Register"}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 items-center">
          <button
            onClick={() => {
              resetErrors();
              setIsLogin(!isLogin);
            }}
            className="text-sm text-blue-600 font-bold hover:underline"
          >
            {isLogin ? "Create account" : "Sign in instead"}
          </button>

          <button
            onClick={() => setShowFormEmbed((s) => !s)}
            className="text-[10px] text-gray-400 hover:text-gray-600 transition underline"
          >
            {showFormEmbed ? "Hide feedback form" : "Trouble signing in?"}
          </button>
        </div>

        {showFormEmbed && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <p className="text-[10px] text-gray-500 mb-2 italic">Please fill this if you encounter issues:</p>
            <iframe
              title="google-form"
              src="https://docs.google.com/forms/d/e/1FAIpQLSd-placeholder/viewform?embedded=true"
              className="w-full h-40 border-none rounded bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}