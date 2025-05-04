// components/RevenueGraphWithSummary.jsx
import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { useDateRange } from "../hook/useDateRange";
import { fetchAggregatedData } from "../assets/api/InvoiceApi";
import DateRangeGroupBySelector from "./DateRangeGroupBySelector";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import SummaryCard from "./SummaryCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueGraphWithSummary = () => {
  const {
    groupBy,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleGroupByChange,
  } = useDateRange();

  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [totals, setTotals] = useState({
    revenue: 0,
    cost: 0,
    profit: 0,
  });

  useEffect(() => {
    if (!startDate || !endDate || !groupBy) return;

    const debounce = setTimeout(() => {
      loadChartData();
    }, 200); // tweak time if needed

    return () => clearTimeout(debounce);
  }, [startDate, endDate, groupBy]);

  const lastPayloadRef = useRef({});

  const loadChartData = async () => {
    if (!startDate || !endDate) return;

    const payload = {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      groupBy,
    };

    // Prevent duplicate API calls for same payload
    const last = lastPayloadRef.current;
    if (
      last.startDate === payload.startDate &&
      last.endDate === payload.endDate &&
      last.groupBy === payload.groupBy
    ) {
      return;
    }

    lastPayloadRef.current = payload;

    setLoading(true);
    try {
      const data = await fetchAggregatedData(payload);
      if (!data || data.length === 0) {
        setChartData(null);
        return;
      }

      setChartData({
        labels: data.map((d) => d._id),
        datasets: [
          {
            label: "Revenue",
            data: data.map((d) => d.totalRevenue),
            borderColor: "green",
            fill: false,
            borderWidth: 2,
            tension: 0.3, // smooth curves
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: "Cost",
            data: data.map((d) => d.totalCost),
            borderColor: "red",
            fill: false,
            borderWidth: 2,
            tension: 0.3, // smooth curves
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: "Profit",
            data: data.map((d) => d.totalProfit),
            borderColor: "blue",
            fill: false,
            borderWidth: 2,
            tension: 0.3, // smooth curves
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      });
      const totalRevenue = data.reduce(
        (acc, item) => acc + item.totalRevenue,
        0
      );
      const totalCost = data.reduce((acc, item) => acc + item.totalCost, 0);
      const totalProfit = data.reduce((acc, item) => acc + item.totalProfit, 0);

      setTotals({
        revenue: totalRevenue,
        cost: totalCost,
        profit: totalProfit,
      });
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    amount.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000, // 1 second animation
      easing: "easeInOutQuart",
    },
    plugins: {
      title: {
        display: true,
        text: "Revenue vs Cost vs Profit",
        font: { size: 18 },
      },
      legend: {
        position: "top",
        labels: {
          font: { size: 12 },
          usePointStyle: true,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          font: { size: 14 },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        title: {
          display: true,
          text: "Amount",
          font: { size: 14 },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6">
      {showSummary && (
        <div className="m-6 flex flex-wrap justify-center gap-6">
          <SummaryCard
            label="Total Revenue"
            value={formatCurrency(totals.revenue)}
            color="bg-green-600"
          />
          <SummaryCard
            label="Total Cost"
            value={formatCurrency(totals.cost)}
            color="bg-red-600"
          />
          <SummaryCard
            label="Total Profit"
            value={formatCurrency(totals.profit)}
            color="bg-blue-600"
          />
        </div>
      )}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowSummary((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-semibold shadow transition-all duration-300"
        >
          <motion.span
            animate={{ rotate: showSummary ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={18} />
          </motion.span>
          {showSummary ? "Hide Summary" : "Show Summary"}
        </button>
      </div>
      <div className="bg-white p-4 rounded shadow mb-4">
        <DateRangeGroupBySelector
          groupBy={groupBy}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          handleGroupByChange={handleGroupByChange}
        />
      </div>

      {loading ? (
        <motion.div
          className="flex justify-center items-center h-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      ) : chartData ? (
        <motion.div
          className="h-[400px] bg-white rounded shadow p-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Line data={chartData} options={options} />
        </motion.div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          No chart data available.
        </div>
      )}
    </div>
  );
};

export default RevenueGraphWithSummary;
