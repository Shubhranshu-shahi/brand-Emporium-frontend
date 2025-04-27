import axios from "axios";
import { handleError, handleSuccess } from "./utils";
import { base_url } from "./BASEURL";

const BASE_URL = `${base_url}customer`;

export const customerByPhone = async (phone) => {
  const url = `${BASE_URL}/${phone}`;
  try {
    const response = await axios.get(url);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return "";
  }
};
export const customerInsert = async (customerData) => {
  try {
    const res = await axios.post(BASE_URL, customerData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { data } = res;

    if (data.success) {
      handleSuccess(data.message);
      return data.data;
    }
  } catch (err) {
    handleError(err?.response?.data?.message);
  }
};
export const getAllCustomer = async () => {
  try {
    const res = await axios.get(BASE_URL);

    return res.data.data;
  } catch (err) {
    return err.message;
  }
};
export const customerDelete = async (id) => {
  try {
    const url = `${BASE_URL}/${id}`;
    const response = await axios.delete(url);

    return response.data;
  } catch (err) {
    return err.message;
  }
};
export const customerUpdate = async (id, customerData) => {
  try {
    const url = `${BASE_URL}/${id}`;
    const res = await axios.put(url, customerData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { data } = res;

    if (data.success) {
      handleSuccess(data.message);
      return data.data;
    }
  } catch (err) {
    handleError(err?.response?.data?.message);
  }
};
