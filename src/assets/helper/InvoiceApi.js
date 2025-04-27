import axios from "axios";
import { handleError, handleSuccess } from "./utils";
import { base_url } from "./BASEURL";

const BASE_URL = `${base_url}invoice`;
export const invoiceInsert = async (invoiceData) => {
  try {
    const res = await axios.post(BASE_URL, invoiceData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { data } = res;
    if (data.success) {
      handleSuccess(data.message);
      return data;
    }
  } catch (err) {
    handleError(err?.response?.data?.message);
  }
};

export const invoiceGenrate = async (id) => {
  const url = `${BASE_URL}/${id}`;
  try {
    const response = await axios.get(url);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return err.message;
  }
};

export const getAllInvoice = async () => {
  try {
    const res = await axios.get(BASE_URL);

    return res.data.data;
  } catch (err) {
    return err.message;
  }
};

export const invoiceDelete = async (id) => {
  try {
    const url = `${BASE_URL}/${id}`;
    const response = await axios.delete(url);
    handleSuccess(response.data.message);
    return response;
  } catch (err) {
    return err.message;
  }
};

export const fetchInvoicesByInvoiceNumbers = async (invoiceNumbers) => {
  const url = `${BASE_URL}/invoice-numbers`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invoiceNumbers }),
    });

    const json = await res.json();
    const returnData = JSON.stringify({ json });
    return json.data || [];
  } catch (err) {}
};

export const SearchInvoiceByProductId = async (selectedProduct) => {
  const url = `${BASE_URL}/product-id`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedProduct }),
    });

    const json = await res.json();
    const returnData = JSON.stringify({ json });
    return json.data || [];
    // return res.data.data;
  } catch (err) {}
};

export const updateInvoice = async (id, data) => {
  try {
    const url = `${BASE_URL}/${id}`;

    const res = await axios.put(url, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    return null;
  }
};
