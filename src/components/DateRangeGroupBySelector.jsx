import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DateRangeGroupBySelector = ({
  groupBy,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  handleGroupByChange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile filter button */}
      <div className="flex justify-end md:hidden mb-4">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border rounded text-sm font-medium shadow hover:bg-gray-200 transition"
        >
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end"
          >
            <div className="w-80 bg-white h-full shadow-lg p-4 relative">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-medium text-sm mb-1 block">
                    Start Date
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    dateFormat="yyyy-MM-dd"
                    className="border px-3 py-2 rounded w-full text-sm"
                    placeholderText="Start Date"
                  />
                </div>
                <div>
                  <label className="font-medium text-sm mb-1 block">
                    End Date
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    dateFormat="yyyy-MM-dd"
                    className="border px-3 py-2 rounded w-full text-sm"
                    placeholderText="End Date"
                  />
                </div>
                <div>
                  <label className="font-medium text-sm mb-1 block">
                    Group By
                  </label>
                  <select
                    value={groupBy}
                    onChange={(e) => handleGroupByChange(e.target.value)}
                    className="border px-3 py-2 rounded w-full text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop view */}
      <div className="hidden md:flex md:items-center md:justify-between gap-6 mb-4">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm">Date Range:</span>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="yyyy-MM-dd"
            className="border px-3 py-2 rounded text-sm"
            placeholderText="Start Date"
          />
          <span className="text-gray-500">–</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="yyyy-MM-dd"
            className="border px-3 py-2 rounded text-sm"
            placeholderText="End Date"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-semibold text-sm">Group By:</label>
          <select
            value={groupBy}
            onChange={(e) => handleGroupByChange(e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default DateRangeGroupBySelector;
