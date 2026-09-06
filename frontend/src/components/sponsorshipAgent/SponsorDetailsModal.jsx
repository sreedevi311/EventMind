import {
  FaTimes,
  FaBuilding,
  FaMoneyBillWave,
  FaBullhorn,
  FaStore,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";

const SponsorDetailsModal = ({
  sponsor,
  onClose,
}) => {
  if (!sponsor) return null;

  const currency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/50
        backdrop-blur-sm
        flex items-center justify-center
        p-4
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white
          w-full max-w-2xl
          max-h-[90vh]
          overflow-y-auto
          rounded-3xl
          shadow-2xl
        "
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="flex justify-between items-start p-6 border-b">

          <div className="flex gap-3">

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
                {sponsor.name}
              </h2>

              <p className="text-sm text-gray-500">
                {sponsor.organization}
              </p>

              <span
                className="
                  inline-block
                  mt-2
                  px-3 py-1
                  rounded-lg
                  bg-indigo-100
                  text-indigo-700
                  text-xs
                  font-semibold
                "
              >
                {sponsor.package} Sponsor
              </span>
            </div>

          </div>

          <button
            onClick={onClose}
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

        <div className="p-6 space-y-6">

          {/* PAYMENT */}

          <section>

            <h3 className="font-bold text-gray-900 mb-3">
              <FaMoneyBillWave className="inline mr-2 text-indigo-500" />
              Payment
            </h3>

            <div className="grid grid-cols-3 gap-3">

              <Stat
                label="Total"
                value={currency(
                  sponsor.totalAmount
                )}
              />

              <Stat
                label="Paid"
                value={currency(
                  sponsor.paidAmount
                )}
              />

              <Stat
                label="Pending"
                value={currency(
                  sponsor.pendingAmount
                )}
              />

            </div>

          </section>

          {/* DELIVERABLES */}

          <section>

            <h3 className="font-bold text-gray-900 mb-3">
              <FaBullhorn className="inline mr-2 text-indigo-500" />
              Deliverables
            </h3>

            <div className="space-y-2">

              {sponsor.deliverables?.map(
                (item, index) => (
                  <div
                    key={index}
                    className="
                      flex items-center justify-between
                      p-3
                      bg-gray-50
                      rounded-xl
                    "
                  >
                    <span className="text-sm">
                      {item.name}
                    </span>

                    <span
                      className={`
                        px-2 py-1
                        rounded-lg
                        text-xs
                        font-semibold
                        ${
                          item.status ===
                          "Completed"
                            ? "bg-green-100 text-green-700"
                            : item.status ===
                              "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {item.status}
                    </span>
                  </div>
                )
              )}

            </div>

          </section>

          {/* BRANDING + BOOTH */}

          <div className="grid grid-cols-2 gap-4">

            <InfoCard
              icon={<FaBullhorn />}
              title="Branding"
              value={
                sponsor.brandingCompleted
                  ? "Completed"
                  : "Pending"
              }
            />

            <InfoCard
              icon={<FaStore />}
              title="Booth"
              value={
                sponsor.boothAllocated
                  ? sponsor.boothNumber ||
                    "Allocated"
                  : "Not Allocated"
              }
            />

          </div>

          {/* PERFORMANCE */}

          <section>

            <h3 className="font-bold text-gray-900 mb-3">
              <FaChartLine className="inline mr-2 text-indigo-500" />
              Performance
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              <Stat
                label="Booth Visits"
                value={
                  sponsor.boothVisits || 0
                }
              />

              <Stat
                label="Interactions"
                value={
                  sponsor.attendeeInteractions ||
                  0
                }
              />

              <Stat
                label="Leads"
                value={
                  sponsor.leadsGenerated || 0
                }
              />

              <Stat
                label="Conversion"
                value={`${sponsor.conversionRate || 0}%`}
              />

              <Stat
                label="Sessions"
                value={
                  sponsor.sessionParticipation ||
                  0
                }
              />

              <Stat
                label="Promotional Activity"
                value={
                  sponsor.promotionalActivity ||
                  0
                }
              />

              <Stat
                label="Social Engagement"
                value={
                  sponsor.socialMediaEngagement ||
                  0
                }
              />

              <Stat
                label="Satisfaction"
                value={
                  sponsor.satisfactionScore || 0
                }
              />

            </div>

          </section>

          {/* STATUS */}

          <div
            className="
              p-4
              rounded-2xl
              bg-gray-50
              text-sm
            "
          >
            <strong>Status:</strong>{" "}
            {sponsor.status}
          </div>

        </div>
      </div>
    </div>
  );
};

const Stat = ({
  label,
  value,
}) => (
  <div
    className="
      bg-gray-50
      rounded-xl
      p-3
    "
  >
    <p className="text-xs text-gray-400">
      {label}
    </p>

    <p className="font-bold text-gray-800 mt-1">
      {value}
    </p>
  </div>
);

const InfoCard = ({
  icon,
  title,
  value,
}) => (
  <div
    className="
      p-4
      bg-gray-50
      rounded-2xl
    "
  >
    <div className="flex items-center gap-2 text-indigo-500 mb-2">
      {icon}
      <span className="text-sm font-semibold text-gray-700">
        {title}
      </span>
    </div>

    <p className="font-bold text-gray-900">
      {value}
    </p>
  </div>
);

export default SponsorDetailsModal;