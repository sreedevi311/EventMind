import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaStar,
  FaChartBar,
} from "react-icons/fa";

const SessionAnalyticsCard = ({
  data,
}) => {
  if (!data) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Session Analytics
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Overview of sessions, attendance and performance
          </p>
        </div>

        <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
          <FaChartBar />
        </div>

      </div>

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <div className="bg-gray-50 rounded-xl p-4">

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FaCalendarAlt />
            Total Sessions
          </div>

          <p className="text-2xl font-bold mt-2">
            {data.totalSessions}
          </p>

        </div>

        <div className="bg-gray-50 rounded-xl p-4">

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FaCheckCircle />
            Completed
          </div>

          <p className="text-2xl font-bold mt-2">
            {data.completedSessions}
          </p>

        </div>

        <div className="bg-gray-50 rounded-xl p-4">

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FaUsers />
            Attendance
          </div>

          <p className="text-2xl font-bold mt-2">
            {data.attendanceRate}%
          </p>

        </div>

        <div className="bg-gray-50 rounded-xl p-4">

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FaStar />
            Avg Rating
          </div>

          <p className="text-2xl font-bold mt-2">
            {data.averageRating || "—"}
          </p>

        </div>

      </div>

      {/* ======================================
          STATUS
      ====================================== */}

      <div className="mb-6">

        <h3 className="font-semibold text-gray-900 mb-3">
          Session Status
        </h3>

        <div className="flex flex-wrap gap-3">

          <div className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm">
            Scheduled:{" "}
            <strong>
              {data.scheduledSessions}
            </strong>
          </div>

          <div className="px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm">
            Completed:{" "}
            <strong>
              {data.completedSessions}
            </strong>
          </div>

          <div className="px-4 py-2 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
            Ongoing:{" "}
            <strong>
              {data.ongoingSessions}
            </strong>
          </div>

          <div className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
            Cancelled:{" "}
            <strong>
              {data.cancelledSessions}
            </strong>
          </div>

        </div>

      </div>

      {/* ======================================
          ATTENDANCE
      ====================================== */}

      <div className="mb-6">

        <div className="flex justify-between items-center mb-2">

          <h3 className="font-semibold text-gray-900">
            Session Attendance
          </h3>

          <span className="text-sm text-gray-500">
            {data.totalActualAttendance} /{" "}
            {data.totalExpectedAttendance}
          </span>

        </div>

        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

          <div
            className="h-full bg-indigo-600 rounded-full transition-all"
            style={{
              width: `${Math.min(
                data.attendanceRate,
                100
              )}%`,
            }}
          />

        </div>

        <p className="text-xs text-gray-500 mt-2">
          Overall attendance rate:{" "}
          {data.attendanceRate}%
        </p>

      </div>

      {/* ======================================
          SESSION TYPES
      ====================================== */}

      {data.sessionTypes?.length > 0 && (
        <div className="mb-6">

          <h3 className="font-semibold text-gray-900 mb-3">
            Session Types
          </h3>

          <div className="flex flex-wrap gap-3">

            {data.sessionTypes.map(
              (item) => (
                <div
                  key={item.type}
                  className="border border-gray-200 rounded-xl px-4 py-3"
                >

                  <p className="text-sm text-gray-500">
                    {item.type}
                  </p>

                  <p className="text-lg font-bold text-gray-900">
                    {item.count}
                  </p>

                </div>
              )
            )}

          </div>

        </div>
      )}

      {/* ======================================
          TOP SESSIONS
      ====================================== */}

      {data.topSessions?.length > 0 && (
        <div>

          <h3 className="font-semibold text-gray-900 mb-3">
            Top Sessions by Attendance
          </h3>

          <div className="space-y-3">

            {data.topSessions.map(
              (session, index) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between border border-gray-100 rounded-xl p-4"
                >

                  <div className="min-w-0">

                    <div className="flex items-center gap-2">

                      <span className="text-xs font-bold text-indigo-600">
                        #{index + 1}
                      </span>

                      <p className="font-medium text-gray-900 truncate">
                        {session.title}
                      </p>

                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {session.sessionType}
                      {" • "}
                      {session.speaker}
                    </p>

                  </div>

                  <div className="text-right ml-4">

                    <p className="font-bold text-gray-900">
                      {session.actualAttendance}
                    </p>

                    <p className="text-xs text-gray-500">
                      attendees
                    </p>

                  </div>

                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default SessionAnalyticsCard;