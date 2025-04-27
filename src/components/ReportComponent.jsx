import React, { useState, useEffect, useRef } from "react";
import "../assets/css/test.css";

import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { getAllInvoice, invoiceDelete } from "../assets/helper/InvoiceApi";
import { dateToString } from "../assets/helper/Helpers";
import { handleSuccess } from "../assets/helper/utils";
import { useNavigate } from "react-router-dom";
import ReportGST from "./ReportGST";

const columnHelper = createColumnHelper();

function ReportComponent() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const tableRef = useRef(null);
  const exportRef = useRef(null);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllInvoice();

        const formatted = response.map((entry, index) => ({
          "#": index + 1,
          customerName: entry.customerAndInvoice?.customerName,
          phone: entry.customerAndInvoice?.phone,
          invoiceNumber: entry.customerAndInvoice?.invoiceNumber,
          invoiceDate: new Date(entry.customerAndInvoice?.invoiceDate),
          total: parseFloat(entry.totalDetails?.total).toFixed(2),
          roundOff: parseFloat(entry.totalDetails?.roundOff).toFixed(2),
          receive: parseFloat(entry.totalDetails?.receive).toFixed(2),
          remaining: parseFloat(entry.totalDetails?.remaining).toFixed(2),
          _id: entry._id,
          billedBy: entry.customerAndInvoice?.billedBy,
          updatedBy: entry.customerAndInvoice?.updatedBy,
          type: entry.totalDetails?.type,
          rows: entry.rows,
          GSTType: entry.customerAndInvoice?.GSTType,
        }));
        setData(formatted);
        setFilteredData(formatted);
      } catch (error) {
        console.error("Error fetching invoice data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) => {
        const date = new Date(item.invoiceDate);
        return (
          (!startDate || date >= startDate) && (!endDate || date <= endDate)
        );
      });
      setFilteredData(filtered);
    }
  }, [startDate, endDate, data]);

  const isAdmin =
    localStorage.getItem("loggedInUser") === "shubh" ||
    localStorage.getItem("loggedInUser") === "admin" ||
    localStorage.getItem("loggedInUser") === "Admin";

  const baseColumns = [
    columnHelper.accessor("#", { header: "#" }),
    columnHelper.accessor("customerName", { header: "Customer Name" }),
    columnHelper.accessor("phone", { header: "Phone" }),
    columnHelper.accessor("invoiceNumber", { header: "Invoice No." }),
    columnHelper.accessor("invoiceDate", {
      header: "Invoice Date",
      cell: (info) => dateToString(info.getValue()),
    }),
    columnHelper.accessor("total", { header: "Total" }),
    columnHelper.accessor("roundOff", { header: "Round Off" }),
    columnHelper.accessor("receive", { header: "Received" }),
    columnHelper.accessor("remaining", {
      header: "Remaining",
      cell: (info) => (
        <span className={info.getValue() > 0 ? "text-red-500" : ""}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("type", { header: "Type" }),
    columnHelper.accessor("GSTType", { header: "GST/Non-GST" }),
  ];

  const adminColumns = [
    columnHelper.accessor("billedBy", { header: "Billed By" }),
    columnHelper.accessor("updatedBy", { header: "Updated By" }),
  ];

  const actionColumn = columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const rowData = row.original;
      return (
        <div className="flex gap-3">
          <button
            onClick={() =>
              window.open(`/invoice/${rowData.invoiceNumber}`, "_blank")
            }
            className="text-blue-600 hover:underline"
          >
            View
          </button>
          <button
            onClick={() => handleUpdate(rowData)}
            className="text-blue-600 hover:underline"
            title="Edit"
          >
            Edit
          </button>
          <button
            onClick={async () => {
              setDeletingId(rowData._id);
              setTimeout(async () => {
                await invoiceDelete(rowData._id);
                setFilteredData((prev) =>
                  prev.filter((item) => item._id !== rowData._id)
                );
                setData((prev) =>
                  prev.filter((item) => item._id !== rowData._id)
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
      );
    },
  });

  const columns = isAdmin
    ? [...baseColumns, ...adminColumns, actionColumn]
    : [...baseColumns, actionColumn];

  const handleUpdate = (row) => {
    navigate(`/edit-invoice/${row.invoiceNumber}`);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 5 },
    },
  });

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });
    doc.text("Invoice Report", 40, 30);

    const headers = [
      [
        "#",
        "Customer Name",
        "Phone",
        "Invoice No.",
        "Invoice Date",
        "Total",
        "Round Off",
        "Received",
        "Remaining",
        "type",
      ],
    ];

    const body = data.map((item) => [
      item["#"],
      item.customerName,
      item.phone,
      item.invoiceNumber,
      dateToString(item.invoiceDate),
      item.total,
      item.roundOff,
      item.receive,
      item.remaining,
      item.type,
    ]);

    autoTable(doc, {
      head: headers,
      body,
      startY: 40,
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [40, 40, 40] },
      tableWidth: "wrap",
      margin: { top: 40, left: 30, right: 30 },
    });

    doc.save("invoice-report.pdf");
  };

  return (
    <div className="p-4 space-y-4 max-w-full rounded-2xl shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "Total Invoices",
            value: data.length,
            color: "text-gray-700",
          },
          {
            title: "Filtered Invoices",
            value: filteredData.length,
            color: "text-gray-700",
          },
          {
            title: "Total Received",
            value: `₹${filteredData
              .reduce((sum, item) => sum + (parseFloat(item.receive) || 0), 0)
              .toFixed(2)}`,
            color: "text-green-600",
          },
          {
            title: "Total Remaining",
            value: `₹${filteredData
              .reduce((sum, item) => sum + (parseFloat(item.remaining) || 0), 0)
              .toFixed(2)}`,
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
      {/* <Search className="absolute left-3 top-2.5 text-gray-400" size={18} /> */}
      <div className="flex flex-wrap gap-4 items-center rounded-2xl p-4 shadow-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 pr-4 py-2 sm:w-full w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <DatePicker
            placeholderText="Start Date"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            className="px-3 py-2 border sm:w-full w-full rounded-md"
          />
          <span className="text-gray-500">to</span>
          <DatePicker
            placeholderText="End Date"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            className="px-3 py-2 border sm:w-full w-full rounded-md"
          />
        </div>
        {/* <DownloadTableExcel
          filename="Invoices"
          sheet="Invoices"
          currentTableRef={exportRef.current}
        >
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
            Export Excel
          </button>
        </DownloadTableExcel> */}

        <ReportGST invoices={filteredData} flag={0} title={"Export Report"} />

        <button
          onClick={handleExportPDF}
          className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Export PDF
        </button>
        <ReportGST
          invoices={filteredData}
          flag={1}
          title={"Export GST Report"}
        />
      </div>
      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table
          ref={tableRef}
          className="w-full  text-sm text-left border border-gray-200 shadow-md rounded-lg overflow-hidden transition-all duration-300"
        >
          <thead className="bg-gray-100 text-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3 font-semibold">
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? "cursor-pointer select-none flex items-center"
                          : "",
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <ArrowUpDown className="ml-2 text-gray-400" size={14} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className={`hover:bg-indigo-50 transition-colors border-t ${
                    deletingId === row.original._id
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 text-sm text-gray-600">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {/* Hidden table for Excel export */}
      <table ref={exportRef} className="hidden">
        <thead>
          <tr>
            <th>#</th>
            <th>Customer Name</th>
            <th>Phone</th>
            <th>Invoice No.</th>
            <th>Invoice Date</th>
            <th>Total</th>
            <th>Round Off</th>
            <th>Received</th>
            <th>Remaining</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item._id}>
              <td>{item["#"]}</td>
              <td>{item.customerName}</td>
              <td>{item.phone}</td>
              <td>{item.invoiceNumber}</td>
              <td>{dateToString(item.invoiceDate)}</td>
              <td>{item.total}</td>
              <td>{item.roundOff}</td>
              <td>{item.receive}</td>
              <td>{item.remaining}</td>
              <td>{item.type}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 bg-gray-200 rounded disabled:opacity-50"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 bg-gray-200 rounded disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span>
            Page{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 bg-gray-200 rounded disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 bg-gray-200 rounded disabled:opacity-50"
          >
            <ChevronsRight size={18} />
          </button>
        </div>

        <div>
          <span>Go to page: </span>
          <input
            type="number"
            min={1}
            max={table.getPageCount()}
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = Number(e.target.value) - 1;
              if (!isNaN(page)) {
                table.setPageIndex(page);
              }
            }}
            className="border px-2 py-1 w-16 rounded"
          />
        </div>
      </div>
    </div>
  );
}

export default ReportComponent;
