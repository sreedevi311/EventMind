import {
    FaUsers,
    FaUserCheck,
    FaQrcode,
    FaChartLine
} from "react-icons/fa";

import StatCard from "./StatCard";

const OverviewCards = ({ overview }) => {

    if (!overview)
        return null;

    return (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <StatCard

                title="Total Registrations"

                value={overview.totalRegistrations}

                subtitle="All registrations"

                icon={<FaUsers />}

                color="linear-gradient(135deg,#2563EB,#60A5FA)"

            />

            <StatCard

                title="Registered"

                value={overview.registered}

                subtitle="Successfully registered"

                icon={<FaUserCheck />}

                color="linear-gradient(135deg,#16A34A,#4ADE80)"

            />

            <StatCard

                title="Checked In"

                value={overview.checkedIn}

                subtitle="Attendance completed"

                icon={<FaQrcode />}

                color="linear-gradient(135deg,#9333EA,#C084FC)"

            />

            <StatCard

                title="Attendance Rate"

                value={`${overview.attendanceRate}%`}

                subtitle="Current attendance"

                icon={<FaChartLine />}

                color="linear-gradient(135deg,#F59E0B,#FCD34D)"

            />

        </div>

    );

};

export default OverviewCards;