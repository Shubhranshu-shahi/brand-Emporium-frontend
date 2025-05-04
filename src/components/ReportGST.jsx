import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { currentDate, dateToString } from "../assets/api/Helpers";

function ReportGST({ invoices, title, flag }) {
  const exportGSTItemsToExcel = async (invoices = [], exportFlag) => {
    if (!Array.isArray(invoices)) {
      console.error("Expected an array of invoices but got:", invoices);
      return;
    }

    const gstItems = [];
    invoices.forEach((invoice) => {
      invoice.rows?.forEach((item) => {
        if (exportFlag == 1) {
          if (invoice.GSTType === "GST" && parseFloat(item.taxSale) > 0) {
            gstItems.push({
              InvoiceNumber: invoice.invoiceNumber,
              InvoiceDate: dateToString(invoice.invoiceDate),
              CustomerName: invoice.customerName,
              Phone: invoice.phone,
              ItemCode: item.itemCode,
              HSN: item.HSN || "",
              ItemName: item.itemName,
              Quantity: item.qty,
              MRP: item.mrp,
              SalePrice: item.salePrice,
              TaxableAmount: item.taxAmount,
              TaxPercent: item.taxSale,
              DiscountAmount: item.discountAmount,
              DiscountPercentage: item.discountSale,
              CGST: parseFloat(item.taxAmount / 2).toFixed(2) || 0,
              SGST: parseFloat(item.taxAmount / 2).toFixed(2) || 0,
              IGST: item.IGST || 0,
              Total: item.sellingPrice,
            });
          }
        } else {
          gstItems.push({
            InvoiceNumber: invoice.invoiceNumber,
            InvoiceDate: dateToString(invoice.invoiceDate),
            CustomerName: invoice.customerName,
            Phone: invoice.phone,
            ItemCode: item.itemCode,
            HSN: item.HSN || "",
            ItemName: item.itemName,
            Quantity: item.qty,
            MRP: item.mrp,
            SalePrice: item.salePrice,
            TaxableAmount: item.taxAmount,
            TaxPercent: item.taxSale,
            DiscountAmount: item.discountAmount,
            DiscountPercentage: item.discountSale,
            CGST: parseFloat(item.taxAmount / 2).toFixed(2) || 0,
            SGST: parseFloat(item.taxAmount / 2).toFixed(2) || 0,
            IGST: item.IGST || 0,
            Total: item.sellingPrice,
          });
        }
      });
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("GST Report");

    // Add Header Row
    worksheet.columns = Object.keys(gstItems[0] || {}).map((key) => ({
      header: key,
      key: key,
      width: 20,
    }));

    // Add Data Rows
    gstItems.forEach((item) => {
      worksheet.addRow(item);
    });

    // Style the header
    worksheet.getRow(1).font = { bold: true };

    // Create a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const filename =
      (exportFlag === 1 ? "GST_Report_" : "All_Report_") +
      currentDate() +
      ".xlsx";

    saveAs(blob, filename);
  };

  return (
    <div>
      <button
        onClick={() => exportGSTItemsToExcel(invoices, flag)}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
      >
        {title}
      </button>
    </div>
  );
}

export default ReportGST;
