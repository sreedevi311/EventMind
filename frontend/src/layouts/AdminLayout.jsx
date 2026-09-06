import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/dashboard/AdminSidebar";
import Topbar from "../components/dashboard/Topbar";

const AdminLayout = () => {

    return (
        <div className="min-h-screen bg-[#F5F9FF] flex">
            <AdminSidebar />

            <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );

};

export default AdminLayout;
