import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import { verifySignupOTP } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const VerifySignupOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, []);
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };
  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputs.current[index - 1].focus();
    }
  };
  const handleVerify = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      toast.error("Please enter OTP.");
      return;
    }
    try {
      setLoading(true);
      const res = await verifySignupOTP({
        email,
        otp: finalOtp,
      });
      login(
        res.data.token,
        res.data.user,
      );
      toast.success("Account verified successfully.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page flex items-center justify-center p-8">
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="card w-full max-w-md p-10"
      >
        <h1 className="heading text-3xl text-center">Verify OTP</h1>

        <p className="subtitle text-center mt-3">
          We've sent a verification code to
        </p>

        <p
          className="font-semibold text-center mt-2"
          style={{
            color: "var(--primary)",
          }}
        >
          {email}
        </p>

        <div className="flex justify-between mt-10">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              className="w-12 h-14 border rounded-xl text-center text-xl font-semibold outline-none focus:border-blue-500"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="btn-primary w-full mt-10"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </motion.div>
    </div>
  );
};

export default VerifySignupOTP;
