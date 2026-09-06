import { FaUserCircle } from "react-icons/fa";

const badgeColor = (status) => {

    switch (status) {

        case "CHECKED_IN":
            return "bg-green-100 text-green-700";

        case "REGISTERED":
            return "bg-blue-100 text-blue-700";

        case "CONFIRMED":
            return "bg-purple-100 text-purple-700";

        case "CANCELLED":
            return "bg-red-100 text-red-700";

        default:
            return "bg-gray-100 text-gray-700";

    }

};

const getResponse = (responses, key) => {

    const field = responses.find(r => r.key === key);

    return field?.value || "-";

};

const RecentRegistrationsTable = ({ registrations }) => {

    return (

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-xl font-semibold">

                        Recent Registrations

                    </h2>

                    <p className="text-gray-500">

                        Latest attendees

                    </p>

                </div>

            </div>

            <div className="overflow-x-auto">

                <table className="w-full">

                    <thead>

                        <tr className="border-b">

                            <th className="text-left py-4">

                                User

                            </th>

                            <th>

                                Registration ID

                            </th>

                            <th>

                                Source

                            </th>

                            <th>

                                Status

                            </th>

                            <th>

                                Registered

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            registrations.map((registration)=>(

                                <tr

                                    key={registration._id}

                                    className="border-b hover:bg-gray-50"

                                >

                                    <td className="py-5">

                                        <div className="flex items-center gap-3">

                                            <FaUserCircle

                                                className="text-4xl text-blue-500"

                                            />

                                            <div>

                                                <p className="font-semibold">

                                                    {registration.userId?.name}

                                                </p>

                                                <p className="text-gray-500 text-sm">

                                                    {registration.userId?.email}

                                                </p>

                                            </div>

                                        </div>

                                    </td>

                                    <td className="text-center">

                                        {registration.registrationId}

                                    </td>

                                    <td className="text-center">

                                        {registration.registrationSource}

                                    </td>

                                    <td className="text-center">

                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor(registration.registrationStatus)}`}
                                        >

                                            {registration.registrationStatus}

                                        </span>

                                    </td>

                                    <td className="text-center">

                                        {

                                            new Date(

                                                registration.createdAt

                                            ).toLocaleDateString()

                                        }

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

};

export default RecentRegistrationsTable;