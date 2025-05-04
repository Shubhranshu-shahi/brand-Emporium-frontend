import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HeaderNav from "./HeaderNav";
import SideNavTest from "./SideNav";
import axios from "axios";
import { privacyVerf } from "../assets/api/PrivacyVerfication";
import { useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../assets/api/utils";
import { FullPageLoader } from "./FullPageLoader";
import { Eye, EyeOff } from "lucide-react";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(null); // null initially
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [contentHidden, setContentHidden] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Detect screen size and sync with localStorage
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const storedValue = localStorage.getItem("SideNavCollapsed");

    const isMobile = mediaQuery.matches;
    if (localStorage.getItem("privacy") === "true") {
      setContentHidden(true);
    }

    // on mobile, force collapsed
    if (isMobile) {
      setCollapsed(true);
    } else {
      //use localStorage or default to false
      setCollapsed(storedValue === "true");
    }

    // auto-collapse on resize to mobile
    const handleResize = (e) => {
      if (e.matches) {
        setCollapsed(true);
      }
    };

    mediaQuery.addEventListener("change", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  // Prevent rendering until we know `collapsed`
  if (collapsed === null) return null;

  const privercyVefication = async () => {
    setLoading(true);
    try {
      const user = {
        name: localStorage.getItem("loggedInUser"),
        email: localStorage.getItem("email"),
        password,
      };
      const res = await privacyVerf(user);
      if (res && res.success) {
        setContentHidden(false);
        localStorage.setItem("privacy", "false");
      } else {
        handleError("Wrong Password");
      }
    } catch (error) {
    } finally {
      setPassword("");
      setDropdownOpen(false);
      setLoading(false);
    }
  };

  const signOutHandler = () => {
    setLoading(true);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("email");

      handleSuccess("Sign out successful");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch {
      console.log("Some Issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen relative">
      {loading && <FullPageLoader />}
      <HeaderNav
        setContentHidden={setContentHidden}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        signOutHandler={signOutHandler}
      />
      <SideNavTest collapsed={collapsed} setCollapsed={setCollapsed} />

      {contentHidden && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-100 flex justify-center items-center"
        >
          <div className="flex flex-col items-center gap-4 p-4 bg-white/10 rounded-lg">
            {/* Password Input */}
            <div className="relative w-64">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border text-white bg-black/40 placeholder-gray-300 rounded-lg pr-10 pl-4 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white"
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <button
                onClick={privercyVefication}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md w-40"
              >
                Show Content
              </button>
              <button
                onClick={signOutHandler}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md w-40"
              >
                Log Out
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <motion.main
        animate={{ marginLeft: collapsed ? "4.5rem" : "16rem" }}
        transition={{ duration: 0.3 }}
        className="mt-16 flex-1 overflow-x-hidden"
      >
        {children}
      </motion.main>
    </div>
  );
}
