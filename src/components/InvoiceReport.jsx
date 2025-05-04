import React, { useState, useEffect } from "react";
import axios from "axios";
import ExcelJS from "exceljs";
import { base_url } from "../assets/api/BASEURL";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchReport,
  invoiceDelete,
  invoiceExport,
  invoiceStats,
} from "../assets/api/InvoiceApi";
import { currentDate, dateToString } from "../assets/api/Helpers";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const InvoiceReport = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  const [summary, setSummary] = useState({
    totalInvoices: 0,
    filteredCount: 0,
    filteredTotalReceived: 0,
  });

  const [deletingId, setDeletingId] = useState(null);

  const fetchInvoiceStats = async (filters) => {
    setIsLoading(true);

    try {
      let params = {
        ...filters,
      };
      const response = await invoiceStats(params);
      // console.log(response);
      setSummary((prev) => ({
        ...prev,
        totalInvoices: response.totalInvoices,
        filteredCount: response.filteredCount,
        filteredTotalReceived: response.filteredTotalReceived,
        filteredTotalRemaining: response.filteredTotalRemaining,
      }));
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data with pagination and filters
  const fetchData = async () => {
    setIsLoading(true);

    try {
      let params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filters,
      };
      const response = await fetchReport(params);

      setData(response.invoices);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Export to Excel using ExcelJS
  const handleExport = async (gstType, type = "") => {
    setIsLoading(true);

    try {
      let params = {
        gstType,
        ...filters,
      };
      const response = await invoiceExport(params);

      const csvText = await response.text();
      const cleanedCsvText = preprocessCsvData(csvText);
      if (gstType === "GST" && type === "excel")
        await convertCsvToExcel(
          cleanedCsvText,
          `GST_Report_${currentDate()}.xlsx`
        );
      if (gstType === "both" && type === "excel")
        await convertCsvToExcel(
          cleanedCsvText,
          `All_Report_${currentDate()}.xlsx`
        );
      if (gstType === "both" && type === "pdf") {
        convertCsvToPdf(
          cleanedCsvText,
          `invoices_Reports_${currentDate()}.pdf`
        );
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error exporting invoice data to Excel:", error);
      setIsLoading(false);
    }
  };

  const convertCsvToExcel = async (csvString, fileName = "invoices.xlsx") => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Invoices");

    const lines = csvString.split("\n").filter((line) => line.trim() !== "");
    const headers = lines[0].split(",");
    worksheet.addRow(headers);

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",");
      worksheet.addRow(row);
    }

    // Style header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      };
    });

    // Auto column widths
    worksheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
  };

  const preprocessCsvData = (csvString) => {
    const lines = csvString.trim().split("\n");
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));

    const rows = lines.slice(1).map((line) => {
      const cells = line.split(",").map((cell, i) => {
        const cleanCell = cell.trim().replace(/^"|"$/g, "");
        if (
          headers[i].toLowerCase().includes("date") &&
          /^\d{4}-\d{2}-\d{2}T/.test(cleanCell)
        ) {
          return dateToString(cleanCell);
        }
        return cleanCell;
      });
      return cells.join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  };

  const convertCsvToPdf = (csvString, fileName = "invoices.pdf") => {
    const doc = new jsPDF("landscape");

    const lines = csvString.trim().split("\n");
    const headers = lines[0].split(",");
    const rows = lines.slice(1).map((line) => line.split(","));

    doc.setFontSize(16);
    doc.text("Invoices Report", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: rows,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak", // allows long text to wrap
      },
      headStyles: {
        fillColor: [22, 160, 133],
      },
      margin: { top: 20 },
      theme: "striped",
    });

    doc.save(fileName);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //handle to update invoice
  const handleUpdate = (row) => {
    navigate(`/edit-invoice/${row.customerAndInvoice.invoiceNumber}`);
  };

  // Fetch data on filter change
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([fetchData(), fetchInvoiceStats(filters)]);
      setIsLoading(false);
    };
    fetchAll();
  }, [filters, pagination.page, pagination.pageSize]);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "Total Invoices",
            value: summary.totalInvoices,
            color: "text-gray-700",
          },
          {
            title: "Filtered Invoices",
            value: summary.filteredCount,
            color: "text-gray-700",
          },
          {
            title: "Total Received",
            value: `₹${summary.filteredTotalReceived}`,
            color: "text-green-600",
          },
          {
            title: "Total Remaining",
            value: `₹${summary.filteredTotalRemaining}`,
            color: "text-red-500",
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white shadow rounded-2xl p-4 text-center border"
          >
            <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
            <p className={`text-lg font-semibold ${card.color}`}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          name="search"
          placeholder="Search by customer or invoice number..."
          value={filters.search}
          onChange={handleFilterChange}
          className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="sm:w-40 w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="sm:w-40 w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => handleExport("GST", "excel")}
          disabled={isLoading}
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition"
        >
          {isLoading ? "Exporting..." : "Export GST Reports"}
        </button>
        <button
          onClick={() => handleExport("both", "excel")}
          disabled={isLoading}
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition"
        >
          {isLoading ? "Exporting..." : "Export Reports"}
        </button>
        <button
          onClick={() => handleExport("both", "pdf")}
          disabled={isLoading}
          className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition"
        >
          {isLoading ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && <div>Loading...</div>}

      {/* Table for displaying invoices */}
      <div className="w-full overflow-x-auto rounded-lg border">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-600">
              <th className="px-4 py-2 text-left font-semibold">
                Invoice Number
              </th>
              <th className="px-4 py-2 text-left font-semibold">Name</th>
              <th className="px-4 py-2 text-left font-semibold">Phone</th>

              <th className="px-4 py-2 text-left font-semibold">Date</th>
              <th className="px-4 py-2 text-left font-semibold">Total</th>
              <th className="px-4 py-2 text-left font-semibold">Round Off</th>
              <th className="px-4 py-2 text-left font-semibold">Received</th>
              <th className="px-4 py-2 text-left font-semibold">Remaining</th>
              <th className="px-4 py-2 text-left font-semibold">Type</th>
              <th className="px-4 py-2 text-left font-semibold">GST/Non-GST</th>
              <th className="px-4 py-2 text-left font-semibold">billed By</th>
              <th className="px-4 py-2 text-left font-semibold">Updated By</th>
              <th className="px-4 py-2 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {data.map((invoice) => (
                <motion.tr
                  key={invoice.customerAndInvoice.invoiceNumber}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className={`hover:bg-indigo-50 duration-200 transition-colors border-t ${
                    deletingId === invoice._id
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  <td className="px-4 py-2 border-t text-sm text-gray-800">
                    {invoice.customerAndInvoice.invoiceNumber}
                  </td>
                  <td className="px-4 py-2 border-t text-sm text-gray-800">
                    {invoice.customerAndInvoice.customerName}
                  </td>
                  <td className="px-4 py-2 border-t text-sm text-gray-800">
                    {invoice.customerAndInvoice.phone}
                  </td>

                  <td className="px-4 py-2 border-t text-sm text-gray-800">
                    {new Date(
                      invoice.customerAndInvoice.invoiceDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border-t text-sm text-gray-800">
                    {invoice.totalDetails.total}
                  </td>
                  <td className="px-4 py-2 border-t text-sm text-gray-800">
                    {invoice.totalDetails.roundOff}
                  </td>
                  <td className="px-4 py-2 border-t text-sm text-gray-800">
                    {invoice.totalDetails.receive}
                  </td>
                  <td
                    className={`px-4 py-2 border-t text-sm ${
                      invoice.totalDetails.remaining > 0
                        ? "text-red-500"
                        : "text-gray-800"
                    }`}
                  >
                    {invoice.totalDetails.remaining}
                  </td>
                  <td className="px-4 py-2 border-t text-sm text-gray-800">
                    {invoice.totalDetails.type}
                  </td>
                  <td className="px-4 py-2 border-t text-sm text-gray-800">
                    {invoice.customerAndInvoice.GSTType}
                  </td>
                  <td className="px-4 py-2 border-t text-sm text-gray-800">
                    {invoice.customerAndInvoice.billedBy}
                  </td>
                  <td className="px-4 py-2 border-t text-sm text-gray-800">
                    {invoice.customerAndInvoice.updatedBy}
                  </td>

                  <td className="px-4 py-2 border-t text-sm text-gray-800">
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          window.open(
                            `/invoice/${invoice.customerAndInvoice.invoiceNumber}`,
                            "_blank"
                          )
                        }
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleUpdate(invoice)}
                        className="text-blue-600 hover:underline"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          setDeletingId(invoice._id);
                          setTimeout(async () => {
                            await invoiceDelete(invoice._id);
                            setData((prev) =>
                              prev.filter((item) => item._id !== invoice._id)
                            );

                            setDeletingId(null);
                          }, 300);
                          handleSuccess("Invoice Deleted");
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-600">
        {/* Rows per page */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <span>Rows per page:</span>
          <select
            value={pagination.pageSize}
            onChange={(e) => {
              setPagination({
                ...pagination,
                pageSize: e.target.value,
              });
            }}
            className="border rounded px-2 py-1 w-full sm:w-auto"
          >
            {[5, 10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Pagination buttons */}
        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
            disabled={pagination.page === 1}
            className="p-1 bg-gray-200 rounded disabled:opacity-50"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page === 1}
            className="p-1 bg-gray-200 rounded disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span>
            Page <strong>{pagination.page}</strong>
          </span>
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={pagination.page * pagination.pageSize >= pagination.total}
            className="p-1 bg-gray-200 rounded disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.ceil(pagination.total / pagination.pageSize),
              }))
            }
            disabled={pagination.page * pagination.pageSize >= pagination.total}
            className="p-1 bg-gray-200 rounded disabled:opacity-50"
          >
            <ChevronsRight size={18} />
          </button>
        </div>

        {/* Go to page */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <span>Go to page:</span>
          <input
            type="number"
            min={1}
            max={Math.ceil(pagination.total / pagination.pageSize)}
            value={pagination.page}
            onChange={(e) => {
              const value = e.target.value;
              const page = Number(value);

              if (value === "") {
                setPagination((prev) => ({ ...prev, page: "" }));
                return;
              }

              if (
                !isNaN(page) &&
                page >= 1 &&
                page <= Math.ceil(pagination.total / pagination.pageSize)
              ) {
                setPagination((prev) => ({ ...prev, page }));
              }
            }}
            onBlur={(e) => {
              if (e.target.value === "") {
                setPagination((prev) => ({ ...prev, page: 1 }));
              }
            }}
            className="border px-2 py-1 w-full sm:w-16 rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceReport;
