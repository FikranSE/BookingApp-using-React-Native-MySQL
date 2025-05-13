"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockIcon, MailIcon, EyeIcon, EyeOffIcon, AlertCircleIcon } from "lucide-react";

const LoginPage = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [debug, setDebug] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      console.log("Found existing token, checking validity...");
      router.push("/list/room-bookings");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "", general: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({ ...errors, general: "" });

    try {
      const response = await axios.post(
        "https://bookingsisi.maturino.my.id/api/admins/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      console.log("Login response:", response.data);
      setDebug(`Login response received: ${JSON.stringify(response.data)}`);

      if (response.data && response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        console.log("Token saved:", response.data.token);
        
        if (response.data.admin) {
          localStorage.setItem("adminInfo", JSON.stringify(response.data.admin));
        }
        
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        
        router.push("/list/room-bookings");
      } else {
        setErrors({
          ...errors,
          general: "Login successful but no token received. Please try again."
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setDebug(`Login error: ${err.message}, Status: ${err.response?.status}`);
      
      if (err.response) {
        if (err.response.status === 401) {
          setErrors({
            ...errors,
            general: "Invalid email or password. Please try again."
          });
        } else if (err.response.status === 403) {
          setErrors({
            ...errors,
            general: "Your account is disabled. Please contact an administrator."
          });
        } else {
          setErrors({
            ...errors,
            general: err.response.data?.message || "An error occurred during login. Please try again."
          });
        }
      } else if (err.request) {
        setErrors({
          ...errors,
          general: "Unable to connect to the server. Please check your internet connection."
        });
      } else {
        setErrors({
          ...errors,
          general: "An unexpected error occurred. Please try again later."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-sky-50">
      <div className="w-full max-w-md p-2">
        <div className="bg-white p-8 rounded-xl shadow-md border border-sky-100">
          {/* Logo/Brand Element */}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-sky-500 rounded-full flex items-center justify-center">
              <LockIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-light text-gray-800">Admin <span className="font-bold">Login</span></h1>
            <p className="text-sky-600 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          {/* Error message */}
          {errors.general && (
            <div className="mb-6 p-3 bg-red-50 rounded-lg flex items-start gap-2">
              <AlertCircleIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-red-600 text-sm">{errors.general}</span>
            </div>
          )}

          {/* Debug info (hidden in production) */}
          {debug && (
            <div className="mb-4 p-2 bg-gray-50 rounded-lg text-xs text-gray-500 border">
              <div>Debug info:</div>
              <div className="font-mono mt-1 break-words">{debug}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email input */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-4 w-4 text-sky-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full pl-10 pr-3 py-2.5 border ${
                    errors.email ? "border-red-300" : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all bg-gray-50`}
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password input */}
            <div className="mb-5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-4 w-4 text-sky-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.password ? "border-red-300" : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all bg-gray-50`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-gray-400 hover:text-sky-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400 hover:text-sky-500" />
                  )}
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-600">
                  Remember me
                </label>
              </div>
              <div className="text-xs">
                <Link href="/admin/forgot-password" className="text-sky-600 hover:text-sky-800 font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg shadow-sm transition duration-150 hover:shadow focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>

            {/* Utils for debugging - hidden in small screen */}
            <div className="mt-4 flex justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  localStorage.removeItem("adminInfo");
                  setDebug("Cleared localStorage tokens");
                }}
                className="text-red-400 hover:text-red-500 text-xs"
              >
                Clear tokens
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => {
                  const token = localStorage.getItem("adminToken");
                  setDebug(`Current token: ${token ? token.substring(0, 15) + "..." : "none"}`);
                }}
                className="text-sky-400 hover:text-sky-500 text-xs"
              >
                Check token
              </button>
            </div>

            {/* Security indicator */}
            <div className="flex items-center justify-center mt-5 text-xs text-gray-400">
              <LockIcon className="h-3 w-3 mr-1" />
              <span>Secure connection</span>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Need help? <a href="#" className="font-medium text-sky-600 hover:text-sky-700">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;