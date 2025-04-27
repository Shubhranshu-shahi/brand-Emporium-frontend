import React from "react";

const SummaryCards = ({ summary }) => {
  const { totalRevenue, totalCost, profit } = summary;

  const Card = ({ label, value, color }) => (
    <div
      className={`bg-white p-4 rounded-xl shadow w-full border-l-4 ${color}`}
    >
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-gray-900">
        ₹{value.toLocaleString()}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      <Card
        label="Total Revenue"
        value={totalRevenue}
        color="border-green-500"
      />
      <Card label="Total Cost" value={totalCost} color="border-red-500" />
      <Card label="Profit" value={profit} color="border-blue-500" />
    </div>
  );
};

export default SummaryCards;
