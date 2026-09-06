import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaBriefcase,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

const SpeakerDetailsModal = ({
  speakers,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
  onAssign,
  isAssigning,
}) => {
  if (
    !speakers ||
    currentIndex < 0 ||
    !speakers[currentIndex]
  ) {
    return null;
  }

  const speaker =
    speakers[currentIndex];

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/50
        backdrop-blur-md
        flex
        items-center
        justify-center
        p-4
      "
    >
      {/* Previous */}
      <button
        onClick={onPrevious}
        className="
          absolute
          left-4
          lg:left-10
          w-12
          h-12
          rounded-full
          bg-white
          shadow-lg
          flex
          items-center
          justify-center
          text-gray-700
          hover:bg-gray-100
          z-10
        "
      >
        <FaChevronLeft />
      </button>

      {/* Modal */}
      <div
        className="
          relative
          bg-white
          rounded-3xl
          shadow-2xl
          w-full
          max-w-2xl
          max-h-[90vh]
          overflow-y-auto
        "
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="
            absolute
            right-5
            top-5
            w-10
            h-10
            rounded-full
            bg-gray-100
            flex
            items-center
            justify-center
            text-gray-600
            hover:bg-gray-200
            z-10
          "
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-indigo-50 to-white">
          <div className="flex items-start gap-5">
            <div
              className="
                w-24
                h-24
                rounded-3xl
                bg-indigo-600
                text-white
                flex
                items-center
                justify-center
                text-4xl
                font-bold
                flex-shrink-0
              "
            >
              {speaker.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div className="pr-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {speaker.name}
              </h2>

              <p className="text-indigo-600 font-medium mt-1">
                {speaker.designation ||
                  "Speaker"}
              </p>

              {speaker.organization && (
                <p className="text-gray-500 mt-1">
                  {speaker.organization}
                </p>
              )}

              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    speaker.status ===
                    "Available"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  <FaCheckCircle />
                  {speaker.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-8 space-y-6">
          {/* Bio */}
          {speaker.bio && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                About
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {speaker.bio}
              </p>
            </div>
          )}

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">
              Contact
            </h3>

            <div className="space-y-2">
              {speaker.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <FaEnvelope className="text-indigo-500" />
                  {speaker.email}
                </div>
              )}

              {speaker.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <FaPhone className="text-indigo-500" />
                  {speaker.phone}
                </div>
              )}
            </div>
          </div>

          {/* Expertise */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">
              Expertise
            </h3>

            <div className="flex flex-wrap gap-2">
              {(speaker.expertise || []).map(
                (item, index) => (
                  <span
                    key={index}
                    className="
                      px-3
                      py-2
                      rounded-xl
                      bg-indigo-50
                      text-indigo-700
                      text-sm
                    "
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Topics */}
          {speaker.topics?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">
                Topics
              </h3>

              <div className="flex flex-wrap gap-2">
                {speaker.topics.map(
                  (topic, index) => (
                    <span
                      key={index}
                      className="
                        px-3
                        py-2
                        rounded-xl
                        bg-gray-100
                        text-gray-700
                        text-sm
                      "
                    >
                      {topic}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Session preferences */}
          {speaker.sessionPreferences
            ?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">
                Session Preferences
              </h3>

              <div className="flex flex-wrap gap-2">
                {speaker.sessionPreferences.map(
                  (item, index) => (
                    <span
                      key={index}
                      className="
                        px-3
                        py-2
                        rounded-xl
                        bg-purple-50
                        text-purple-700
                        text-sm
                      "
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Availability */}
          {speaker.availability?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">
                Availability
              </h3>

              <div className="space-y-2">
                {speaker.availability
                  .slice(0, 5)
                  .map((slot, index) => (
                    <div
                      key={index}
                      className="
                        p-3
                        rounded-xl
                        bg-gray-50
                        text-sm
                        text-gray-600
                      "
                    >
                      <span className="font-medium">
                        {new Date(
                          slot.date
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </span>

                      {" • "}

                      {slot.startTime} -{" "}
                      {slot.endTime}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Assign */}
          <button
            onClick={() => onAssign(speaker)}
            disabled={
              isAssigning ||
              speaker.status !== "Available"
            }
            className="
              w-full
              mt-4
              py-3
              rounded-2xl
              bg-indigo-600
              hover:bg-indigo-700
              disabled:bg-indigo-300
              text-white
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              transition
            "
          >
            {isAssigning ? (
              <>
                <FaSpinner className="animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Speaker"
            )}
          </button>
        </div>
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        className="
          absolute
          right-4
          lg:right-10
          w-12
          h-12
          rounded-full
          bg-white
          shadow-lg
          flex
          items-center
          justify-center
          text-gray-700
          hover:bg-gray-100
          z-10
        "
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default SpeakerDetailsModal;