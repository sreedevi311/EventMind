import { useEffect, useRef, useState } from "react";
import {
    FaBell,
    FaChevronDown,
    FaUserCircle,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "../../layouts/ProfileDropdown";

const Topbar = () => {

    const { user } = useAuth();

    const [open, setOpen] = useState(false);

    const dropdownRef = useRef(null);

    useEffect(() => {

        const handler = (e) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
            }

        };

        document.addEventListener("mousedown", handler);

        return () => {

            document.removeEventListener(
                "mousedown",
                handler
            );

        };

    }, []);

    return (

        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">

            <h2
                className="text-2xl font-semibold"
                style={{ color: "var(--heading)" }}
            >
                Dashboard
            </h2>

            <div className="flex items-center gap-6">

                <button className="relative text-xl text-gray-600">

                    <FaBell />

                    <span className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-red-500" />

                </button>

                <div
                    ref={dropdownRef}
                    className="relative"
                >

                    <button

                        onClick={() => setOpen(!open)}

                        className="flex items-center gap-3"

                    >

                        <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                            style={{
                                background: "var(--gradient-primary)"
                            }}
                        >

                            {

                                user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase()

                            }

                        </div>

                        <div className="text-left">

                            <p className="font-semibold">

                                {user?.name}

                            </p>

                            <p className="text-sm text-gray-500">

                                {user?.role}

                            </p>

                        </div>

                        <FaChevronDown
                            className={`transition-transform ${
                                open ? "rotate-180" : ""
                            }`}
                        />

                    </button>

                    {

                        open && (

                            <ProfileDropdown
                                close={() => setOpen(false)}
                            />

                        )

                    }

                </div>

            </div>

        </header>

    );

};

export default Topbar;