import { ChevronDown, Eye, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { searchProductsByName } from "../assets/api/productApi";

function ProductTable({
  rows,
  setRows,
  lastInputRef,
  searchByidProduct,
  nonGst,
}) {
  const [expandedRow, setExpandedRow] = useState(false);
  const [products, setProducts] = useState([]);
  const [originalTaxValues, setOriginalTaxValues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const generateProductId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `${timestamp}${randomNum}`;
  };

  const toggleShow = (index) => {
    setRows((prevRows) =>
      prevRows.map((row, i) =>
        i === index ? { ...row, show: !row.show } : row
      )
    );
  };
  useEffect(() => {
    if (nonGst) {
      setOriginalTaxValues(
        rows.map((row) => ({
          itemCode: row.itemCode,
          taxSale: row.taxSale,
          taxAmount: row.taxAmount,
          salePrice: row.salePrice,
        }))
      );
      setRows((prevRows) =>
        prevRows.map((row) => ({
          ...row,
          taxSale: 0,
          taxAmount: 0,
          salePrice: row.sellingPrice,
        }))
      );
      // console.log(originalTaxValues);
    } else {
      // console.log("hello");
      // console.log(originalTaxValues);
      setRows((prevRows) =>
        prevRows.map((row) => {
          const original = originalTaxValues.find(
            (r) => r.itemCode === row.itemCode
          );
          if (original) {
            return {
              ...row,
              taxSale: original.taxSale,
              taxAmount: original.taxAmount,
              salePrice: original.salePrice,
            };
          }

          const taxSale = parseFloat(row.taxSale) || 0;
          const taxAmount = parseFloat(row.sellingPrice) * (taxSale / 100);
          return {
            ...row,
            taxAmount,
          };
        })
      );
    }
  }, [nonGst]);

  const handleInputChange = async (index, key, value) => {
    setRows((prevRows) => {
      let newRows = [...prevRows];
      let row = { ...newRows[index] };
      row[key] = value;
      newRows[index] = row;
      // if (key === "itemName") {
      //   setSearchQuery(value);
      //   searchProductsByName(value).then((result) => {
      //     setSuggestions(result);
      //   });
      // }
      if (key === "itemCode" && value.trim() !== "" && value.length >= 12) {
        const existingIndex = newRows.findIndex(
          (r, i) => r.itemCode === value && i !== index
        );

        if (existingIndex !== -1) {
          newRows[existingIndex].qty = (
            parseInt(newRows[existingIndex].qty, 10) + 1
          ).toString();
          newRows = updateRowCalculations(newRows, existingIndex);
          newRows = newRows
            .filter((_, i) => i !== index)
            .map((r, i) => ({ ...r, items: i + 1 }));
          return newRows;
        } else {
          searchByidProduct(value).then((prod) => {
            if (prod) {
              newRows[index] = createNewRowData(newRows[index], prod);
              const updatedRows = newRows.map((r, i) => ({
                ...r,
                items: i + 1,
              }));
              setRows(updatedRows);
            }
          });
        }
      } else {
        if (
          [
            "discountSale",
            "taxSale",
            "mrp",
            "qty",
            "purchasedPrice",
            "sellingPrice",
          ].includes(key)
        ) {
          newRows = updateRowCalculations(newRows, index, key);
        }
        newRows = newRows.map((r, i) => ({ ...r, items: i + 1 }));
        setRows(newRows);
      }

      return [...newRows];
    });
  };

  const createNewRowData = (row, prod) => {
    const qty = parseFloat(row.qty) || 1;
    const newMrp = prod.mrp * qty;
    const discountAmount = parseFloat(
      newMrp * (prod.discountSale / 100)
    ).toFixed(2);
    const purchasedWithQty = (prod.purchasedPrice || 0) * qty;

    return {
      ...row,
      mrp: prod.mrp || "",
      productId: prod._id,
      itemName: prod.itemName,
      discountSale: prod.discountSale || "",
      sellingPrice: prod.sellingPrice || "",
      taxSale: parseFloat(prod.taxSale) || 0,
      taxAmount: (prod.sellingPrice || 0) * ((prod.taxSale || 100) / 100),
      salePrice: prod.salePrice || "",
      itemCode: prod.itemCode,
      purchasedPrice: prod.purchasedPrice,
      discountAmount,
      purchasedWithQty,
    };
  };

  const getTotalValues = () => {
    let totalQty = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalAmount = 0;

    rows.forEach((row) => {
      const qty = parseFloat(row.qty) || 0;
      const discount = parseFloat(row.discountAmount) || 0;
      const tax = nonGst ? 0 : parseFloat(row.taxAmount) || 0;
      const amount = nonGst
        ? parseFloat(row.sellingPrice) || 0
        : parseFloat(row.sellingPrice) || 0;

      totalQty += qty;
      totalDiscount += discount;
      totalTax += tax;
      totalAmount += amount;
    });

    return {
      totalQty,
      totalDiscount: totalDiscount.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  };

  const updateRowCalculations = (rows, index, changedKey = "") => {
    let row = rows[index];
    const qty = parseFloat(row.qty) || 1;
    const mrp = parseFloat(row.mrp) || 0;
    const taxSale = parseFloat(row.taxSale) || 0;
    const baseMrpTotal = mrp * qty;

    let sellingPrice = baseMrpTotal;
    let discountSale = parseFloat(row.discountSale) || 0;
    let discountAmount = 0;
    let isManual = row.isSellingPriceManual;

    // 👇 If user changed sellingPrice, flag it as manual
    if (changedKey === "sellingPrice") {
      isManual = true;
    }

    // 👇 Reset manual mode if qty/mrp/discountSale is changed
    if (["qty", "mrp", "discountSale"].includes(changedKey)) {
      isManual = false;
    }

    if (isManual) {
      sellingPrice = parseFloat(row.sellingPrice) || 0;
      discountAmount = parseFloat((baseMrpTotal - sellingPrice).toFixed(2));
      discountSale = parseFloat(
        ((discountAmount / baseMrpTotal) * 100).toFixed(2)
      );
    } else {
      discountAmount = parseFloat(
        (baseMrpTotal * (discountSale / 100)).toFixed(2)
      );
      sellingPrice = parseFloat((baseMrpTotal - discountAmount).toFixed(2));
    }

    const taxAmount = parseFloat((sellingPrice * (taxSale / 100)).toFixed(2));
    const salePrice = parseFloat((sellingPrice - taxAmount).toFixed(2));
    const purchasedWithQty = (parseFloat(row.purchasedPrice) || 0) * qty;

    rows[index] = {
      ...row,
      productId: row.productId || generateProductId(),
      isSellingPriceManual: isManual,
      discountAmount,
      discountSale,
      sellingPrice,
      taxAmount,
      salePrice,
      purchasedWithQty,
    };

    return rows;
  };

  const addRow = () => {
    const newRow = {
      items: rows.length + 1,
      itemCode: "",
      mrp: "",
      itemName: "",
      qty: "1",
      productId: "",
      discountSale: "0",
      sellingPrice: "",
      taxSale: "0",
      taxAmount: "",
      salePrice: "",
      show: false,
      purchasedPrice: "",
      discountAmount: "",
      purchasedWithQty: "",
    };
    setRows([...rows, newRow]);

    setTimeout(() => {
      if (lastInputRef.current) {
        lastInputRef.current.focus();
      }
    }, 0);
  };

  const deleteRow = (index) => {
    if (rows.length > 1 && index !== 0) {
      const newRows = rows
        .filter((_, i) => i !== index)
        .map((r, i) => ({ ...r, items: i + 1 }));
      setRows(newRows);
    }
  };

  const handleSuggestionClick = (index, product) => {
    const updatedRows = [...rows];

    const existingRowIndex = updatedRows.findIndex(
      (row, i) => i !== index && row.itemCode === product.itemCode
    );

    if (existingRowIndex !== -1) {
      //  Product already exists — increase quantity and recalculate
      const existingRow = updatedRows[existingRowIndex];
      const updatedQty = parseFloat(existingRow.qty || "0") + 1;

      updatedRows[existingRowIndex] = {
        ...existingRow,
        qty: updatedQty.toString(),
      };

      updateRowCalculations(updatedRows, existingRowIndex, "qty");

      //  Remove the current empty/searching row
      updatedRows.splice(index, 1);
    } else {
      //  Insert new product into current row
      const filledRow = createNewRowData(updatedRows[index], product);
      updatedRows[index] = {
        ...filledRow,
        qty: "1",
        searchQuery: "",
        suggestions: [],
      };

      updateRowCalculations(updatedRows, index, "qty");
    }

    setRows(updatedRows);
  };

  const handleItemNameSearch = (index, value) => {
    const updatedRows = [...rows];
    updatedRows[index].itemName = value;
    updatedRows[index].searchQuery = value;
    setRows(updatedRows);

    // Debounced search
    if (value.length > 1) {
      searchProductsByName(value).then((suggestions) => {
        const updated = [...rows];
        updated[index].suggestions = suggestions;
        setRows(updated);
      });
    } else {
      updatedRows[index].suggestions = [];
      setRows(updatedRows);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full text-sm text-left text-gray-700 bg-white">
          <thead>
            <tr className="bg-gray-800 text-white text-xs uppercase tracking-wider">
              {[
                "Item",
                "Item Code",
                "Product Name",
                "MRP",
                "Qty",
                "Discount %",
                "Discount Amount",
                "Tax %",
                "Tax Amount",
                "Price",
                "Amount",
                "Show",

                "Action",
              ].map((header) => (
                <th key={header} className="px-4 py-3 border">
                  {header}
                </th>
              ))}
              <th className="px-4 py-3 border">
                <button
                  className="bg-blue-500 hover:bg-blue-600 px-2 py-2 rounded-lg"
                  onClick={() => {
                    setExpandedRow((prev) => !prev);
                  }}
                >
                  ShowFull
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.items}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50 transition`}
              >
                <td className="px-4 py-3 text-center border">{row.items}</td>
                <td className="px-4 py-3 border">
                  <input
                    className="min-w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={row.itemCode}
                    onChange={(e) =>
                      handleInputChange(index, "itemCode", e.target.value)
                    }
                    ref={lastInputRef}
                  />
                </td>
                <td className="relative px-4 py-3 border">
                  <input
                    className="min-w-full p-2 border rounded-lg"
                    // className="w-full bg-transparent border-none outline-none"
                    value={row.itemName}
                    onChange={(e) =>
                      handleItemNameSearch(index, e.target.value)
                    }
                    placeholder="Search by name"
                  />
                  {row.suggestions?.length > 0 && (
                    <ul className="absolute z-10 w-full max-h-48 overflow-y-auto bg-white border rounded shadow top-full left-0">
                      {row.suggestions.map((product, idx) => (
                        <li
                          key={idx}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => handleSuggestionClick(index, product)}
                        >
                          <div className="font-medium">{product.itemName}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-4 py-3 border">
                  <input
                    className="min-w-full p-2 border rounded-lg"
                    type="number"
                    value={row.mrp}
                    onChange={(e) =>
                      handleInputChange(index, "mrp", e.target.value)
                    }
                  />
                </td>
                <td className="px-4 py-3 border min-w-24">
                  <input
                    className="w-full p-2 border rounded-lg text-center"
                    type="number"
                    value={row.qty}
                    onChange={(e) =>
                      handleInputChange(index, "qty", e.target.value)
                    }
                  />
                </td>
                <td className="px-4 py-3 border">
                  <input
                    className="min-w-full p-2 border rounded-lg"
                    placeholder="0"
                    value={row.discountSale}
                    onChange={(e) =>
                      handleInputChange(index, "discountSale", e.target.value)
                    }
                  />
                </td>
                <td className="px-4 py-3 text-center border">
                  {row.discountAmount}
                </td>
                <td className="px-4 py-3 border min-w-28">
                  <select
                    className={`w-full p-2 border rounded-lg text-center ${
                      nonGst ? "bg-gray-200 cursor-not-allowed" : ""
                    }`}
                    value={nonGst ? 0 : row.taxSale}
                    disabled={nonGst}
                    onChange={(e) =>
                      handleInputChange(index, "taxSale", e.target.value)
                    }
                  >
                    {["0", "5", "12", "18", "28"].map((tax) => (
                      <option key={tax} value={tax}>
                        {tax}%
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 min-w-full py-3 text-center border">
                  {nonGst ? 0 : isNaN(row.taxAmount) ? 0 : row.taxAmount}
                </td>
                <td className="px-4 py-3 min-w-full text-center border">
                  {nonGst ? row.sellingPrice : row.salePrice}
                </td>
                <td className="px-4 py-3 font-semibold text-center border">
                  <input
                    className="min-w-full p-2 border rounded-lg"
                    placeholder="0"
                    value={row.sellingPrice}
                    onChange={(e) =>
                      handleInputChange(index, "sellingPrice", e.target.value)
                    }
                  />
                </td>
                <td className="px-4 py-3 border min-w-32 text-center">
                  {row.show ? (
                    <div className="flex flex-col space-y-2">
                      <input
                        className="w-full p-2 border rounded-lg"
                        type="number"
                        value={row.purchasedPrice}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "purchasedPrice",
                            e.target.value
                          )
                        }
                      />
                      <button
                        onClick={() => toggleShow(index)}
                        className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md"
                      >
                        Hide
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleShow(index)}
                      className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                </td>

                <td className="px-4 py-3 text-center border">
                  {rows.length > 1 && index !== 0 && (
                    <button
                      onClick={() => deleteRow(index)}
                      className="min-w-8 min-h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center"
                      title="Delete Row"
                    >
                      <X size={16} />
                    </button>
                  )}
                </td>

                {/* --------------------------------- */}
                <td className="px-4 py-3 border min-w-32 text-center">
                  {expandedRow && (
                    <div className="flex flex-col space-y-2">
                      {row.purchasedWithQty}
                    </div>
                  )}
                </td>

                {/* ----------------------------------------- */}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-medium">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right border">
                Totals
              </td>
              <td className="px-4 py-3 text-center border">
                {getTotalValues().totalQty}
              </td>
              <td className="px-4 py-3 text-center border">—</td>
              <td className="px-4 py-3 text-center border">
                {getTotalValues().totalDiscount}
              </td>
              <td className="px-4 py-3 text-center border">—</td>
              <td className="px-4 py-3 text-center border">
                {getTotalValues().totalTax}
              </td>
              <td className="px-4 py-3 text-center border">—</td>
              <td className="px-4 py-3 text-center border">
                {getTotalValues().totalAmount}
              </td>
              <td colSpan={2} className="px-4 py-3 border">
                —
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex space-x-4 mt-4">
        <button
          onClick={addRow}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Add Row
        </button>
      </div>
    </div>
  );
}

export default ProductTable;
