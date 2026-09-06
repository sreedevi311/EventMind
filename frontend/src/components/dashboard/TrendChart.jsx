import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

import { FaChartLine } from "react-icons/fa";

const TrendChart = ({ data }) => {

    return (

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

            <div className="flex items-center gap-3 mb-6">

                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">

                    <FaChartLine className="text-blue-600"/>

                </div>

                <div>

                    <h2 className="text-xl font-semibold">

                        Registration Trends

                    </h2>

                    <p className="text-gray-500 text-sm">

                        Daily registrations

                    </p>

                </div>

            </div>

            <ResponsiveContainer

                width="100%"

                height={320}

            >

                <LineChart

                    data={data}

                    margin={{
                        top:20,
                        right:20,
                        left:0,
                        bottom:0
                    }}

                >

                    <CartesianGrid
                        strokeDasharray="4 4"
                    />

                    <XAxis
                        dataKey="date"
                    />

                    <YAxis
                        allowDecimals={false}
                    />

                    <Tooltip/>

                    <Line

                        type="monotone"

                        dataKey="registrations"

                        stroke="#2563EB"

                        strokeWidth={3}

                        dot={{
                            r:5
                        }}

                        activeDot={{
                            r:8
                        }}

                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );

};

export default TrendChart;