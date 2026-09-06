import VenueCard from "./VenueCard";

const VenueCarousel = ({ venues, onSelect }) => {
  if (!venues || venues.length === 0) {
    return null;
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">
          Recommended Venues
        </h3>

        <span className="text-xs text-gray-400">
          ← Scroll to explore →
        </span>
      </div>

      <div
        className="
          flex
          gap-4
          overflow-x-auto
          pb-4
          scrollbar-thin
          scrollbar-thumb-gray-300
          scrollbar-track-transparent
        "
      >
        {venues.map((venue) => (
          <VenueCard
            key={venue._id}
            venue={venue}
            onClick={() => onSelect(venue)}
          />
        ))}
      </div>
    </div>
  );
};

export default VenueCarousel;