import { useState } from "react";
import axios from "axios";
import { FaSignInAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Regex patterns (same as SignUp.jsx)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = { email: "", password: "" };

    if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!passwordRegex.test(form.password)) {
      newErrors.password =
        "Password must be at least 8 characters long and include at least 1 letter and 1 number.";
    }

    setErrors(newErrors);

    // Stop if any error exists
    if (newErrors.email || newErrors.password) return;

    setIsLoading(true);

    try {
      console.log("Sending login request:", form); // Debug log

      // FIXED: Use correct endpoint and form data  
      const res = await axios.post("http://127.0.0.1:5000/auth/login", form, {
        headers: { 
          "Content-Type": "application/json" 
        },
        withCredentials: true // Important for CORS
      });

      console.log("Login response:", res.data); // Debug log

      // Store token and user data
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      console.log("Token stored:", localStorage.getItem("token")); // Debug log
      console.log("About to navigate to dashboard..."); // Debug log

      // Navigate to dashboard
      navigate("/dashboard");
      
      // Success message after navigation attempt
      alert(res.data.message || "Login successful!");
      
    } catch (err) {
      console.error("Login error:", err); // Debug log
      
      let errorMessage = "Login failed";
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "Network error - please check your connection";
      } else {
        // Something else happened
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12 font-mono text-gray-900">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 justify-center text-gray-900">
          <FaSignInAlt className="text-gray-700" />
          Login to Your Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-4 py-3 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 transition`}
              required
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full px-4 py-3 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 transition`}
              required
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-md font-semibold transition-colors duration-200 ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed text-gray-600" 
                : "bg-gray-900 hover:bg-gray-800 text-white"
            }`}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>

          {/* Sign up link */}
          <div className="flex flex-row gap-2 justify-center text-sm">
            <div className="text-gray-600">Don't have an account?</div>
            <div
              onClick={() => !isLoading && navigate("/signup")}
              className={`font-semibold transition-colors duration-200 ${
                isLoading 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-900 hover:text-gray-700 cursor-pointer"
              }`}
            >
              Sign up
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;