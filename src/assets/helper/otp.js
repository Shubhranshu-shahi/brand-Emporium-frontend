import axios from "axios";
import { base_url } from "./BASEURL";

const BASE_URL = `${base_url}otp`;

export const sendOtp = async (email) => {
  try {
    const url = `${BASE_URL}/send-otp`;
    const res = await axios.post(
      url,
      {
        email,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};
export const verifyOtp = async (email, otp) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/verify-otp`,
      { email, otp },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};
