import React, { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Calendar,
  DollarSign,
  Pencil,
  X,
} from "lucide-react";
import {
  fetchInvoicesByInvoiceNumbers,
  invoiceDelete,
} from "../assets/helper/invoiceApi";
import { useNavigate } from "react-router-dom";
import { dateToString } from "../assets/helper/Helpers";

const columnHelper = createColumnHelper();

function PartiesInvoice({ selectedCustomer }) {
  const [fetchedInvoices, setFetchedInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const navigate = useNavigate();
  const fetchInvoicesByNumbers = async (invoiceNumbers) => {
    try {
      setLoading(true);
      const res = await fetchInvoicesByInvoiceNumbers(invoiceNumbers);
      setFetchedInvoices(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setFetchedInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      selectedCustomer &&
      Array.isArray(selectedCustomer.invoiceNumbers) &&
      selectedCustomer.invoiceNumbers.length > 0
    ) {
      fetchInvoicesByNumbers(selectedCustomer.invoiceNumbers);
    } else {
      setFetchedInvoices([]);
    }
  }, [selectedCustomer]);

  const invoiceData = useMemo(() => {
    if (!Array.isArray(fetchedInvoices)) return [];
    return fetchedInvoices.map((inv, idx) => ({
      id: idx + 1,
      _id: inv._id,
      invoiceNumber: inv.customerAndInvoice?.invoiceNumber || "N/A",
      type: inv.totalDetails?.type || "Cash",
      date: dateToString(inv.customerAndInvoice?.invoiceDate),
      total: inv.totalDetails?.roundOff || 0,
      balance: inv.totalDetails?.remaining || 0,
    }));
  }, [fetchedInvoices]);

  const columns = [
    columnHelper.accessor("id", {
      header: () => (
        <span className="flex items-center">
          <FileText className="mr-2" size={16} /> #
        </span>
      ),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("invoiceNumber", {
      header: () => (
        <span className="flex items-center">
          <FileText className="mr-2" size={16} /> Invoice No.
        </span>
      ),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("type", {
      header: () => (
        <span className="flex items-center">
          <FileText className="mr-2" size={16} /> Type
        </span>
      ),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("date", {
      header: () => (
        <span className="flex items-center">
          <Calendar className="mr-2" size={16} /> Date
        </span>
      ),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("total", {
      header: () => (
        <span className="flex items-center">
          <DollarSign className="mr-2" size={16} /> Total
        </span>
      ),
      cell: (info) =>
        `₹${info.getValue().toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}`,
    }),
    columnHelper.accessor("balance", {
      header: () => (
        <span className="flex items-center">
          <DollarSign className="mr-2" size={16} /> Balance
        </span>
      ),
      cell: (info) =>
        `₹${info.getValue().toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}`,
    }),
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              handleUpdate(row.original);
            }}
            className="p-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.original)}
            className="p-1 rounded-lg bg-red-600 hover:bg-red-700 text-white"
            title="Delete"
          >
            <X size={16} />
          </button>
        </div>
      ),
    },
  ];
  const handleUpdate = (row) => {
    navigate(`/edit-invoice/${row.invoiceNumber}`);
  };

  const handleDelete = async (row) => {
    const res = await invoiceDelete(row._id);
    setFetchedInvoices((prev) =>
      prev.filter(
        (inv) => inv.customerAndInvoice.invoiceNumber !== row.invoiceNumber
      )
    );
  };

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: invoiceData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col overflow-x-auto">
      <label className="text-left px-4 py-2 font-semibold text-gray-700">
        Invoices
      </label>

      {/* Search */}
      <div className="mb-4 relative">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search invoices..."
          className="w-3xs pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center text-gray-500 py-6">
          <svg
            className="animate-spin h-5 w-5 mr-2 text-indigo-500"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Fetching invoices...
        </div>
      ) : invoiceData.length > 0 ? (
        <>
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="min-w-full text-sm text-left text-black">
              <thead className="text-xs text-gray-400 uppercase border-b border-gray-600 bg-gray-800 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
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
                          <ArrowUpDown className="ml-2" size={14} />
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      setSelectedRowId(row.id);
                    }}
                    className={`cursor-pointer ${
                      selectedRowId === row.id ? "bg-indigo-100" : ""
                    } hover:bg-indigo-50`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="text-left px-7 py-3 border-b border-gray-200"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">Items per page</span>
              <select
                className="border border-gray-300 rounded-md shadow-sm p-2"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {[5, 10, 20].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft size={20} />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft size={20} />
              </button>

              <span className="flex items-center">
                <input
                  min={1}
                  max={table.getPageCount()}
                  type="number"
                  value={table.getState().pagination.pageIndex + 1}
                  onChange={(e) => {
                    const page = e.target.value
                      ? Number(e.target.value) - 1
                      : 0;
                    table.setPageIndex(page);
                  }}
                  className="w-16 p-2 rounded-md border text-center"
                />
                <span className="ml-1">of {table.getPageCount()}</span>
              </span>

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight size={20} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-gray-400 text-sm">
          No invoices found for this customer.
        </div>
      )}
    </div>
  );
}

export default PartiesInvoice;
