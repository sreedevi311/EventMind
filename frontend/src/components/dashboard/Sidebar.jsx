import { NavLink } from "react-router-dom";

import {
    FaRobot
} from "react-icons/fa";

const Sidebar = () => {

    const menu = [
        {
            name: "Event Intelligence Engine",
            icon: <FaRobot />,
            path: "/event-intelligence"
        },
        {
            name: "Agent Orchestrator",
            icon: <FaRobot />,
            path: "/agent-orchestrator"
        },
        {
            name: "Registration Agent",
            icon: <FaRobot />,
            path: "/"
        },
        {
            name: "Venue Agent",
            icon: <FaRobot />,
            path: "/venue-agent"
        },
        {
            name: "Speaker Agent",
            icon: <FaRobot />,
            path: "/speaker-agent"
        },
        {
            name: "Sponsorship Agent",
            icon: <FaRobot />,
            path: "/sponsorship-agent"
        }
        ,
        {
            name: "Incident Agent",
            icon: <FaRobot />,
            path: "/incident-agent"
        },
        
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

                {

                    menu.map((item) => (

                        <NavLink

                            key={item.path}

                            to={item.path}

                            className={({ isActive }) =>

                                `flex items-center gap-4 px-5 py-4 rounded-2xl mb-3 transition-all duration-300

                                ${

                                    isActive

                                        ? "bg-blue-500 text-white shadow-lg"

                                        : "text-gray-600 hover:bg-blue-50"

                                }

                                `

                            }

                        >

                            <span className="text-lg">

                                {item.icon}

                            </span>

                            <span>

                                {item.name}

                            </span>

                        </NavLink>

                    ))

                }

            </nav>
        </aside>

    );

};

export default Sidebar;