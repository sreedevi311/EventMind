import {
  FaBuilding,
  FaMoneyBillWave,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";

const SponsorCarousel = ({
  sponsors,
  onSelect,
}) => {
  return (
    <div className="mt-4">

      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Sponsors
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-3">

        {sponsors.map((sponsor) => (
          <button
            key={sponsor._id}
            onClick={() => onSelect(sponsor)}
            className="
              min-w-[280px]
              bg-white
              border border-gray-200
              rounded-2xl
              p-5
              text-left
              hover:border-indigo-300
              hover:shadow-md
              transition
            "
          >

            <div className="flex items-start justify-between">

              <div>
                <h4 className="font-bold text-gray-900">
                  {sponsor.name}
                </h4>

                <p className="text-xs text-gray-500 mt-1">
                  {sponsor.organization}
                </p>
              </div>

              <span
                className="
                  px-2 py-1
                  rounded-lg
                  text-xs
                  font-semibold
                  bg-indigo-100
                  text-indigo-700
                "
              >
                {sponsor.package}
              </span>

            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">

              <div>
                <p className="text-xs text-gray-400">
                  Pending
                </p>

                <p className="font-semibold text-gray-800">
                  ₹{Number(
                    sponsor.pendingAmount || 0
                  ).toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Deliverables
                </p>

                <p className="font-semibold text-gray-800">
                  {sponsor.deliverables?.filter(
                    (item) =>
                      item.status !== "Completed"
                  ).length || 0}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-4 mt-5 text-xs text-gray-500">

              <span className="flex items-center gap-1">
                <FaUsers />
                {sponsor.attendeeInteractions || 0}
              </span>

              <span className="flex items-center gap-1">
                <FaChartLine />
                {sponsor.leadsGenerated || 0} leads
              </span>

              <span className="flex items-center gap-1">
                <FaMoneyBillWave />
                {sponsor.conversionRate || 0}%
              </span>

            </div>

          </button>
        ))}

      </div>
    </div>
  );
};

export default SponsorCarousel;