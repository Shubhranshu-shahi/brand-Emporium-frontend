import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, PlusCircleIcon, PlusCircle, X } from "lucide-react";

import { getAllProduct, productDelete } from "../assets/helper/productApi";

const ItemsInvoice = lazy(() => import("././ItemsInvoice"));

function ItemsList() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedProduct, SetSelectedProduct] = useState({});
  const [products, setProducts] = useState([]);
  const [sorting, setSorting] = useState([]);

  const [selectedRowId, setSelectedRowId] = useState("");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10, // Adjust this as needed
  });

  const navigate = useNavigate();

  const columns = [
    {
      accessorKey: "itemName",
      header: "Item Name",
    },
    {
      accessorKey: "mrp",
      header: "MRP",
    },
    { accessorKey: "sellingPrice", header: "Sale At" },
    { accessorKey: "purchasedPrice", header: "Purchased At" },
    { accessorKey: "itemCode", header: "Item Code" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleUpdate(row.original)}
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

  const table = useReactTable({
    data: products,
    columns,
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const fetchProducts = async () => {
    try {
      const res = await getAllProduct();
      const cleaned = res.map((prod) => ({
        id: prod._id,
        itemHSN: prod.itemHSN || "N/A",
        category: prod.category || "N/A",
        itemCode: prod.itemCode,
        mrp: prod.mrp,
        discountSale: prod.discountSale || 0,
        itemName: prod.itemName || "N/A",
        salePrice: prod.salePrice || mrp,
        taxSale: prod.taxSale || 0,
        sellingPrice: prod.sellingPrice || mrp,
        purchasePrice: prod.purchasePrice || 0,
        taxPurchase: prod.taxPurchase || 0,
        purchasedPrice: prod.purchasedPrice || 0,
      }));
      setProducts(cleaned);
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      SetSelectedProduct(products[0]);
      setSelectedRowId(products[0].id);
    }
  }, [products]);

  const handleUpdate = (row) => {
    navigate(`/edit-item/${row.id}`, { state: row });
  };

  const handleDelete = async (row) => {
    const res = await productDelete(row.id);

    fetchProducts();
  };

  const handleRowClick = (rowData) => {
    SetSelectedProduct(rowData);
    setSelectedRowId(rowData.id);
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Party List */}
        <div className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-md p-4"
          >
            <h2 className=" flex flex-1 text-lg font-semibold mb-4 text-gray-800">
              Items List
            </h2>

            <button
              className="w-full mb-4 px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition duration-300 ease-in-out"
              onClick={() => {
                navigate("/items/add-item");
              }}
            >
              + Add Item
            </button>

            <input
              type="text"
              placeholder="Search parties..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full mb-4 px-4 py-2 text-sm rounded-xl border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <div className="overflow-y-auto max-h-auto">
              <table className="min-w-full text-sm text-left text-gray-800">
                <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-4 py-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => {
                    return (
                      <motion.tr
                        key={row.id}
                        whileHover={{ scale: 1.01 }}
                        className={`cursor-pointer transition ${
                          selectedRowId === row.original.id
                            ? "bg-indigo-100 border-l-4 border-indigo-500"
                            : ""
                        } hover:bg-indigo-100`}
                        onClick={(e) => {
                          if (e.target.closest("button")) return;
                          handleRowClick(row.original);
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-4 py-3 border-t border-gray-200"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
                <div>
                  Page{" "}
                  <strong>
                    {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </strong>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Party Details & Invoices */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md p-4"
          >
            <PartyDetails selectedCustomer={selectedCustomer} />
          </motion.div> */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-4"
          >
            <Suspense
              fallback={<div className="text-gray-500">Loading table...</div>}
            >
              {selectedProduct?.id && (
                <ItemsInvoice selectedProduct={selectedProduct} />
              )}
            </Suspense>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ItemsList;
