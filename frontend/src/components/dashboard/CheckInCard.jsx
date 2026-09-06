import { FaCheckCircle, FaTimesCircle, FaUserCheck } from "react-icons/fa";
import { motion } from "framer-motion";

const ProgressBar = ({ value }) => (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
        <div
            className="h-full rounded-full bg-blue-600 transition-all duration-700"
            style={{ width: `${value}%` }}
        />
    </div>
);

const Stat = ({ icon, title, value, color }) => (
    <div className="flex items-center justify-between py-3">

        <div className="flex items-center gap-3">

            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: color }}
            >
                {icon}
            </div>

            <span className="text-gray-600">

                {title}

            </span>

        </div>

        <span className="font-bold text-xl">

            {value}

        </span>

    </div>
);

const CheckInCard = ({ data }) => {

    if (!data)
        return null;

    return (

        <motion.div

            whileHover={{ y: -5 }}

            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"

        >

            <h2 className="text-xl font-semibold">

                Check-In Summary

            </h2>

            <p className="text-gray-500 mb-6">

                Live attendance

            </p>

            <Stat

                title="Registered"

                value={data.registered}

                icon={<FaUserCheck />}

                color="#2563EB"

            />

            <Stat

                title="Checked In"

                value={data.checkedIn}

                icon={<FaCheckCircle />}

                color="#16A34A"

            />

            <Stat

                title="Not Checked In"

                value={data.notCheckedIn}

                icon={<FaTimesCircle />}

                color="#DC2626"

            />

            <div className="mt-8">

                <div className="flex justify-between">

                    <span className="font-medium">

                        Attendance

                    </span>

                    <span className="font-bold text-blue-600">

                        {data.attendanceRate}%

                    </span>

                </div>

                <ProgressBar

                    value={data.attendanceRate}

                />

            </div>

        </motion.div>

    );

};

export default CheckInCard;