import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";

import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { generateToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/sendEmail.js";

// ======================================================
// SIGNUP
// ======================================================
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    // Remove previous OTP
    await Otp.deleteMany({
      email: normalizedEmail,
    });

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save OTP
    await Otp.create({
      email: normalizedEmail,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),

      tempUser: {
        name,
        password: hashedPassword,
      },
    });

    // Send OTP
    await sendEmail({
      to: normalizedEmail,
      subject: "EventMind - Signup Verification OTP",
      html: `
        <h2>Welcome to EventMind</h2>

        <p>Your OTP for account verification is:</p>

        <h1>${otp}</h1>

        <p>This OTP is valid for 5 minutes.</p>
      `,
      text: `Your EventMind signup verification OTP is ${otp}. It is valid for 5 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// VERIFY SIGNUP OTP
// ======================================================
export const verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const otpDoc = await Otp.findOne({
      email: normalizedEmail,
    });

    if (!otpDoc) {
      return res.status(404).json({
        success: false,
        message: "OTP not found.",
      });
    }

    if (otpDoc.expiresAt < new Date()) {
      await otpDoc.deleteOne();

      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    if (otpDoc.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    const user = await User.create({
      name: otpDoc.tempUser.name,
      email: normalizedEmail,
      password: otpDoc.tempUser.password,
      emailVerified: true,
    });

    await otpDoc.deleteOne();

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Signup completed successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// LOGIN
// ======================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================================
// GET CURRENT USER
// ======================================================
export const getMe = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};