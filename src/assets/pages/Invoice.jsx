import React from "react";
import InvoiceBill from "../../components/InvoiceBill";
import { useLocation } from "react-router-dom";
import { usePDF } from "react-to-pdf";

const Invoice = () => {
  const location = useLocation();
  const id = location.pathname.split("/").pop();

  const { toPDF, targetRef } = usePDF({
    filename: `${id}-invoice.pdf`,
    options: {
      orientation: "landscape",
      unit: "px",
      format: [1600, 1200], // Increase size to fit everything in one page
    },
    canvas: {
      scale: 2, // Improve quality
    },
  });

  return (
    <>
      <div ref={targetRef} className="bg-white p-4">
        <InvoiceBill id={id} pdf={toPDF} />
      </div>
      {/* <div className="flex justify-end pt-2">
        <button
          onClick={toPDF}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download PDF
        </button>
      </div> */}
    </>
  );
};

export default Invoice;
