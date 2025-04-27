import React, { useContext } from "react";
import Layout from "../../components/Layout";
import ItemsList from "../../components/ItemsList";

function Items() {
  return (
    <Layout>
      <div className="overflow-hidden">
        <ItemsList />
      </div>
    </Layout>
  );
}

export default Items;
