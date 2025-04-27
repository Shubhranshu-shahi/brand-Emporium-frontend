import { motion } from "framer-motion";
import {
  Home,
  Users,
  Box,
  ShoppingCart,
  BarChart,
  ArrowLeft,
  ArrowRight,
  Shirt,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

export default function SideNav({ collapsed, setCollapsed }) {
  const navItems = [
    { path: "/dashboard", icon: <Home />, label: "Dashboard" },
    { path: "/parties", icon: <Users />, label: "Parties" },
    { path: "/items", icon: <Shirt />, label: "Items" },
    { path: "/sales", icon: <ShoppingCart />, label: "Sales" },
    { path: "/reports", icon: <BarChart />, label: "Reports" },
  ];

  const location = useLocation();

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("SideNavCollapsed", collapsed);
  }, [collapsed]);

  // 🧠 Prevent animation on first render
  const hasMounted = useRef(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? "4.5rem" : "16rem" }}
      transition={{
        duration: hasMounted.current ? 0.3 : 0, // skip animation on first render
      }}
      onAnimationComplete={() => {
        hasMounted.current = true;
      }}
      className="bg-gray-900 text-white p-4 h-full fixed top-16 left-0 z-40"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-4 text-xl hover:bg-gray-700 p-2 rounded-full transition-all duration-300"
      >
        {collapsed ? <ArrowRight /> : <ArrowLeft />}
      </button>

      <nav className="flex flex-col space-y-2">
        {navItems.map(({ icon, label, path }, index) => {
          const isActive = location.pathname.startsWith(path);

          return (
            <Link to={path} key={index} title={collapsed ? label : ""}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`flex items-center space-x-4 p-2 rounded transition-all ${
                  isActive
                    ? "bg-gray-700 text-blue-300 font-semibold"
                    : "hover:bg-gray-700"
                }`}
              >
                <div className="text-xl w-6 flex justify-center">{icon}</div>
                {!collapsed && <span>{label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
