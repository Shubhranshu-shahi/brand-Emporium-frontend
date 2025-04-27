import React from "react";
import Layout from "../../components/Layout";
import RevenueGraphWithSummary from "../../components/RevenueGraphWithSummary";

function Dashboard() {
  return (
    <Layout>
      <div className="overflow-hidden">
        <RevenueGraphWithSummary />
      </div>
    </Layout>
  );
}

export default Dashboard;
