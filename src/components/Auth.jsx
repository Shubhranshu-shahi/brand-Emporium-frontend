import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeClosed, CheckCircle, EyeOff } from "lucide-react";
import { handleError, handleSuccess } from "../assets/api/utils";
import { sendOtp, verifyOtp } from "../assets/api/otp";
import { login, signup, updatePass, userExites } from "../assets/api/login";
import { FullPageLoader } from "./FullPageLoader";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [forgetPassword, setForgetPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newpassword, setNewPassword] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [errors, setErrors] = useState({});

  const [authvals, setAuthVals] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAuthVals({ ...authvals, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const submitHandle = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(authvals);
        if (res.success) {
          handleSuccess("Login Successful");
          localStorage.setItem("token", res.jwtToken);
          localStorage.setItem("loggedInUser", res.name);
          localStorage.setItem("email", res.email);
          navigate("/dashboard");
        } else {
          handleError(res.message);
        }
      } else {
        const res = await signup(authvals);
        if (res.success) {
          handleSuccess("Sign Up Successful");

          setAuthVals({ name: "", email: "", password: "" });
          setOtp("");
          setNewPassword("");
          setIsLogin(true);
        } else {
          handleError(res.message || "Signup failed.");
        }
      }
    } catch (err) {
      handleError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const sendOtpHandler = async (flag) => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      if (flag === 1) {
        const res = await userExites(authvals.email);
        if (res.success) {
          handleSuccess("User already exists, please login.");
          return;
        }
      }

      const res = await sendOtp(authvals.email);
      if (res.success) {
        handleSuccess("OTP sent to your email");
        setSentOtp(true);
        setOtpCountdown(60);
      } else {
        handleError(res.message || "Failed to send OTP");
      }
    } catch {
      handleError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    const newErrors = {};

    if (!authvals.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(authvals.email)) {
        newErrors.email = "Enter a valid email address";
      }
    }

    if (
      !forgetPassword &&
      (!authvals.password || authvals.password.length < 6)
    ) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin && !forgetPassword && !authvals.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (forgetPassword && sentOtp && (!newpassword || newpassword.length < 6)) {
      newErrors.newpassword = "New password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const OtpChangeHandle = async (e) => {
    const { value } = e.target;
    setOtp(value);
    if (value.length === 6) {
      try {
        const res = await verifyOtp(authvals.email, value);
        if (res.success) {
          handleSuccess("OTP verified successfully");
          setOtpVerified(true);
          setNewPassword("");
        } else {
          handleError("Invalid OTP.");
        }
      } catch {
        handleError("Error verifying OTP.");
      }
    }
  };

  const resetPasswordHandler = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      const res = await updatePass({
        email: authvals.email,
        password: newpassword,
      });
      if (res.success) {
        handleSuccess(res.message);
        setForgetPassword(false);
        setSentOtp(false);
        setOtpVerified(false);
        setAuthVals({ name: "", email: "", password: "" });
        setOtp("");
        setNewPassword("");
      } else {
        handleError(res.message);
      }
    } catch {
      handleError("Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      {loading && <FullPageLoader />}

      <div className="w-full max-w-md p-8 space-y-4 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">
          {forgetPassword ? "Reset Password" : isLogin ? "Login" : "Sign Up"}
        </h2>

        <form className="space-y-4" onSubmit={submitHandle}>
          {!isLogin && !forgetPassword && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Username"
                value={authvals.name}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-sm text-red-400 mt-1 ml-1">{errors.name}</p>
              )}
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={authvals.email}
            onChange={handleChange}
            // required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && (
            <p className="text-sm text-red-400 mt-1 ml-1">{errors.email}</p>
          )}

          {forgetPassword && (
            <>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  name="newpassword"
                  value={newpassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);

                    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
                  }}
                  className="w-full p-3 pr-12 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white"
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
              </div>
              {errors.newpassword && (
                <p className="text-sm text-red-400 mt-1 ml-1">
                  {errors.newpassword}
                </p>
              )}
              <div className="relative">
                <input
                  type="text"
                  name="otp"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={OtpChangeHandle}
                  className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {otpVerified && (
                  <span className="absolute inset-y-0 right-3 flex items-center text-green-500">
                    <CheckCircle size={20} />
                  </span>
                )}
              </div>
            </>
          )}

          {!forgetPassword && (
            <>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  value={authvals.password}
                  onChange={handleChange}
                  className="w-full p-3 pr-12 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white"
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 mt-1 ml-1">
                  {errors.password}
                </p>
              )}
            </>
          )}

          {/* OTP button in signup */}
          {!isLogin && !forgetPassword && (
            <>
              {sentOtp && (
                <div className="relative">
                  <input
                    type="text"
                    name="otp"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={OtpChangeHandle}
                    className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {otpVerified && (
                    <span className="absolute inset-y-0 right-3 flex items-center text-green-500">
                      <CheckCircle size={20} />
                    </span>
                  )}
                </div>
              )}
              <button
                type="button"
                disabled={otpCountdown > 0}
                onClick={() => sendOtpHandler(1)}
                className={`w-full flex justify-center items-center gap-2 p-3 font-semibold text-white rounded-lg ${
                  otpCountdown > 0
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : "Send OTP"}
              </button>
            </>
          )}

          {forgetPassword ? (
            <>
              <button
                type="button"
                disabled={otpCountdown > 0 && !newpassword}
                onClick={() => {
                  sendOtpHandler(0);
                }}
                className={`w-full flex justify-center items-center gap-2 p-3 font-semibold text-white rounded-lg ${
                  otpCountdown > 0
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : "Send OTP"}
              </button>
              <button
                type="button"
                onClick={resetPasswordHandler}
                disabled={!sentOtp || !otpVerified}
                className={`w-full p-3 font-semibold rounded-lg ${
                  !sentOtp || !otpVerified
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Reset Password
              </button>
            </>
          ) : isLogin ? (
            <button
              type="submit"
              className="w-full p-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          ) : (
            <button
              type="submit"
              disabled={!otpVerified}
              className={`w-full p-3 font-semibold rounded-lg ${
                !otpVerified
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Sign Up
            </button>
          )}
        </form>

        {/* Forgot password link */}
        {isLogin && (
          <p className="text-center text-gray-400">
            <button
              className="text-blue-400 hover:underline"
              onClick={() => setForgetPassword(!forgetPassword)}
            >
              {forgetPassword ? "Back to Login" : "Forgot Password?"}
            </button>
          </p>
        )}

        {/* Toggle login/signup */}
        {!forgetPassword && (
          <p className="text-center text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:underline ml-1"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        )}

        {/* OTP info */}
        {forgetPassword && (
          <p className="text-center text-gray-400">
            {sentOtp
              ? "An OTP has been sent to your email."
              : "An OTP will be sent to your email."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;
