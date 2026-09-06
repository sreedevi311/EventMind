import {
    FaEnvelope,
    FaSignOutAlt,
    FaUserShield,
    FaUserCircle,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

const ProfileDropdown = ({ close }) => {

    const { user, logout } = useAuth();

    const handleLogout = () => {

        close();

        logout();

    };

    return (

        <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50">

            <div
                className="h-24"
                style={{
                    background: "var(--gradient-primary)"
                }}
            />

            <div className="px-6 pb-6">

                <div className="-mt-12 flex justify-center">

                    <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center">

                        <FaUserCircle
                            className="text-7xl"
                            style={{
                                color: "var(--primary)"
                            }}
                        />

                    </div>

                </div>

                <div className="text-center mt-4">

                    <h2 className="text-xl font-bold">

                        {user?.name}

                    </h2>

                    <p className="text-gray-500">

                        {user?.email}

                    </p>

                </div>

                <div className="mt-8 space-y-5">

                    {/*<div className="flex items-center gap-4">

                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                            style={{
                                background: "var(--gradient-primary)"
                            }}
                        >

                            <FaEnvelope />

                        </div>

                        <div>

                            <p className="text-xs text-gray-400">

                                Email

                            </p>

                            <p className="font-medium">

                                {user?.email}

                            </p>

                        </div>

                    </div>*/}

                    <div className="flex items-center gap-4">

                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                            style={{
                                background: "var(--gradient-primary)"
                            }}
                        >

                            <FaUserShield />

                        </div>

                        <div>

                            <p className="text-xs text-gray-400">

                                Role

                            </p>

                            <p className="font-medium">

                                {user?.role}

                            </p>

                        </div>

                    </div>

                </div>

                <button

                    onClick={handleLogout}

                    className="btn-primary w-full mt-8 flex justify-center items-center gap-3"

                >

                    <FaSignOutAlt />

                    Logout

                </button>

            </div>

        </div>

    );

};

export default ProfileDropdown;