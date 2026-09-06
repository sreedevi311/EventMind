import { useEffect, useState } from "react";
import {
  FaTimes,
  FaClock,
  FaUsers,
  FaBuilding,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";

const VenueBookingModal = ({
  venue,
  bookingData,
  onClose,
  onConfirm,
  isBooking,
}) => {
  const [form, setForm] = useState({
    title: "",
    startTime: "",
    endTime: "",
    expectedAttendance: "",
  });

  const formatDateTimeLocal = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const offset =
      date.getTimezoneOffset() * 60000;

    return new Date(
      date.getTime() - offset
    )
      .toISOString()
      .slice(0, 16);
  };

  useEffect(() => {
    if (!bookingData) return;

    setForm({
      title: bookingData.title || "",

      startTime: formatDateTimeLocal(
        bookingData.startTime
      ),

      endTime: formatDateTimeLocal(
        bookingData.endTime
      ),

      expectedAttendance:
        bookingData.expectedAttendance || "",
    });
  }, [bookingData]);

  const handleSubmit = () => {
    if (!form.title.trim()) {
      return;
    }

    if (!form.startTime || !form.endTime) {
      return;
    }

    if (!form.expectedAttendance) {
      return;
    }

    const startDate = new Date(form.startTime);
    const endDate = new Date(form.endTime);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return;
    }

    if (startDate >= endDate) {
      return;
    }

    onConfirm({
      ...bookingData,

      title: form.title.trim(),

      startTime: startDate.toISOString(),

      endTime: endDate.toISOString(),

      expectedAttendance:
        Number(form.expectedAttendance),
    });
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/50 backdrop-blur-sm
        flex items-center justify-center
        p-4
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white
          w-full max-w-lg
          rounded-3xl
          shadow-2xl
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}

        <div
          className="
            flex items-center justify-between
            px-6 py-5
            border-b
          "
        >
          <div className="flex items-center gap-3">

            <div
              className="
                w-11 h-11
                rounded-xl
                bg-indigo-100
                text-indigo-600
                flex items-center justify-center
              "
            >
              <FaBuilding />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Book Venue
              </h2>

              <p className="text-sm text-gray-500">
                Review booking details
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            disabled={isBooking}
            className="
              w-9 h-9
              rounded-full
              hover:bg-gray-100
              flex items-center justify-center
              text-gray-500
            "
          >
            <FaTimes />
          </button>
        </div>

        {/* VENUE */}

        <div className="px-6 pt-5">

          <div
            className="
              bg-indigo-50
              rounded-2xl
              p-4
              border border-indigo-100
            "
          >
            <p className="text-xs text-indigo-500 font-semibold">
              VENUE
            </p>

            <p className="text-lg font-bold text-gray-900">
              {venue?.name}
            </p>

            {venue?.location && (
              <p className="text-sm text-gray-500 mt-1">
                {venue.location}
              </p>
            )}

            {venue?.capacity && (
              <p className="text-sm text-gray-500 mt-1">
                Capacity: {venue.capacity}
              </p>
            )}
          </div>

        </div>

        {/* FORM */}

        <div className="p-6 space-y-5">

          {/* TITLE */}

          <div>
            <label className="block text-sm font-semibold mb-2">
              Booking / Session Title
            </label>

            <input
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              disabled={isBooking}
              className="input w-full"
              placeholder="e.g. AI Workshop"
            />
          </div>

          {/* TIME */}

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-semibold mb-2">
                <FaClock className="inline mr-1" />
                Start Time
              </label>

              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) =>
                  setForm({
                    ...form,
                    startTime: e.target.value,
                  })
                }
                disabled={isBooking}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                <FaClock className="inline mr-1" />
                End Time
              </label>

              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) =>
                  setForm({
                    ...form,
                    endTime: e.target.value,
                  })
                }
                disabled={isBooking}
                className="input w-full"
              />
            </div>

          </div>

          {/* ATTENDANCE */}

          <div>
            <label className="block text-sm font-semibold mb-2">
              <FaUsers className="inline mr-1" />
              Expected Attendance
            </label>

            <input
              type="number"
              min="1"
              value={form.expectedAttendance}
              onChange={(e) =>
                setForm({
                  ...form,
                  expectedAttendance:
                    e.target.value,
                })
              }
              disabled={isBooking}
              className="input w-full"
              placeholder="Expected attendees"
            />
          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 pt-2">

            <button
              onClick={onClose}
              disabled={isBooking}
              className="
                flex-1
                py-3
                rounded-xl
                border border-gray-200
                hover:bg-gray-50
                font-semibold
              "
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={
                isBooking ||
                !form.title.trim() ||
                !form.startTime ||
                !form.endTime ||
                !form.expectedAttendance
              }
              className="
                flex-1
                py-3
                rounded-xl
                bg-indigo-600
                hover:bg-indigo-700
                disabled:bg-indigo-300
                text-white
                font-semibold
                flex items-center
                justify-center
                gap-2
              "
            >
              {isBooking ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <FaCheck />
                  Confirm Booking
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default VenueBookingModal;