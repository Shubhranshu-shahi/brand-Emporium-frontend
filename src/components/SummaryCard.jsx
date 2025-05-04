const SummaryCard = ({
  label,
  value,
  color = "bg-gradient-to-r from-gray-400 to-gray-600",
}) => {
  return (
    <div
      className={`w-48 p-4 rounded-2xl shadow-md text-white ${color} transform transition duration-300 hover:scale-105`}
    >
      <div className="text-sm font-semibold tracking-wide opacity-90">
        {label}
      </div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
};

export default SummaryCard;
