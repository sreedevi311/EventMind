import { useState } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaChalkboardTeacher,
  FaSpinner,
} from "react-icons/fa";

const SpeakerAssignmentModal = ({
  speaker,
  onClose,
  onAssign,
  isAssigning,
}) => {
  const [form, setForm] = useState({
    title: "",
    startTime: "",
    endTime: "",
    expectedAttendance: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.startTime ||
      !form.endTime ||
      !form.expectedAttendance
    ) {
      return;
    }

    onAssign({
      title: form.title.trim(),
      startTime: new Date(
        form.startTime
      ).toISOString(),
      endTime: new Date(
        form.endTime
      ).toISOString(),
      expectedAttendance: Number(
        form.expectedAttendance
      ),
    });
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/50
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
      "
    >

      <div
        className="
          bg-white
          rounded-3xl
          shadow-2xl
          w-full
          max-w-lg
          overflow-hidden
        "
      >

        {/* HEADER */}

        <div
          className="
            bg-indigo-600
            text-white
            px-6
            py-5
            flex
            items-center
            justify-between
          "
        >

          <div>
            <h2 className="text-xl font-bold">
              Assign Speaker
            </h2>

            <p className="text-indigo-100 text-sm mt-1">
              Schedule {speaker.name}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isAssigning}
            className="
              w-9
              h-9
              rounded-full
              hover:bg-white/20
              flex
              items-center
              justify-center
            "
          >
            <FaTimes />
          </button>

        </div>

        {/* SPEAKER */}

        <div className="px-6 pt-5">

          <div
            className="
              bg-indigo-50
              rounded-2xl
              p-4
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-indigo-100
                text-indigo-600
                flex
                items-center
                justify-center
              "
            >
              <FaChalkboardTeacher />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                {speaker.name}
              </h3>

              <p className="text-sm text-gray-500">
                {speaker.designation ||
                  speaker.organization ||
                  "Speaker"}
              </p>
            </div>

          </div>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >

          {/* SESSION TITLE */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Session Title
            </label>

            <div className="relative mt-1">

              <FaChalkboardTeacher
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Introduction to AI"
                className="
                  input
                  w-full
                  pl-11
                "
                disabled={isAssigning}
              />

            </div>
          </div>

          {/* START TIME */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Start Time
            </label>

            <div className="relative mt-1">

              <FaCalendarAlt
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="datetime-local"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="
                  input
                  w-full
                  pl-11
                "
                disabled={isAssigning}
              />

            </div>
          </div>

          {/* END TIME */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              End Time
            </label>

            <div className="relative mt-1">

              <FaClock
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="
                  input
                  w-full
                  pl-11
                "
                disabled={isAssigning}
              />

            </div>
          </div>

          {/* ATTENDANCE */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Expected Attendance
            </label>

            <div className="relative mt-1">

              <FaUsers
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="number"
                name="expectedAttendance"
                value={
                  form.expectedAttendance
                }
                onChange={handleChange}
                placeholder="e.g. 100"
                min="1"
                className="
                  input
                  w-full
                  pl-11
                "
                disabled={isAssigning}
              />

            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              disabled={isAssigning}
              className="
                flex-1
                py-3
                rounded-xl
                border
                border-gray-200
                text-gray-700
                hover:bg-gray-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isAssigning ||
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
                font-medium
                flex
                items-center
                justify-center
                gap-2
              "
            >

              {isAssigning ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Assigning...
                </>
              ) : (
                "Confirm Assignment"
              )}

            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default SpeakerAssignmentModal;