import React from "react";
import { customerByPhone } from "../assets/api/customerApi";

function CustomerDetailsForm({ customerAndInvoice, setCustomerAndInvoice }) {
  //check get customer by number
  const getCustomerByPhone = async (phone) => {
    const cust = await customerByPhone(phone);

    setCustomerAndInvoice((prevState) => ({
      ...prevState,
      customerName: cust.customerName || "",
      phone,
    }));
  };
  return (
    <>
      {/* Customer & Invoice Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer Details */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="font-semibold text-gray-700 mb-2">Customer Details</h2>
          <label className="block font-semibold text-gray-400">Customer</label>
          <input
            id="CustomerId"
            name="customerName"
            className="w-full p-2 border text-black rounded border-amber-600"
            onChange={(e) =>
              setCustomerAndInvoice({
                ...customerAndInvoice,
                customerName: e.target.value,
              })
            }
            value={customerAndInvoice.customerName}
            list="Customer-list"
          />
          <datalist id="Customer-list">
            <option value="Chocolate" />
            <option value="Coconut" />
            <option value="Mint" />
          </datalist>
          <label className="block font-semibold text-gray-400 mt-2">
            Phone No.
          </label>
          <input
            type="text"
            name="phone"
            id="phone"
            onChange={(e) => {
              setCustomerAndInvoice({
                ...customerAndInvoice,
                phone: e.target.value,
              });
              if (
                e.target.value.trim() !== "" &&
                e.target.value.length > 9 &&
                e.target.value.length < 11
              ) {
                getCustomerByPhone(e.target.value);
              }
            }}
            value={customerAndInvoice.phone}
            className="w-full p-2 text-black border rounded"
            placeholder="Phone No."
          />
        </div>
        <div></div>

        {/* Invoice Details */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="font-semibold text-gray-700 mb-2">Invoice Details</h2>
          <label className="font-semibold text-gray-400">Invoice Number:</label>
          <input
            type="text"
            className="w-full p-2 border text-black rounded mb-2"
            name="invoiceinvoiceNumberNum"
            value={customerAndInvoice.invoiceNumber}
            onChange={(e) =>
              setCustomerAndInvoice({
                ...customerAndInvoice,
                invoiceNumber: e.target.value,
              })
            }
            placeholder="Enter Invoice No."
          />
          <label className="font-semibold text-gray-400">Invoice Date:</label>
          <input
            type="date"
            name="invoiceDate"
            value={customerAndInvoice.invoiceDate}
            onChange={(e) =>
              setCustomerAndInvoice({
                ...customerAndInvoice,
                invoiceDate: e.target.value,
              })
            }
            className="w-full p-2 text-black border rounded"
          />
        </div>
      </div>
    </>
  );
}

export default CustomerDetailsForm;
