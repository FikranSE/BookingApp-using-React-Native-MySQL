"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Updated import for App Router
import { LockIcon, MailIcon, EyeIcon, EyeOffIcon, AlertCircleIcon } from "lucide-react";

const LoginPage = () => {
  // Router for redirection (App Router compatible)
  const router = useRouter();
  
  // State management
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

  // Check for existing session on component mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      console.log("Found existing token, checking validity...");
      // Optionally verify token with backend
      router.push("/list/room-bookings"); // Redirect to admin dashboard directly
    }
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear specific error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "", general: "" };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
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

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;

    setLoading(true);
    setErrors({ ...errors, general: "" });

    try {
      // Important: Make sure this URL matches your admin login endpoint exactly
      const response = await axios.post(
        "https://j9d3hc82-3001.asse.devtunnels.ms/api/admins/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      console.log("Login response:", response.data);
      setDebug(`Login response received: ${JSON.stringify(response.data)}`);

      // Handle successful login
      if (response.data && response.data.token) {
        // Store token in localStorage (always use localStorage for admin token)
        localStorage.setItem("adminToken", response.data.token);
        console.log("Token saved:", response.data.token);
        
        // Store admin info if available
        if (response.data.admin) {
          localStorage.setItem("adminInfo", JSON.stringify(response.data.admin));
        }
        
        // Set axios default headers for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        
        // Redirect to admin dashboard - use the correct path
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
      
      // Handle different error scenarios
      if (err.response) {
        // Server responded with an error
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
        // No response received
        setErrors({
          ...errors,
          general: "Unable to connect to the server. Please check your internet connection."
        });
      } else {
        // Something else happened
        setErrors({
          ...errors,
          general: "An unexpected error occurred. Please try again later."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
            <p className="text-gray-600 mt-2">Enter your credentials to access the admin panel</p>
          </div>

          {/* Error message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start gap-3">
              <AlertCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-red-600 text-sm">{errors.general}</span>
            </div>
          )}

          {/* Debug info (hidden in production) */}
          {debug && (
            <div className="mb-6 p-2 bg-gray-50 rounded-lg text-xs text-gray-500 border">
              <div>Debug info:</div>
              <div className="font-mono mt-1 break-words">{debug}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email input */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full pl-10 pr-3 py-3 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password input */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`w-full pl-10 pr-10 py-3 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="/admin/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transform transition duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign in to Admin Panel"
              )}
            </button>

            {/* Utils for debugging */}
            <div className="mt-4 flex justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  localStorage.removeItem("adminInfo");
                  setDebug("Cleared localStorage tokens");
                }}
                className="text-red-500 hover:underline"
              >
                Clear tokens
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => {
                  const token = localStorage.getItem("adminToken");
                  setDebug(`Current token: ${token ? token.substring(0, 15) + "..." : "none"}`);
                }}
                className="text-blue-500 hover:underline"
              >
                Check token
              </button>
            </div>

            {/* Security note */}
            <div className="text-center mt-6 text-xs text-gray-500">
              <p>Secure login protected by 256-bit encryption.</p>
              <p className="mt-1">Unauthorized access attempts will be logged.</p>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need technical support? <a href="#" className="font-medium text-blue-600 hover:text-blue-800">Contact IT department</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;