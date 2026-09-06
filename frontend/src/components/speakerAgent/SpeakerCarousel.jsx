import {
  FaStar,
  FaBriefcase,
} from "react-icons/fa";

const SpeakerCarousel = ({
  speakers,
  onSelect,
}) => {
  return (
    <div className="mt-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">
        Recommended Speakers
      </p>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {speakers.map((speaker) => (
          <button
            key={speaker._id}
            onClick={() =>
              onSelect(speaker)
            }
            className="
              flex-shrink-0
              w-72
              text-left
              bg-white
              border
              border-gray-200
              rounded-2xl
              p-5
              hover:border-indigo-400
              hover:shadow-md
              transition
            "
          >
            {/* Avatar */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-indigo-100
                  text-indigo-600
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-lg
                "
              >
                {speaker.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate">
                  {speaker.name}
                </h3>

                <p className="text-xs text-gray-500 truncate">
                  {speaker.designation ||
                    "Speaker"}
                </p>
              </div>
            </div>

            {/* Organization */}
            {speaker.organization && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <FaBriefcase className="text-indigo-500" />

                <span className="truncate">
                  {speaker.organization}
                </span>
              </div>
            )}

            {/* Expertise */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(speaker.expertise || [])
                .slice(0, 3)
                .map((item, index) => (
                  <span
                    key={index}
                    className="
                      px-2
                      py-1
                      text-xs
                      rounded-full
                      bg-indigo-50
                      text-indigo-600
                    "
                  >
                    {item}
                  </span>
                ))}
            </div>

            {/* Match */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Match score
              </span>

              <span className="font-semibold text-indigo-600">
                {speaker.matchScore || 0}
              </span>
            </div>

            <div className="mt-3 text-xs text-indigo-600 font-medium">
              View complete profile →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeakerCarousel;