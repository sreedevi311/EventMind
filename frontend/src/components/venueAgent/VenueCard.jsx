import {
  FaUsers,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

const VenueCard = ({ venue, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="
        min-w-[300px]
        max-w-[300px]
        bg-white
        border border-gray-200
        rounded-2xl
        p-5
        shadow-sm
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-200
        cursor-pointer
        group
      "
    >
      {/* Header */}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {venue.name}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {venue.venueType || "Venue"}
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          Available
        </span>
      </div>

      {/* Location */}

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <FaMapMarkerAlt className="text-indigo-500" />
        <span>{venue.location}</span>
      </div>

      {/* Capacity */}

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <FaUsers className="text-indigo-500" />
        <span>
          Capacity: <b>{venue.capacity}</b>
        </span>
      </div>

      {/* Facilities */}

      <div className="flex flex-wrap gap-2 mb-5">
        {(venue.facilities || [])
          .slice(0, 3)
          .map((facility, index) => (
            <span
              key={index}
              className="
                flex
                items-center
                gap-1
                text-xs
                px-2.5
                py-1
                bg-indigo-50
                text-indigo-700
                rounded-full
              "
            >
              <FaCheckCircle className="text-[10px]" />
              {facility}
            </span>
          ))}

        {venue.facilities?.length > 3 && (
          <span className="text-xs px-2.5 py-1 bg-gray-100 rounded-full">
            +{venue.facilities.length - 3} more
          </span>
        )}
      </div>

      {/* View */}

      <div
        className="
          flex
          items-center
          justify-between
          text-sm
          font-semibold
          text-indigo-600
          group-hover:text-indigo-700
        "
      >
        View Details
        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

export default VenueCard;