import axios from "axios";
import { handleError, handleSuccess } from "./utils";
import { base_url } from "./BASEURL";

const BASE_URL = `${base_url}category`;

export const getAllCategory = async () => {
  try {
    const response = await axios.get(BASE_URL);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    return "";
  }
};

export const categoryById = async (id) => {
  const url = `${BASE_URL}/${id}`;
  try {
    const response = await axios.get(url);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    return "";
  }
};
export const categoryInsert = async (categoryData) => {
  try {
    const res = await axios.post(BASE_URL, categoryData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { data } = res;

    if (data.success) {
      return data;
    }
  } catch (err) {}
};
