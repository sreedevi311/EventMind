import IncidentCard from "./IncidentCard";

const IncidentList = ({ incidents }) => {
  if (!incidents?.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        No incidents found.
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-5">
      {incidents.map((incident) => (
        <IncidentCard
          key={incident._id}
          incident={incident}
        />
      ))}
    </div>
  );
};

export default IncidentList;