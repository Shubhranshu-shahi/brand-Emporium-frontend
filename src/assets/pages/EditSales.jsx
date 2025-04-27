import React from "react";
import Layout from "../../components/Layout";
import EditSalesForm from "../../components/EditSalesForm";
import { useParams } from "react-router-dom";

function EditSales() {
  const { invoiceNumber } = useParams();

  return (
    <Layout>
      <div className="overflow-hidden">
        <EditSalesForm invoiceNumber={invoiceNumber} />
      </div>
    </Layout>
  );
}

export default EditSales;
