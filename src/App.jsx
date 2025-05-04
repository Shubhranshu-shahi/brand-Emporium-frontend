import React, { createContext, useState } from "react";

import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Sales from "./assets/pages/Sales";

import Reports from "./assets/pages/Reports";
import Dashboad from "./assets/pages/Dashboad";

import Items from "./assets/pages/Items";
import Parties from "./assets/pages/Parties";

import AddItem from "./assets/pages/AddItem";

import AuthPage from "./assets/pages/AuthPage";
import { ToastContainer } from "react-toastify";

import RefreshHandler from "./components/RefreshHandler";

import Invoice from "./assets/pages/Invoice";

import EditSales from "./assets/pages/EditSales";
import EditItems from "./assets/pages/EditItems";
import InvoiceTest from "./assets/pages/InvoiceTest";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const PrivateRoute = ({ element }) => {
    const isAuthenticated = localStorage.getItem("token");

    // If not authenticated, redirect to login page, otherwise show the element (route)
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  };
  return (
    <div>
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
      <ToastContainer />

      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/test" element={<InvoiceTest />} />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/dashboard"
          element={<PrivateRoute element={<Dashboad />} />}
        />

        <Route
          path="/parties"
          element={<PrivateRoute element={<Parties />} />}
        />
        <Route path="/sales" element={<PrivateRoute element={<Sales />} />} />
        <Route path="/items" element={<PrivateRoute element={<Items />} />} />
        <Route
          path="/reports"
          element={<PrivateRoute element={<Reports />} />}
        />
        <Route
          path="/items/add-item"
          element={<PrivateRoute element={<AddItem />} />}
        />
        <Route path="/invoice/:id" element={<Invoice />} />
        <Route path="/edit-invoice/:invoiceNumber" element={<EditSales />} />
        <Route path="/edit-item/:product" element={<EditItems />} />
      </Routes>
    </div>
  );
}

export default App;
