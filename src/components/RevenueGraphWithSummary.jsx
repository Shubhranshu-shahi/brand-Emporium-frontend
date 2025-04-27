import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
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
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { getAllInvoice } from "../assets/helper/invoiceApi";
import { format, parseISO } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function RevenueGraphWithSummary() {
  const [view, setView] = useState("monthly");
  const [invoiceData, setInvoiceData] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const getInvoices = async () => {
      const res = await getAllInvoice();
      setInvoiceData(res || []);
    };
    getInvoices();
  }, []);

  const aggregateData = () => {
    const group = {};

    invoiceData.forEach((invoice) => {
      const date = format(
        parseISO(invoice.customerAndInvoice.invoiceDate),
        {
          daily: "yyyy-MM-dd",
          monthly: "yyyy-MM",
          yearly: "yyyy",
        }[view]
      );

      if (!group[date]) {
        group[date] = { revenue: 0, cost: 0 };
      }

      invoice.rows.forEach((item) => {
        group[date].revenue += parseFloat(item.sellingPrice || 0);
        group[date].cost += parseFloat(item.purchasedWithQty || 0);
      });
    });

    return Object.entries(group)
      .map(([label, values]) => ({ label, ...values }))
      .sort((a, b) => new Date(a.label) - new Date(b.label));
  };

  const chartData = aggregateData();

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalCost = chartData.reduce((sum, d) => sum + d.cost, 0);
  const profit = totalRevenue - totalCost;

  const data = {
    labels: chartData.map((d) => d.label),
    datasets: [
      {
        label: "Revenue",
        data: chartData.map((d) => d.revenue),
        borderColor: "#10B981",
        backgroundColor: "#10B98166",
        fill: false,
        tension: 0.4,
      },
      {
        label: "Cost",
        data: chartData.map((d) => d.cost),
        borderColor: "#EF4444",
        backgroundColor: "#EF444466",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Revenue vs Cost (${view})`,
      },
    },
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      {showSummary && (
        <motion.div
          layout
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 overflow-hidden"
        >
          <motion.div
            layout
            className="bg-green-100 text-green-700 p-4 rounded-2xl shadow-md text-center"
          >
            <div className="text-xl font-bold">
              ₹ {totalRevenue.toLocaleString("en-IN")}
            </div>
            <div className="text-sm">Total Revenue</div>
          </motion.div>
          <motion.div
            layout
            className="bg-red-100 text-red-700 p-4 rounded-2xl shadow-md text-center"
          >
            <div className="text-xl font-bold">
              ₹ {totalCost.toLocaleString("en-IN")}
            </div>
            <div className="text-sm">Total Cost</div>
          </motion.div>
          <motion.div
            layout
            className="bg-blue-100 text-blue-700 p-4 rounded-2xl shadow-md text-center"
          >
            <div className="text-xl font-bold">
              ₹ {profit.toLocaleString("en-IN")}
            </div>
            <div className="text-sm">Profit</div>
          </motion.div>
        </motion.div>
      )}

      {/* Toggle Summary Button */}
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

      {/* View Toggle Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { label: "Daily", value: "daily" },
          { label: "Monthly", value: "monthly" },
          { label: "Yearly", value: "yearly" },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setView(value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold shadow transition-all duration-200 ${
              view === value
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-4 rounded-xl shadow-lg"
      >
        <div className="w-full overflow-x-auto">
          <div className="w-full">
            <Line key={view} data={data} options={options} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
