import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";

import Illustration from "../assets/auth-illustration.svg";

import GradientButton from "../components/auth/GradientButton";
import { login as loginService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return toast.error("Please fill all fields.");
    }
    try {
      setLoading(true);
      const res = await loginService({
        email: form.email,
        password: form.password,
      });
      login(
        res.data.token,

        res.data.user,
      );
      toast.success(res.data.message);
      const role = String(res.data.user.role || "").toUpperCase();
      navigate(role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page grid lg:grid-cols-2">
      {/* LEFT */}

      <div className="hidden lg:flex gradient-primary relative overflow-hidden">
        <div className="absolute w-72 h-72 rounded-full bg-white/10 -top-20 -left-20" />

        <div className="absolute w-96 h-96 rounded-full bg-white/10 -bottom-32 -right-20" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-6xl font-bold">EventMind</h1>

          <p className="text-xl mt-8 leading-9 max-w-lg">
            Manage your events with intelligence.
          </p>

          <img
            src={Illustration}
            alt="Illustration"
            className="mt-14 w-full max-w-md"
          />
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
          transition={{
            duration: 0.5,
          }}
          className="card w-full max-w-md p-10"
        >
          <h2 className="heading text-4xl">Welcome Back</h2>

          <p className="subtitle mt-2 mb-8">Login to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="button"
              className="text-primary text-sm hover:underline"
            >
              Forgot Password?
            </button>

            <GradientButton type="submit" disabled={loading}>
              {loading ? "Logging In..." : "Login"}
            </GradientButton>
          </form>

          <p className="text-center mt-8 text-gray-600">
            Don't have an account?
            <Link to="/signup" className="ml-2 text-primary font-semibold">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
