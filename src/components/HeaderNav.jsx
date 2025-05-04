import { motion } from "framer-motion";
import {
  LogOut,
  Shield,
  User,
  Menu,
  X,
  PlusCircle,
  ShoppingCart,
} from "lucide-react";
import logo from "../img/logo.jpeg";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { handleSuccess } from "../assets/api/utils";
import admin from "../img/admin.jpg";
import user2 from "../img/user2.jpeg";

export default function HeaderNav({
  setContentHidden,
  dropdownOpen,
  setDropdownOpen,
  signOutHandler,
}) {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setLoggedInUser(localStorage.getItem("loggedInUser"));
  }, []);

  const privacyhandler = () => {
    setContentHidden(true);
    localStorage.setItem("privacy", "true");
  };

  return (
    <header className="bg-[#0f1215] text-white px-4 py-3 flex justify-between items-center w-full fixed top-0 left-0 z-50">
      <div className="flex items-center space-x-3">
        <img
          src={logo}
          alt="Logo"
          className="w-12 h-12 object-contain rounded-xl shadow-md "
        />
        <span className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 text-transparent bg-clip-text font-sans">
          The Brand Emporium
        </span>
      </div>

      {/* Desktop nav buttons */}
      <div className="hidden md:flex items-center space-x-4">
        <Link
          to="/items/add-item"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
        >
          <PlusCircle size={18} /> Add Item
        </Link>
        <Link
          to="/sales"
          className="flex items-center justify-center gap-2 px-2 py-2 w-30 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
        >
          <ShoppingCart size={18} /> Sale
        </Link>
        <div className="relative">
          <img
            src={
              loggedInUser === "admin" ||
              loggedInUser === "Admin" ||
              loggedInUser === "yash" ||
              loggedInUser === "Yash"
                ? admin
                : user2
            }
            alt="User"
            className="rounded-full w-10 h-10 cursor-pointer object-cover border-2 border-white shadow-md profile-pic"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded text-black z-50"
            >
              {loggedInUser && (
                <button className="flex items-center w-full px-4 py-2 hover:bg-gray-200">
                  <User className="w-5 h-5 mr-2" /> {loggedInUser}
                </button>
              )}
              <button
                className="flex items-center w-full px-4 py-2 hover:bg-gray-200"
                onClick={() => privacyhandler()}
              >
                <Shield className="w-5 h-5 mr-2" /> Privacy
              </button>
              <button
                className="flex items-center w-full px-4 py-2 hover:bg-gray-200"
                onClick={signOutHandler}
              >
                <LogOut className="w-5 h-5 mr-2" /> Sign Out
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Nav Toggle */}
      <div className="md:hidden">
        <button onClick={() => setNavOpen(!navOpen)}>
          {navOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown nav */}
      {navOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          transition={{ duration: 0.3 }}
          className="absolute top-16 left-[4.3rem] right-0 bg-[#1a1d21] shadow-md z-40 flex flex-col space-y-2 px-4 py-4 text-white md:hidden"
        >
          <button
            onClick={() => {
              navigate("/items/add-item");
              setNavOpen(false);
            }}
            className="w-full text-left px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Add Item
          </button>
          <button
            onClick={() => {
              navigate("/sales");
              setNavOpen(false);
            }}
            className="w-full text-left px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Add Sale
          </button>
          <button
            onClick={() => {
              setContentHidden(true);
              setNavOpen(false);
            }}
            className="w-full text-left px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            Privacy
          </button>
          <button
            onClick={signOutHandler}
            className="w-full text-left px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
          >
            Sign Out
          </button>
        </motion.div>
      )}
    </header>
  );
}
