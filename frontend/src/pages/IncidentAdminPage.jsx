import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaExclamationTriangle,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

import {
  getAllIncidents,
  updateIncidentStatus,
} from "../services/incidentAgentService";

const statuses = [
  "Reported",
  "Investigating",
  "Resolved",
  "Closed",
];

const IncidentAdminPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const [resolutionNotes, setResolutionNotes] =
    useState({});

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const res = await getAllIncidents();

      setIncidents(
        res.data?.incidents ||
        res.data?.data ||
        []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load incidents."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    incident,
    status
  ) => {
    if (updating === incident._id) return;

    if (
      (status === "Resolved" ||
        status === "Closed") &&
      !resolutionNotes[incident._id]?.trim()
    ) {
      toast.error(
        "Please enter resolution notes."
      );
      return;
    }

    setUpdating(incident._id);

    try {
      const res =
        await updateIncidentStatus(
          incident._id,
          {
            status,
            resolutionNotes:
              resolutionNotes[
                incident._id
              ] || "",
          }
        );

      const updatedIncident =
        res.data?.incident;

      setIncidents((prev) =>
        prev.map((item) =>
          item._id === incident._id
            ? updatedIncident
            : item
        )
      );

      toast.success(
        `Incident marked as ${status}.`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update incident."
      );
    } finally {
      setUpdating(null);
    }
  };

  const getSeverityClass = (severity) => {
    if (severity === "Critical")
      return "bg-red-100 text-red-700";

    if (severity === "High")
      return "bg-orange-100 text-orange-700";

    if (severity === "Medium")
      return "bg-yellow-100 text-yellow-700";

    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <FaSpinner className="animate-spin text-2xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Incident Management
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Monitor and manage event incidents.
        </p>
      </div>

      {/* Incidents */}

      {incidents.length === 0 ? (
        <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
          No incidents found.
        </div>
      ) : (
        <div className="space-y-4">

          {incidents.map((incident) => (
            <div
              key={incident._id}
              className="
                bg-white
                border border-gray-200
                rounded-2xl
                p-5
                shadow-sm
              "
            >

              {/* Top */}

              <div className="flex justify-between gap-4">

                <div className="flex gap-3">

                  <div className="
                    w-10 h-10
                    rounded-xl
                    bg-red-50
                    text-red-600
                    flex items-center
                    justify-center
                    flex-shrink-0
                  ">
                    <FaExclamationTriangle />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      {incident.title}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {incident.description}
                    </p>
                  </div>

                </div>

                <span
                  className={`
                    h-fit px-3 py-1
                    rounded-full
                    text-xs font-semibold
                    ${getSeverityClass(
                      incident.severity
                    )}
                  `}
                >
                  {incident.severity}
                </span>

              </div>

              {/* Details */}

              <div className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-4
                mt-5
                text-sm
              ">

                <div>
                  <p className="text-gray-400">
                    Category
                  </p>
                  <p className="font-semibold">
                    {incident.category}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">
                    Priority
                  </p>
                  <p className="font-semibold">
                    {incident.priority}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">
                    Affected Area
                  </p>
                  <p className="font-semibold">
                    {incident.affectedArea}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">
                    Responsible Team
                  </p>
                  <p className="font-semibold">
                    {incident.responsibleTeam}
                  </p>
                </div>

              </div>

              {/* Recommended Action */}

              <div className="
                mt-5
                bg-indigo-50
                border border-indigo-100
                rounded-xl
                p-4
              ">
                <p className="
                  text-xs
                  font-semibold
                  text-indigo-600
                  mb-1
                ">
                  RECOMMENDED ACTION
                </p>

                <p className="text-sm text-gray-700">
                  {incident.recommendedAction}
                </p>
              </div>

              {/* Workflow */}

              <div className="
                mt-5
                flex
                flex-col
                md:flex-row
                md:items-end
                gap-4
              ">

                <div className="flex-1">

                  <label className="
                    block
                    text-sm
                    font-semibold
                    mb-2
                  ">
                    Resolution Notes
                  </label>

                  <input
                    value={
                      resolutionNotes[
                        incident._id
                      ] ??
                      (incident.resolutionNotes ||
                        "")
                    }
                    onChange={(e) =>
                      setResolutionNotes(
                        (prev) => ({
                          ...prev,
                          [incident._id]:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="Enter resolution details..."
                    className="
                      input
                      w-full
                    "
                    disabled={
                      incident.status ===
                      "Closed"
                    }
                  />

                </div>

                <div>

                  <label className="
                    block
                    text-sm
                    font-semibold
                    mb-2
                  ">
                    Status
                  </label>

                  <select
                    value={incident.status}
                    disabled={
                      updating ===
                      incident._id
                    }
                    onChange={(e) =>
                      handleStatusChange(
                        incident,
                        e.target.value
                      )
                    }
                    className="
                      input
                      min-w-[180px]
                    "
                  >
                    {statuses.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>

                </div>

              </div>

              {/* Resolved info */}

              {incident.resolvedAt && (
                <div className="
                  mt-4
                  flex items-center gap-2
                  text-sm text-green-600
                ">
                  <FaCheckCircle />

                  Resolved on{" "}
                  {new Date(
                    incident.resolvedAt
                  ).toLocaleString()}
                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default IncidentAdminPage;