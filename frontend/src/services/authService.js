import api from "../api/api";

export const signup = (data) =>
    api.post("/auth/signup", data);

export const login = (data) =>
    api.post("/auth/login", data);

export const getProfile = () =>
    api.get("/auth/profile");

export const verifySignupOTP = (data) =>
    api.post("/auth/verify-signup-otp", data);

export const getMe = () => api.get("/auth/me");