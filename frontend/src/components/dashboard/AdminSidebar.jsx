import { NavLink } from "react-router-dom";

import {
    FaChartPie,
    FaQrcode,
    FaExclamationTriangle
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

const AdminSidebar = () => {

    const { logout } = useAuth();

    const menu = [
        {
            name: "Dashboard",
            icon: <FaChartPie />,
            path: "/admin"
        },
        {
            name: "Check-In",
            icon: <FaQrcode />,
            path: "/admin/checkin"
        },
        {
            name: "Incidents",
            icon: <FaExclamationTriangle />,
            path: "/admin/incidents"
        }
    ];

    return (
        <aside className="w-72 bg-white shadow-xl border-r border-gray-100 flex flex-col">
            <div className="p-8">
                <h1
                    className="text-3xl font-bold"
                    style={{ color: "var(--primary)" }}
                >
                    EventMind
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Intelligent Event Management
                </p>
            </div>

            <nav className="flex-1 px-4">
                {menu.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-5 py-4 rounded-2xl mb-3 transition-all duration-300 ${
                                isActive
                                    ? "bg-blue-500 text-white shadow-lg"
                                    : "text-gray-600 hover:bg-blue-50"
                            }`
                        }
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <button
                type="button"
                onClick={logout}
                className="mx-4 mb-6 px-5 py-4 text-left text-gray-600 rounded-2xl hover:bg-blue-50"
            >
                Logout
            </button>
        </aside>
    );
};

export default AdminSidebar;
