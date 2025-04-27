import React from "react";
import AddItemForm from "../../components/AddItemForm";

import Layout from "../../components/Layout";

function AddItem() {
  return (
    <Layout>
      <div className="p-4">
        <AddItemForm />
      </div>
    </Layout>
  );
}

export default AddItem;
