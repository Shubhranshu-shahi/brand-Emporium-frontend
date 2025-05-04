import React, { useState } from "react";
import { numberToWords } from "../assets/api/Helpers";
import { invoiceGenrate } from "../assets/api/InvoiceApi";
import logo from "../img/logo.jpeg";
import sign from "../img/sign.jpeg";
import instaScnan from "../img/instaScan.jpg";
import { Mail, MapPin, PhoneCall } from "lucide-react";

function InvoiceBill({ id, pdf }) {
  const [inv, setInv] = useState({
    rows: [],
    customerAndInvoice: {},
    totalDetails: {},
  });
  const [sgst, setSgst] = useState(0);
  const [cgst, setCgst] = useState(0);

  const [totalgstAmount, setTotalgstAmount] = useState(0);
  const calculateGST = () => {
    if (!inv.rows.length) return;
    let totalSgst = 0;
    let totalCgst = 0;

    let gstTotalAmount = 0;

    inv.rows.forEach((item) => {
      const totalTaxAmount = (item.taxSale / 100) * item.sellingPrice;
      gstTotalAmount += totalTaxAmount;
      totalSgst += totalTaxAmount / 2;
      totalCgst += totalTaxAmount / 2;
    });

    setSgst(totalSgst.toFixed(2));
    setCgst(totalCgst.toFixed(2));
    setTotalgstAmount(gstTotalAmount.toFixed(2));
  };

  const [discountAm, setDiscountAm] = useState(0);

  const calDiscount = () => {
    let diff = 0;
    if (inv.rows.length) {
      inv.rows.forEach((item) => {
        const totalDiffAmount = item.mrp * item.qty - item.sellingPrice;
        diff += totalDiffAmount;
      });

      setDiscountAm(diff.toFixed(2));
    }
  };

  const getinvoice = async () => {
    try {
      const invoice = await invoiceGenrate(id);
      if (invoice) {
        setInv(invoice);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  React.useEffect(() => {
    if (inv.rows.length > 0) {
      calculateGST();
      calDiscount();
    }
  }, [inv]);

  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      await getinvoice();
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center p-6">Loading Invoice...</div>;
  }

  return (
    <div className="bg-gray-100 p-6 text-black">
      <div className="max-w-6xl mt-8 mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Header Section */}
        <div className="flex flex-wrap  text-sm md:text-base">
          <div className="bg-[#0f1316] w-full md:w-1/4 flex justify-center p-2">
            <img src={logo} className="h-16" alt="Logo" />
          </div>
          <div className="bg-red-600 gap-2 font-sans w-full md:w-3/4 text-white p-4 flex flex-col md:flex-row md:justify-between md:items-center">
            <p className="flex items-center text-sm md:text-base">
              <PhoneCall className="mr-2" /> 9519708116
            </p>
            <p className="flex items-center text-sm md:text-base">
              <Mail className="mr-2 w-10" />
              thebrandemporiumenterprise@gmail.com
            </p>
            <p className="flex items-center text-sm md:text-base">
              <MapPin className="mr-2" /> L-II/9/F Sector-F Kanpur Road, Lucknow
            </p>
          </div>
        </div>
        <div className="p-4 font-sans bg-[#0f1316] text-gray-100  md:rounded-r-full text-center md:text-left text-sm w-full md:text-base md:w-4/6">
          <h1 className="text-xl font-bold">The Brand Emporium Enterprise</h1>
          <p>GSTIN: 09AAWFT0842R1Z4</p>
          <p>State: 09 - Uttar Pradesh</p>
        </div>
        {/* Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 text-sm md:text-base">
          <div className="md:col-span-2">
            <h3 className="text-red-500 font-bold">Bill To:</h3>
            <p>
              <strong>Name:</strong> {inv.customerAndInvoice.customerName}
            </p>
            <p>
              <strong>Contact No.:</strong> {inv.customerAndInvoice.phone}
            </p>
            {inv.customerAndInvoice.GSTType === "GST" &&
              inv.customerAndInvoice.CustomerGstin && (
                <p>
                  <strong>GSTIN:</strong> {inv.customerAndInvoice.CustomerGstin}
                </p>
              )}
          </div>
          <div className="md:col-span-4">
            <h2 className="text-lg font-semibold">Tax Invoice</h2>
            <p>
              <strong>Invoice No:</strong>{" "}
              {inv.customerAndInvoice.invoiceNumber}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {inv.customerAndInvoice.invoiceDate
                ? new Date(inv.customerAndInvoice.invoiceDate).toDateString()
                : "N/A"}
            </p>
            {inv.totalDetails.type && (
              <p>
                <strong>Payment:</strong> {inv.totalDetails.type}
              </p>
            )}
          </div>
        </div>
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse mt-4 text-sm md:text-base">
            <thead>
              <tr className="bg-[#0f1316] text-gray-100">
                <th className="border p-2">#</th>
                <th className="border p-2">Item Name</th>
                <th className="border p-2">HSN/SAC</th>
                <th className="border p-2">MRP</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Price/Unit</th>
                <th className="border p-2">Discount</th>
                <th className="border p-2">Discount Amount</th>
                {inv.customerAndInvoice.GSTType === "GST" && (
                  <>
                    <th className="border p-2">GST</th>
                    <th className="border p-2">GST Amount</th>
                  </>
                )}
                <th className="border p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.rows.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">
                    {item.itemName} {item.itemCode ? item.itemCode : ""}
                  </td>
                  <td className="border p-2"></td>
                  <td className="border p-2 text-right">₹ {item.mrp}</td>
                  <td className="border p-2 text-right">{item.qty}</td>
                  <td className="border p-2 text-right">
                    ₹ {Number(item.salePrice).toFixed(2)}
                  </td>
                  <td className="border p-2 text-right">
                    ₹ {Number(item.discountAmount).toFixed(2)}
                  </td>
                  <td className="border p-2 text-right">
                    ₹ {item.discountSale}%
                  </td>
                  {inv.customerAndInvoice.GSTType === "GST" && (
                    <>
                      <td className="border p-2 text-right">{item.taxSale}%</td>
                      <td className="border p-2 text-right">
                        ₹ {(item.taxSale / 100) * item.sellingPrice}
                      </td>
                    </>
                  )}
                  <td className="border p-2 text-right font-bold">
                    ₹ {Number(item.sellingPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td colSpan="4" className="border p-2 text-left">
                  Total:
                </td>
                {/* <td colSpan="1" className="border p-2 text-right">
                  ₹ {inv.rows.reduce((sum, row) => sum + Number(row.mrp), 0)}
                </td> */}
                <td className="border p-2 text-right">
                  {inv.rows.reduce((sum, row) => sum + Number(row.qty || 0), 0)}
                </td>
                <td></td>
                <td className="border p-2 text-right">₹ {discountAm}</td>
                <td
                  colSpan={inv.customerAndInvoice.GSTType === "GST" ? 2 : 1}
                ></td>

                {inv.customerAndInvoice.GSTType === "GST" && (
                  <td className="border p-2 text-right">₹ {totalgstAmount}</td>
                )}
                <td className="border p-2 text-right">
                  ₹{" "}
                  {parseFloat(
                    inv.rows.reduce(
                      (sum, row) => sum + Number(row.sellingPrice || 0),
                      0
                    )
                  ).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* Summary Section */}
        <div className="mt-4 overflow-x-auto">
          <div className="flex flex-col md:flex-row justify-between">
            {/* Insta Scan QR */}
            <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
              <p className="text-sm md:text-base font-semibold mb-2">
                Follow us
              </p>
              <img
                src={instaScnan}
                alt="Insta QR"
                className="w-24 h-24 sm:w-28 sm:h-48 md:w-48 md:h-48 object-contain"
              />
            </div>

            {/* Summary Table */}
            <div className="w-full md:w-1/3">
              <table className="w-full border text-sm md:text-base">
                <tbody>
                  <tr>
                    <td className="border px-3 py-2 font-semibold">
                      Sub Total
                    </td>
                    <td className="border px-3 py-2 text-right">
                      ₹ {inv.totalDetails.total}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3 py-2 font-semibold">Discount</td>
                    <td className="border px-3 py-2 text-right">
                      ₹ {discountAm}
                    </td>
                  </tr>
                  {inv.customerAndInvoice.GSTType === "GST" && (
                    <>
                      <tr>
                        <td className="border px-3 py-2 font-semibold">SGST</td>
                        <td className="border px-3 py-2 text-right">
                          ₹ {sgst}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2 font-semibold">CGST</td>
                        <td className="border px-3 py-2 text-right">
                          ₹ {cgst}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="bg-gray-100 font-bold text-blue-700">
                    <td className="border px-3 py-2">Total</td>
                    <td className="border px-3 py-2 text-right">
                      ₹ {inv.totalDetails.roundOff}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3 py-2 font-semibold">
                      Round Off
                    </td>
                    <td className="border px-3 py-2 text-right font-semibold">
                      ₹ {inv.totalDetails.roundOff}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3 py-2 font-semibold">Received</td>
                    <td className="border px-3 py-2 text-right font-semibold">
                      ₹ {inv.totalDetails.receive}
                    </td>
                  </tr>
                  <tr className="bg-gray-100 font-bold text-red-700">
                    <td className="border px-3  py-2 font-semibold">Balance</td>
                    <td className="border px-3 py-2 text-right">
                      ₹{" "}
                      {Number(
                        parseInt(inv.totalDetails.roundOff) -
                          Number(inv.totalDetails.receive)
                      ).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="text-green-600 font-bold">
                    <td className="border px-3 py-2">You Saved</td>
                    <td className="border px-3 py-2 text-right">
                      ₹ {discountAm}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invoice Amount In Words */}
        {/* Invoice Amount In Words */}
        <div className="mt-4 p-4 text-center md:text-left">
          <p>
            <strong className="text-red-600">Invoice Amount In Words:</strong>
          </p>
          <p>
            {inv.totalDetails.roundOff
              ? numberToWords(parseInt(inv.totalDetails.roundOff))
              : "N/A"}
          </p>
        </div>

        {/* Terms and Conditions */}
        <div className="mt-4 p-4 border-t text-center md:text-left">
          <p className="font-bold text-red-600">Terms And Conditions</p>
          <p>No return nor refund.</p>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col justify-end items-center md:items-end text-center md:text-right">
          <p className="mb-1">For: The Brand Emporium Enterprise</p>
          <img src={sign} alt="Authorized Sign" className="h-16 mb-1" />
          <p className="font-bold">Authorized Signatory</p>
        </div>

        {/* Download Button */}
        <div className="mt-4 p-4 text-center md:text-left" id="download-button">
          <button
            onClick={() => {
              const downloadBtn = document.getElementById("download-button");

              downloadBtn.classList.add("hidden");
              setTimeout(() => {
                pdf();
                downloadBtn.classList.remove("hidden");
              }, 300);
            }}
            className="hover:text-blue-600 font-semibold"
          >
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceBill;
