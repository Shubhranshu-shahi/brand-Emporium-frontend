import React from "react";

function InvoiceTable() {
  return (
    <>
      <main className="flex-1 p-6 bg-gray-100 ">
        <div className="max-w-4xl mx-auto p-4 bg-white shadow-md">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <img
                src="logo.png"
                alt="The Brand Emporium Enterprise"
                className="h-16"
              />
              <p className="text-sm">GSTIN: 09AAWFT0842R1Z4</p>
              <p className="text-sm">State: 09 - Uttar Pradesh</p>
            </div>
            <div className="text-right">
              <p className="text-sm">thebrandemporiumenterprises@gmail.com</p>
              <p className="text-sm">L-II/9/F Sector-F Kanpur Road, Lucknow</p>
              <p className="text-sm">9519708116</p>
            </div>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Tax Invoice</h2>
            <p className="text-sm">Invoice No.: 392</p>
            <p className="text-sm">Date: 03/01/2025</p>
          </div>
          <div className="mb-4">
            <p className="text-sm">Bill To:</p>
            <p className="text-lg font-bold">abhishek</p>
            <p className="text-sm">Contact No.: 8317053678</p>
          </div>
          <table className="w-full mb-4 border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">#</th>
                <th className="border p-2">Item name</th>
                <th className="border p-2">HSN/ SAC</th>
                <th className="border p-2">MRP</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Price/ Unit</th>
                <th className="border p-2">Discount</th>
                <th className="border p-2">GST</th>
                <th className="border p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">1</td>
                <td className="border p-2">Puma Shoe 4063699711455</td>
                <td className="border p-2">-</td>
                <td className="border p-2">₹ 5,499.00</td>
                <td className="border p-2">1</td>
                <td className="border p-2">₹ 1,649.70</td>
                <td className="border p-2">₹ 3,436.87 (70%)</td>
                <td className="border p-2">₹ 176.75 (12%)</td>
                <td className="border p-2">₹ 1,650.00</td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-between items-center mb-4">
            <div>
              <img src="qr-code.png" alt="QR Code" className="h-24" />
              <p className="text-sm">SCAN TO PAY</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Sub Total: ₹ 1,649.70</p>
              <p className="text-sm">Discount: ₹ 3,436.87</p>
              <p className="text-sm">SGST@6%: ₹ 88.38</p>
              <p className="text-sm">CGST@6%: ₹ 88.37</p>
              <p className="text-sm">Total: ₹ 1,650.00</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm">No return or refund.</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default InvoiceTable;
