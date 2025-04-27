import React from "react";
import Layout from "../../components/Layout";
import EditAddItemForm from "../../components/EditAddItemForm";
import { useLocation } from "react-router-dom";

function EditItems() {
  const { state } = useLocation();

  return (
    <Layout>
      <div className="overflow-hidden">
        <EditAddItemForm state={state} />
      </div>
    </Layout>
  );
}

export default EditItems;
