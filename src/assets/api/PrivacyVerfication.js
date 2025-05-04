import axios from "axios";
import { base_url } from "./BASEURL";

const BASE_URL = `${base_url}auth/privacy-auth`;
export const privacyVerf = async (user) => {
  try {
    const res = await axios.post(BASE_URL, user, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Error verifying:", error);
    return null;
  }
};
