import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { customerByPhone, customerInsert } from "../assets/api/customerApi";
import { handleError } from "../assets/api/utils";

export const AddPartyModal = ({ isOpen, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      CustomerGstin: "",
    },
  });

  const phone = watch("phone");

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    const checkPhone = async () => {
      if (/^\d{10}$/.test(phone)) {
        const cust = await customerByPhone(phone);
        if (cust) {
          handleError("Customer exists");
          setValue("customerName", cust.customerName || "");
          setValue("email", cust.email || "");
          setValue("CustomerGstin", cust.CustomerGstin || "");
        }
      }
    };
    checkPhone();
  }, [phone, setValue]);

  const onSubmit = async (data) => {
    const cust = await customerByPhone(data.phone);
    if (cust) {
      handleError("Customer already exists");
      return;
    }

    const safeData = {
      ...data,
      invoiceNumber: [],
      invoiceDate: [],
    };

    const inserted = await customerInsert(safeData);
    onSave(inserted);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Party</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              {...register("phone", {
                required: "Phone is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Enter a valid 10-digit phone",
                },
              })}
              className="w-full mt-1 px-4 py-2 border rounded-lg text-sm"
              placeholder="Enter phone number"
              maxLength={10}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Party Name
            </label>
            <input
              {...register("customerName", {
                required: "Party name is required",
              })}
              className="w-full mt-1 px-4 py-2 border rounded-lg text-sm"
              placeholder="Enter party name"
            />
            {errors.customerName && (
              <p className="text-sm text-red-500">
                {errors.customerName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              {...register("email", {
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email address",
                },
              })}
              className="w-full mt-1 px-4 py-2 border rounded-lg text-sm"
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* GSTIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              GSTIN
            </label>
            <input
              {...register("CustomerGstin")}
              className="w-full mt-1 px-4 py-2 border rounded-lg text-sm"
              placeholder="Enter GSTIN"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
