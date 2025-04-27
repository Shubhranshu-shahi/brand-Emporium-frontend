import { Barcode, Pen, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import BarcodeImage from "./BarcodeImage";
import { productInsert } from "../assets/helper/productApi";
import { genrateBarcode } from "../assets/helper/Helpers";
import { categoryInsert, getAllCategory } from "../assets/helper/category";
import { handleError, handleSuccess } from "../assets/helper/utils";

const BarcodeModal = ({ itemCode, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Barcode Generated</h2>
        <BarcodeImage itemCode={itemCode} />
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function AddItemForm() {
  const initialFormState = {
    itemName: "",
    itemHSN: "",
    category: "",
    itemCode: "",
    mrp: "",
    salePrice: "",
    taxSale: "0",
    discountSale: "",
    purchasePrice: "",
    taxPurchase: "0",
    generalTax: "0",
    sellingPrice: "",
    purchasedPrice: "",
    discountAmount: "",
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: initialFormState });

  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const mrp = parseFloat(watch("mrp") || 0);
  const discount = parseFloat(watch("discountSale") || 0);
  const taxSale = parseFloat(watch("taxSale") || 0);
  const taxPurchase = parseFloat(watch("taxPurchase") || 0);
  const purchasePrice = parseFloat(watch("purchasePrice") || 0);

  useEffect(() => {
    const discountedPrice = mrp - (mrp * discount) / 100;
    const sellingPrice = discountedPrice - (discountedPrice * taxSale) / 100;
    const purchasedPrice = purchasePrice + (purchasePrice * taxPurchase) / 100;

    setValue("salePrice", sellingPrice.toFixed(2));
    setValue("sellingPrice", discountedPrice.toFixed(2));
    setValue("discountAmount", (mrp - discountedPrice).toFixed(2));
    setValue("purchasedPrice", purchasedPrice.toFixed(2));
  }, [mrp, discount, taxSale, purchasePrice, taxPurchase, setValue]);

  useEffect(() => {
    getAllCategory().then((res) => {
      const names = res.map((cat) => cat.categoryName);
      setCategories(names);
    });
  }, []);

  const catInsert = async (categoryName) => {
    if (!categories.includes(categoryName.categoryName)) {
      return await categoryInsert(categoryName);
    }
  };

  const onSubmit = async (data) => {
    await catInsert({ categoryName: data.category });
    await productInsert(data);
  };

  const handleSaveNew = async (data) => {
    await catInsert({ categoryName: data.category });
    await productInsert(data);

    reset();
    const refreshedCategories = await getAllCategory();
    const names = refreshedCategories.map((cat) => cat.categoryName);
    setCategories(names);
    setIsGenerated(false);
  };

  const barCodeHandler = () => {
    const newCode = genrateBarcode();
    setValue("itemCode", newCode);
    setIsGenerated(true);
  };

  return (
    <div className="flex-1 p-3">
      <div className="bg-gray-50 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Add Item</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid bg-white p-6 rounded-2xl shadow-lg grid-cols-2 gap-4 mb-4 text-gray-600">
            <div>
              <input
                type="text"
                placeholder="Item Name *"
                className="w-full p-2 border rounded"
                {...register("itemName", { required: "Item Name is required" })}
              />
              {errors.itemName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.itemName.message}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Item HSN"
                  className="w-full p-2 border rounded"
                  {...register("itemHSN")}
                />
                <button
                  type="button"
                  className="bg-blue-500 text-white px-3 py-2 rounded"
                >
                  <Search />
                </button>
              </div>
            </div>
            <div>
              <input
                list="category-list"
                placeholder="Category"
                {...register("category", { required: "Category is required" })}
                className="w-full p-2 border rounded"
              />
              {errors.category && (
                <p className="text-red-500 text-sm">
                  {errors.category.message}
                </p>
              )}
              <datalist id="category-list">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Item Code"
                  {...register("itemCode", {
                    required: "Item Code is required",
                    minLength: {
                      value: 8,
                      message: "Item Code must be at least 8 characters",
                    },
                  })}
                  className={`w-full p-2 border rounded${
                    errors.itemCode ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  className="bg-blue-500 text-white px-3 py-2 rounded"
                  onClick={barCodeHandler}
                  disabled={watch("itemCode") !== ""}
                >
                  <Barcode />
                </button>
                {isGenerated && (
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-500 text-white rounded"
                    onClick={() => setModalOpen(true)}
                  >
                    <Pen />
                  </button>
                )}
              </div>
              {errors.itemCode && (
                <p className="text-red-500 text-sm">
                  {errors.itemCode.message}
                </p>
              )}
            </div>
          </div>
          <BarcodeModal
            itemCode={watch("itemCode")}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
          />

          {/* Pricing Section */}
          <div className="mb-4">
            <button className="text-red-500 border-b-2 border-red-500 px-4 py-2">
              Pricing
            </button>
          </div>

          <div className="grid grid-cols-3 mb-4 gap-4 rounded-2xl shadow-lg bg-white p-6 text-gray-700">
            <div>
              <input
                type="text"
                {...register("mrp", { required: "MRP is required" })}
                placeholder="MRP"
                className="w-full p-2 border rounded"
              />
              {errors.mrp && (
                <p className="text-red-500 text-sm col-span-3">
                  {errors.mrp.message}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                {...register("discountSale")}
                placeholder="Disc. on MRP"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 rounded-2xl shadow-lg bg-white p-6 text-gray-700">
            <input
              type="text"
              {...register("salePrice")}
              placeholder="Sale Price"
              className="w-full p-2 border rounded"
            />
            <select
              {...register("taxSale")}
              className="w-full text-gray-700 p-2 h-10 border rounded"
            >
              <option value="0">0</option>
              <option value="5">5</option>
              <option value="12">12</option>
              <option value="18">18</option>
              <option value="28">28</option>
            </select>
            <input
              type="text"
              readOnly
              {...register("sellingPrice")}
              placeholder="Sell At"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 rounded-2xl shadow-lg bg-white p-6 text-gray-700">
            <input
              type="text"
              {...register("purchasePrice")}
              placeholder="Purchase Price"
              className="w-full p-2 border rounded"
            />
            <select
              {...register("taxPurchase")}
              className="w-full text-gray-700 p-2 h-10 border rounded"
            >
              <option value="0">0</option>
              <option value="5">5</option>
              <option value="12">12</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="22">22</option>
            </select>
            <input
              type="text"
              readOnly
              {...register("purchasedPrice")}
              placeholder="Purchased At"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mt-4 text-right">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              onClick={handleSubmit(handleSaveNew)}
            >
              Save & New
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItemForm;
