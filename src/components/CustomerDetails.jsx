import { useState } from "react";
import { handleError } from "../assets/api/utils";

function CustomerDetails({
  customer,
  setCustomer,
  getCustomerByPhone,
  errors,
  setErrors,
  nonGst,
}) {
  const handlePhoneChange = (e) => {
    const phone = e.target.value.trim();
    setCustomer({ ...customer, phone });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    const isValid = /^[0-9]{10}$/.test(phone);

    if (isValid) {
      getCustomerByPhone(phone);
    }

    // if (phone.trim() !== "" && phone.length > 9 && phone.length < 11) {
    //   getCustomerByPhone(phone);
    // }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="font-semibold text-gray-700 mb-2">Customer Details</h2>

      <label className="block font-semibold text-gray-400 mt-2">
        Phone No.
      </label>
      <input
        type="text"
        name="phone"
        className={`w-full p-2 border rounded ${
          errors.phone ? "border-red-500" : "border-gray-300"
        }`}
        maxLength={10}
        placeholder="Phone No."
        required
        value={customer.phone}
        onChange={handlePhoneChange}
      />
      {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      <label className="block font-semibold text-gray-400">Customer</label>
      <input
        name="customerName"
        className={`w-full p-2 border rounded ${
          errors.customerName ? "border-red-500" : "border-amber-600"
        }`}
        value={customer.customerName}
        onChange={(e) => {
          setCustomer({ ...customer, customerName: e.target.value });
          setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
        }}
      />
      {errors.customerName && (
        <p className="text-red-500 text-sm">{errors.customerName}</p>
      )}

      <label className="block font-semibold text-gray-400 mt-2">
        Customer Email
      </label>
      <input
        name="customerEmail"
        className="w-full p-2 border text-black rounded border-amber-600"
        value={customer.email}
        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
      />
      <label className="block font-semibold text-gray-400 mt-2">
        Customer GSTIN
      </label>
      <input
        name="CustomerGstin"
        className={`w-full p-2 border text-black rounded border-amber-600 
        ${nonGst ? "cursor-not-allowed disabled:bg-gray-100" : ""}`}
        value={nonGst ? "" : customer.CustomerGstin}
        disabled={nonGst}
        onChange={(e) =>
          setCustomer({ ...customer, CustomerGstin: e.target.value })
        }
      />
    </div>
  );
}

export default CustomerDetails;
