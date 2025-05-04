
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateRangeGroupBySelector = ({
  groupBy,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  handleGroupByChange,
}) => {
  return (
    <div className="flex items-center gap-6 mb-4">
      {/* Date Range Selection */}
      <div className="flex items-center gap-4">
        <span className="font-semibold">Date Range:</span>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="yyyy-MM-dd"
          className="border p-2 rounded"
          placeholderText="Start Date"
        />
        <span>-</span>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="yyyy-MM-dd"
          className="border p-2 rounded"
          placeholderText="End Date"
        />
      </div>

      {/* Group By Dropdown */}
      <div>
        <select
          value={groupBy}
          onChange={(e) => handleGroupByChange(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
    </div>
  );
};

export default DateRangeGroupBySelector;
