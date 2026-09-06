import {
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaUsers,
  FaTools,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

const getSeverityStyle = (severity) => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-700";
    case "high":
      return "bg-orange-100 text-orange-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getPriorityStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-700";
    case "high":
      return "bg-orange-100 text-orange-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const IncidentCard = ({ incident }) => {
  const isResolved =
    incident.status?.toLowerCase() === "resolved";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">

      {/* Header */}

      <div className="flex items-start justify-between gap-4">

        <div className="flex items-start gap-3">

          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isResolved
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isResolved ? (
              <FaCheckCircle />
            ) : (
              <FaExclamationTriangle />
            )}
          </div>

          <div>
            <h3 className="font-bold text-gray-900">
              {incident.title}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              {incident.category}
            </p>
          </div>

        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isResolved
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {incident.status}
        </span>

      </div>

      {/* Description */}

      <p className="text-sm text-gray-600 mt-4">
        {incident.description}
      </p>

      {/* Severity / Priority */}

      <div className="flex flex-wrap gap-2 mt-4">

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityStyle(
            incident.severity
          )}`}
        >
          Severity: {incident.severity}
        </span>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityStyle(
            incident.priority
          )}`}
        >
          Priority: {incident.priority}
        </span>

      </div>

      {/* Details */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaMapMarkerAlt className="text-indigo-500" />
          <span>
            <strong>Area:</strong>{" "}
            {incident.affectedArea}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaUsers className="text-indigo-500" />
          <span>
            <strong>Team:</strong>{" "}
            {incident.responsibleTeam}
          </span>
        </div>

      </div>

      {/* Recommended Action */}

      {incident.recommendedAction && (
        <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-xl p-4">

          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 mb-1">
            <FaTools />
            Recommended Action
          </div>

          <p className="text-sm text-gray-700">
            {incident.recommendedAction}
          </p>

        </div>
      )}

      {/* Resolution */}

      {isResolved && incident.resolutionNotes && (
        <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4">

          <div className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-1">
            <FaCheckCircle />
            Resolution
          </div>

          <p className="text-sm text-gray-700">
            {incident.resolutionNotes}
          </p>

        </div>
      )}

      {/* Reported By */}

      {incident.reportedBy && (
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
          <FaClock />
          Reported by {incident.reportedBy}
        </div>
      )}

    </div>
  );
};

export default IncidentCard;