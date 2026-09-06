import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaBuilding,
  FaCalendarCheck,
  FaSpinner,
} from "react-icons/fa";

const VenueDetailsModal = ({
  venues,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
  onBook,
  isBooking,
}) => {
  if (
    !venues ||
    venues.length === 0 ||
    currentIndex < 0
  ) {
    return null;
  }

  const venue = venues[currentIndex];

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        backdrop-blur-md
        p-4
      "
      onClick={onClose}
    >
      {/* Main Modal */}

      <div
        className="
          relative
          w-full
          max-w-3xl
          max-h-[90vh]
          overflow-y-auto
          bg-white
          rounded-3xl
          shadow-2xl
          p-8
        "
        onClick={(e) => e.stopPropagation()}
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
            hover:bg-gray-200
            flex
            items-center
            justify-center
            text-gray-600
            transition
          "
        >
          <FaTimes />
        </button>

        {/* Previous */}

        {venues.length > 1 && (
          <button
            onClick={onPrevious}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              w-11
              h-11
              rounded-full
              bg-indigo-100
              text-indigo-600
              hover:bg-indigo-600
              hover:text-white
              flex
              items-center
              justify-center
              transition
              z-10
            "
          >
            <FaChevronLeft />
          </button>
        )}

        {/* Content */}

        <div className="px-8 md:px-12">
          {/* Header */}

          <div className="mb-7">
            <div className="flex items-center gap-3 mb-2">
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
                <FaBuilding />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {venue.name}
                </h2>

                <p className="text-gray-500">
                  {venue.venueType || "Venue"}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              <FaCheckCircle />
              Available
            </span>
          </div>

          {/* Details */}

          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-indigo-500" />

                <div>
                  <p className="text-xs text-gray-400">
                    Location
                  </p>

                  <p className="font-semibold text-gray-800">
                    {venue.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <FaUsers className="text-indigo-500" />

                <div>
                  <p className="text-xs text-gray-400">
                    Capacity
                  </p>

                  <p className="font-semibold text-gray-800">
                    {venue.capacity} people
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Facilities */}

          <div className="mt-7">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Facilities
            </h3>

            <div className="flex flex-wrap gap-3">
              {(venue.facilities || []).map(
                (facility, index) => (
                  <div
                    key={index}
                    className="
                      flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      bg-indigo-50
                      text-indigo-700
                      rounded-xl
                      text-sm
                    "
                  >
                    <FaCheckCircle />
                    {facility}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Notes */}

          {venue.notes && (
            <div className="mt-7">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Additional Information
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {venue.notes}
              </p>
            </div>
          )}

          {/* Booking */}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => onBook(venue)}
              disabled={isBooking}
              className="
                w-full
                bg-indigo-600
                hover:bg-indigo-700
                disabled:bg-indigo-300
                text-white
                py-3.5
                rounded-xl
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                transition
              "
            >
              {isBooking ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Booking Venue...
                </>
              ) : (
                <>
                  <FaCalendarCheck />
                  Book This Venue
                </>
              )}
            </button>
          </div>
        </div>

        {/* Next */}

        {venues.length > 1 && (
          <button
            onClick={onNext}
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              w-11
              h-11
              rounded-full
              bg-indigo-100
              text-indigo-600
              hover:bg-indigo-600
              hover:text-white
              flex
              items-center
              justify-center
              transition
              z-10
            "
          >
            <FaChevronRight />
          </button>
        )}

        {/* Counter */}

        {venues.length > 1 && (
          <div className="text-center mt-5 text-xs text-gray-400">
            {currentIndex + 1} of {venues.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueDetailsModal;