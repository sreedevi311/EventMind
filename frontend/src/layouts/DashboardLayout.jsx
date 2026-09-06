import { Outlet } from "react-router-dom";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

const DashboardLayout = () => {

    return (

        <div className="min-h-screen bg-[#F5F9FF] flex">

            <Sidebar />

            <div className="flex-1 flex flex-col">

                <Topbar />

                <main className="flex-1 p-8 overflow-y-auto">

                    <Outlet />

                </main>

            </div>

        </div>

    );

};

export default DashboardLayout;