function TotalSummaryCard({
  totalAmount,
  roundOff,
  setRoundOff,
  receive,
  setReceive,
  remaining,
  setRemaining,
  type,
  setType,
}) {
  return (
    <div className="w-full flex justify-end">
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
        {/* <h2 className="text-white font-semibold text-lg mb-6 text-left">
          Summary
        </h2> */}

        {/* Row - Total Amount */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <label className="text-white font-medium mb-1 sm:mb-0">
            Total Amount:
          </label>
          <input
            type="number"
            readOnly
            value={totalAmount}
            className="w-full sm:w-40 p-2 border border-gray-600 bg-gray-700 text-white rounded text-right"
          />
        </div>

        {/* Row - Round Off */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <label className="text-white font-medium mb-1 sm:mb-0">
            Round Off:
          </label>
          <input
            type="number"
            value={roundOff}
            onChange={(e) => setRoundOff(e.target.value)}
            className="w-full sm:w-40 p-2 border border-gray-600 bg-gray-700 text-white rounded text-right"
          />
        </div>

        {/* Row - Received */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <label className="text-white font-medium mb-1 sm:mb-0">
            Received:
          </label>
          <input
            type="number"
            value={receive}
            placeholder="0"
            onChange={(e) => {
              setReceive(e.target.value);
              setRemaining(
                parseFloat(roundOff).toFixed(2) -
                  parseFloat(e.target.value || 0).toFixed(2)
              );
            }}
            className="w-full sm:w-40 p-2 border border-gray-600 bg-gray-700 text-white rounded text-right"
          />
        </div>

        {/* Row - Remaining */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <label className="text-white font-medium mb-1 sm:mb-0">
            Remaining:
          </label>
          <input
            type="number"
            readOnly
            value={isNaN(remaining) ? "0" : parseInt(remaining)}
            className="w-full sm:w-40 p-2 border border-gray-600 bg-gray-700 text-white rounded text-right"
          />
        </div>

        {/* Row - Payment Type */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <label className="text-white font-medium mb-1 sm:mb-0">
            Payment Type:
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full sm:w-40 p-2 border border-gray-600 bg-gray-700 text-white rounded text-right"
          >
            {["Cash", "Online", "Card", "UPI", "Other"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default TotalSummaryCard;
