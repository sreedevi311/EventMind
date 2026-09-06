import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";

import Illustration from "../assets/auth-illustration.svg";

import GradientButton from "../components/auth/GradientButton";
import { signup } from "../services/authService";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return toast.error("Please fill all fields.");
    }
    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    try {
      setLoading(true);

      const res = await signup({
        name: form.name,

        email: form.email,

        password: form.password,
      });

      toast.success(res.data.message);

      navigate("/verify-signup-otp", {
        state: {
          email: form.email,
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page grid lg:grid-cols-2">
      {/* LEFT */}

      <div className="hidden lg:flex gradient-primary relative overflow-hidden">
        <div className="absolute w-72 h-72 rounded-full bg-white/10 -top-20 -left-20" />

        <div className="absolute w-96 h-96 rounded-full bg-white/10 -bottom-32 -right-24" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-6xl font-bold">EventMind</h1>

          <p className="text-xl mt-8 leading-9 max-w-lg">
            Create your account and start managing registrations intelligently
            with AI.
          </p>

          <img src={Illustration} alt="" className="mt-14 w-full max-w-md" />
        </div>
      </div>

      {/* RIGHT */}

      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{
            opacity: 0,
            x: 40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="card w-full max-w-md p-10"
        >
          <h2 className="heading text-4xl">Create Account</h2>

          <p className="subtitle mt-2 mb-8">Join EventMind today.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <FiUser className="absolute left-4 top-4 text-gray-400" />

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="input pl-11"
              />
            </div>

            <div className="relative">
              <FiMail className="absolute left-4 top-4 text-gray-400" />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="input pl-11"
              />
            </div>

            <div className="relative">
              <FiLock className="absolute left-4 top-4 text-gray-400" />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="input pl-11"
              />
            </div>

            <div className="relative">
              <FiLock className="absolute left-4 top-4 text-gray-400" />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input pl-11"
              />
            </div>

            <GradientButton type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </GradientButton>
          </form>

          <p className="text-center mt-8 text-gray-600">
            Already have an account?
            <Link to="/login" className="ml-2 font-semibold text-primary">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
