import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoiceGenrate, updateInvoice } from "../assets/api/InvoiceApi";

import CustomerDetails from "./CustomerDetails";
import InvoiceDetails from "./InvoiceDetails";
import ProductTable from "./ProductTable";
import TotalSummaryCard from "./TotalSummaryCard";
import { productById } from "../assets/api/productApi";

export default function EditSalesForm({ invoiceNumber }) {
  const navigate = useNavigate();
  const lastInputRef = useRef(null);

  const [rows, setRows] = useState([]);
  const [product, setProduct] = useState([]);
  const [customerAndInvoice, setCustomerAndInvoice] = useState({});
  const [roundOff, setRoundOff] = useState(0);
  const [receive, setReceive] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [type, setType] = useState("Online");
  const [nongst, setNongst] = useState(false);
  const [errors, setErrors] = useState({
    phone: false,
    customerName: false,
  });

  const totalAmount = parseFloat(
    rows.reduce((sum, row) => sum + (parseFloat(row.sellingPrice) || 0), 0)
  );

  const searchByidProduct = async (itemCode) => {
    const prod = await productById(itemCode);
    setProduct(prod);
    return prod;
  };

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
    const fetchInvoice = async () => {
      const invoice = await invoiceGenrate(invoiceNumber);
      if (invoice) {
        setCustomerAndInvoice(invoice.customerAndInvoice);
        setRows(invoice.rows);
        setRoundOff(invoice.totalDetails.roundOff);
        setReceive(invoice.totalDetails.receive);
        setRemaining(invoice.totalDetails.remaining);
        setType(invoice.totalDetails.type);
      }
    };

    fetchInvoice();
  }, [invoiceNumber]);
  const updatedBy = localStorage.getItem("loggedInUser");
  const handleUpdate = async () => {
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
    const sanitizedRows = rows.map((row) => {
      const { purchasedPrice = 0, qty = 1 } = row;
      const purchasedWithQty = row.purchasedWithQty ?? purchasedPrice * qty;

      return {
        ...row,
        purchasedWithQty,
      };
    });
    const formData = {
      customerAndInvoice: {
        ...customerAndInvoice,
        updatedBy,
      },
      rows: sanitizedRows,
      totalDetails: {
        total: Number(parseFloat(totalAmount).toFixed(2)),
        roundOff,
        receive,
        remaining,
        type,
      },
    };

    const result = await updateInvoice(invoiceNumber, formData);
    if (result) {
      navigate(`/invoice/${invoiceNumber}`, {
        state: { id: invoiceNumber },
      });
    }
  };
  useEffect(() => {
    const newRoundOff = parseInt(totalAmount);
    setRoundOff(newRoundOff);
    setRemaining(newRoundOff - receive);
  }, [rows, totalAmount, receive]);

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
        <h1 className="font-bold text-black text-3xl mb-4">Edit Invoice</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <CustomerDetails
            customer={customerAndInvoice}
            setCustomer={setCustomerAndInvoice}
            getCustomerByPhone={() => {}}
            errors={errors}
            setErrors={setErrors}
            nonGst={nongst}
          />
          <div></div>
          <InvoiceDetails
            invoice={customerAndInvoice}
            setInvoice={setCustomerAndInvoice}
            nonGst={nongst}
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
          <button
            onClick={handleUpdate}
            disabled={!isRowsValid()}
            className={`px-4 py-2 text-white rounded ${
              isRowsValid() ? "bg-green-500" : "bg-gray-400 cursor-not-allowed"
            } `}
          >
            Update Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
