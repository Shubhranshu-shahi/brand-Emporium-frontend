  import React, { useEffect } from "react";
  import { useLocation, useNavigate } from "react-router-dom";
  import { handleSuccess } from "../assets/helper/utils";

  function RefreshHandler({ setIsAuthenticated }) {
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
      if (localStorage.getItem("token")) {
        setIsAuthenticated(true);

        if (location.pathname === "/login" || location.pathname === "/") {
          navigate("/dashboard", { replace: false });
        }
      }
    }, [setIsAuthenticated, location.pathname, navigate]);

    return null;
  }

  export default RefreshHandler;
