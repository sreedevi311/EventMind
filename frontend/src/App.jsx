import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifySignupOTP from "./pages/VerifySignupOTP";

import Dashboard from "./pages/Dashboard";
import AIRegistration from "./pages/AIRegistration";
import CheckIn from "./pages/CheckIn";

import VenueAgentPage from "./pages/VenueAgentPage";
import SpeakerAgentPage from "./pages/SpeakerAgentPage";

import SponsorshipAgentPage from "./pages/SponsorshipAgentPage";
import IncidentAgentPage from "./pages/IncidentAgentPage";
import IncidentAdminPage from "./pages/IncidentAdminPage";

import EventIntelligence from "./pages/EventIntelligence";
import AgentOrchestrator from "./pages/AgentOrchestrator";

import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>

                <Toaster position="top-right" />

                <Routes>

                    {/* Protected User Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<AIRegistration />} />

                        <Route
                            path="venue-agent"
                            element={<VenueAgentPage />}
                        />

                        <Route
                            path="speaker-agent"
                            element={<SpeakerAgentPage />}
                        />

                        <Route
                            path="sponsorship-agent"
                            element={<SponsorshipAgentPage />}
                        />

                        <Route
                            path="incident-agent"
                            element={<IncidentAgentPage />}
                        />

                        {/* NEW */}
                        <Route
                            path="event-intelligence"
                            element={<EventIntelligence />}
                        />

                        {/* NEW */}
                        <Route
                            path="agent-orchestrator"
                            element={<AgentOrchestrator />}
                        />
                    </Route>

                    {/* Authentication */}
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/signup"
                        element={<Signup />}
                    />

                    <Route
                        path="/verify-signup-otp"
                        element={<VerifySignupOTP />}
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requiredRole="ADMIN">
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            index
                            element={<Dashboard />}
                        />

                        <Route
                            path="checkin"
                            element={<CheckIn />}
                        />

                        <Route
                            path="incidents"
                            element={<IncidentAdminPage />}
                        />
                    </Route>

                </Routes>

            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;