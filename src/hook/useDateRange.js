import { useState, useEffect } from "react";

export const useDateRange = () => {
  const [groupBy, setGroupBy] = useState("daily");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const today = new Date();
    let newStart, newEnd;

    if (groupBy === "daily") {
      // Entire current month
      newStart = new Date(today.getFullYear(), today.getMonth(), 1);
      newEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (groupBy === "monthly") {
      // Whole current year
      newStart = new Date(today.getFullYear(), 0, 1);
      newEnd = new Date(today.getFullYear(), 11, 31);
    } else if (groupBy === "yearly") {
      // From current year to next 10 years
      newStart = new Date(today.getFullYear(), 0, 1);
      newEnd = new Date(today.getFullYear() + 9, 11, 31);
    }

    setStartDate(newStart);
    setEndDate(newEnd);
  }, [groupBy]);

  const handleGroupByChange = (value) => {
    setGroupBy(value);
  };

  return {
    groupBy,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleGroupByChange,
  };
};
