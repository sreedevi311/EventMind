import { useMemo, useState } from "react";

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";

import { FaUserGraduate } from "react-icons/fa";

const COLORS = [
    "#2563EB",
    "#60A5FA",
    "#1D4ED8",
    "#3B82F6",
    "#93C5FD",
    "#0EA5E9",
    "#0284C7",
    "#38BDF8",
    "#2563EB"
];

const DemographicsChart = ({ data = {} }) => {

    const [selected, setSelected] = useState("department");

    const chartData = useMemo(() => {

        const values = data[selected] || {};

        return Object.entries(values).map(([name, value]) => ({
            name,
            value
        }));

    }, [data, selected]);

    return (

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

            <div className="flex justify-between items-center mb-6">

                <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">

                        <FaUserGraduate className="text-blue-600"/>

                    </div>

                    <div>

                        <h2 className="text-xl font-semibold">

                            Demographics

                        </h2>

                        <p className="text-gray-500 text-sm">

                            Registration Distribution

                        </p>

                    </div>

                </div>

                <select

                    value={selected}

                    onChange={(e)=>setSelected(e.target.value)}

                    className="input w-40"

                >

                    <option value="department">

                        Department

                    </option>

                    <option value="year">

                        Year

                    </option>

                    <option value="college">

                        College

                    </option>

                </select>

            </div>

            {

                chartData.length === 0 ?

                (

                    <div className="h-[330px] flex items-center justify-center text-gray-400">

                        No data available

                    </div>

                )

                :

                (

                    <ResponsiveContainer
                        width="100%"
                        height={330}
                    >

                        <PieChart>

                            <Pie

                                data={chartData}

                                dataKey="value"

                                nameKey="name"

                                outerRadius={110}

                                label

                            >

                                {

                                    chartData.map((entry,index)=>(

                                        <Cell

                                            key={index}

                                            fill={COLORS[index % COLORS.length]}

                                        />

                                    ))

                                }

                            </Pie>

                            <Tooltip/>

                            <Legend/>

                        </PieChart>

                    </ResponsiveContainer>

                )

            }

        </div>

    );

};

export default DemographicsChart;