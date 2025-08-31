import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({ username: '', email: '', password: '' });

  // Regex patterns
  const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/; 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = { username: '', email: '', password: '' };

    if (!usernameRegex.test(formData.username)) {
      newErrors.username = 'Username must be 3–15 characters and contain only letters, numbers, or underscores.';
    }
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters long and include at least 1 letter and 1 number.';
    }

    setErrors(newErrors);

    if (!newErrors.username && !newErrors.email && !newErrors.password) {
      try {
        console.log("Sending signup request:", formData); // FIXED: log formData
        const res = await axios.post("http://127.0.0.1:5000/auth/signup", formData, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        });

        console.log("Signup response:", res.data);

        // If backend sends access_token and user, store them; otherwise, skip
        if (res.data.access_token && res.data.user) {
          localStorage.setItem("token", res.data.access_token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        alert(res.data.message || "Signup successful!");
        navigate('/login');
      } catch (err) {
        console.error("Signup error:", err);
        const errorMessage = err.response?.data?.error || "Signup failed";
        alert(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12 font-mono text-gray-900">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Create an Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Username */}
          <div>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={`w-full px-4 py-3 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 transition`}
              required
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 transition`}
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 transition`}
              required
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-md font-semibold transition-colors duration-200"
          >
            Sign Up
          </button>

          {/* Login link */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-gray-900 font-semibold hover:text-gray-700 cursor-pointer transition-colors duration-200"
            >
              Log in
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
