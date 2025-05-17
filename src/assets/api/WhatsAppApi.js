import axios from "axios";
import { base_url } from "./BASEURL";

export const sendInvoiceUsingWA = async (params) => {
  try {
    const BAST_URL = `${base_url}Wa/send`;
    const res = await axios.post(BAST_URL, {
      params,
    });
    return res.data;
    console.log(res.data);
  } catch (err) {}
};

export const sendStockUpdatesNum = async (WastocksData) => {
  try {
    const BASE_URL = `${base_url}Wa/stock`;
    console.log(WastocksData);
    const res = await axios.post(BASE_URL, {
      WastocksData,
    });
    return res.data;
  } catch (err) {}
};
