import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, X } from "lucide-react";

import { currentDate, currentDateAndTime } from "../assets/helper/Helpers";
import { customerByPhone, customerInsert } from "../assets/helper/customerApi";
import { invoiceInsert } from "../assets/helper/InvoiceApi";
import { productById, productInsert } from "../assets/helper/productApi";

import TotalSummaryCard from "./TotalSummaryCard";
import CustomerDetails from "./CustomerDetails";
import InvoiceDetails from "./InvoiceDetails";
import ProductTable from "./ProductTable";

function SalesFormMain() {
  const navigate = useNavigate();
  const lastInputRef = useRef(null);

  const [product, setProduct] = useState([]);
  const [nongst, setNongst] = useState(false);
  const [errors, setErrors] = useState({
    phone: false,
    customerName: false,
  });
  const [rows, setRows] = useState([
    {
      items: 1,
      itemCode: "",
      productId: "",
      mrp: "",
      qty: "1",
      itemName: "",
      discountSale: "",
      sellingPrice: "",
      taxSale: "0",
      taxAmount: "",
      salePrice: "",
      show: false,
      purchasedPrice: "",
      discountAmount: "",
      purchasedWithQty: "",
    },
  ]);

  const [customerAndInvoice, setCustomerAndInvoice] = useState({
    customerName: "",
    phone: "",
    CustomerGstin: "",
    email: "",
    customerId: "",
    billedBy: localStorage.getItem("loggedInUser"),
    updatedBy: "",
    invoiceNumber: currentDateAndTime(),
    invoiceDate: currentDate(),
    GSTType: "GST",
  });

  const [roundOff, setRoundOff] = useState(0);
  const [receive, setReceive] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [type, setType] = useState("Online");

  const totalAmount = rows.reduce(
    (sum, row) => sum + (parseFloat(row.sellingPrice) || 0),
    0
  );

  useEffect(() => {
    if (customerAndInvoice.GSTType === "Non-GST") {
      setCustomerAndInvoice((prev) => ({
        ...prev,
        CustomerGstin: "",
      }));
      setNongst(true);
    } else {
      setNongst(false);
    }
  }, [customerAndInvoice.GSTType]);

  useEffect(() => {
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      if (lastRow.itemCode && lastRow.itemCode.length > 7) {
        searchByidProduct(lastRow.itemCode);
      }
    }
    if (lastInputRef.current) lastInputRef.current.focus();
  }, [rows.itemCode]);

  useEffect(() => {
    const newRoundOff = parseInt(totalAmount);
    setRoundOff(newRoundOff);
    setRemaining(newRoundOff - receive);
  }, [rows, totalAmount]);
  useEffect(() => {
    setRemaining(roundOff - receive);
  }, [roundOff]);

  const handleSubmit = async () => {
    const newErrors = {};

    if (!customerAndInvoice.phone || customerAndInvoice.phone.length !== 10) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!customerAndInvoice.customerName?.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      return;
    }

    try {
      // Step 2: Identify non-existing products in parallel
      const checks = await Promise.all(
        rows.map(async (row) => {
          if (!row.itemCode) return null;
          const exists = await searchByidProduct(row.itemCode);
          return !exists ? row : null;
        })
      );

      const nonExistingProducts = checks.filter(Boolean).map((row) => ({
        itemCode: row.itemCode,
        itemName: row.itemName,
        mrp: row.mrp,
        category: "N/A",
        sellingPrice: row.sellingPrice,
        taxSale: row.taxSale,
        purchasedPrice: row.purchasedPrice,
        discountSale: row.discountSale,
        discountAmount: row.discountAmount,
        salePrice: row.salePrice,
        purchasePrice: row.purchasedPrice,
        taxPurchase: 0,
      }));

      // Step 3: Insert non-existing products
      if (nonExistingProducts.length > 0) {
        await productInsert(nonExistingProducts);
      }

      // Step 4: Insert customer
      const insertedCustomer = await customerInsert(customerAndInvoice);

      const formData = {
        customerAndInvoice: {
          ...customerAndInvoice,
          customerId: insertedCustomer._id,
        },
        rows,
        totalDetails: {
          total: totalAmount,
          roundOff,
          receive,
          remaining,
          type,
        },
      };

      // Step 5: Insert invoice
      const invoiceData = await invoiceInsert(formData);

      if (invoiceData) {
        navigate(`/invoice/${customerAndInvoice.invoiceNumber}`, {
          state: { id: customerAndInvoice.invoiceNumber },
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const getCustomerByPhone = async (phone) => {
    const cust = await customerByPhone(phone);
    setCustomerAndInvoice((prev) => ({
      ...prev,
      customerName: cust.customerName || "",
      customerId: cust._id,
      email: cust.email || "",
      CustomerGstin: cust.CustomerGstin || "",
      phone,
    }));
  };

  const searchByidProduct = async (itemCode) => {
    const prod = await productById(itemCode);
    setProduct(prod);
    return prod;
  };

  const isRowsValid = () => {
    return rows.every((row) => {
      return (
        row.itemCode.trim() !== "" &&
        row.mrp !== "" &&
        row.qty !== "" &&
        row.sellingPrice !== "" &&
        row.purchasedPrice !== ""
      );
    });
  };

  return (
    <div className="p-2 w-full bg-white rounded-xl">
      <div className="overflow-x-auto min-w-full mx-auto bg-gray-50 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold text-black text-3xl">Sales</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <CustomerDetails
            customer={customerAndInvoice}
            setCustomer={setCustomerAndInvoice}
            getCustomerByPhone={getCustomerByPhone}
            errors={errors}
            setErrors={setErrors}
            nonGst={nongst}
          />
          <div></div>
          <InvoiceDetails
            invoice={customerAndInvoice}
            setInvoice={setCustomerAndInvoice}
          />
        </div>

        <ProductTable
          rows={rows}
          setRows={setRows}
          product={product}
          setProduct={setProduct}
          lastInputRef={lastInputRef}
          searchByidProduct={searchByidProduct}
          nonGst={nongst}
        />

        <div className="flex justify-between mt-4 items-start">
          <div className="flex-1">
            <TotalSummaryCard
              totalAmount={totalAmount}
              roundOff={roundOff}
              setRoundOff={setRoundOff}
              receive={receive}
              setReceive={setReceive}
              remaining={remaining}
              setRemaining={setRemaining}
              type={type}
              setType={setType}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          {/* <button className="bg-blue-500 px-4 py-2 rounded text-white">
            Share
          </button> */}
          <button
            onClick={handleSubmit}
            disabled={!isRowsValid()}
            className={`px-4 py-2 text-white rounded ${
              isRowsValid() ? "bg-green-500" : "bg-gray-400 cursor-not-allowed"
            } `}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalesFormMain;
