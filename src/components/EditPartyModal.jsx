import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { customerUpdate } from "../assets/api/customerApi";
import { handleError } from "../assets/api/utils";

export const EditPartyModal = ({ isOpen, onClose, onSave, party }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      gstin: "",
    },
  });

  useEffect(() => {
    if (isOpen && party) {
      reset({
        name: party.name || "",
        phone: party.phone || "",
        email: party.email || "",
        gstin: party.gstin || "",
      });
    }
  }, [isOpen, party, reset]);

  const onSubmit = async (data) => {
    try {
      const updatedData = {
        ...data,
        email: data.email?.trim() === "" ? "N/A" : data.email,
      };

      await customerUpdate(party.id, updatedData);
      onSave({ ...party, ...updatedData });
      onClose();
    } catch (error) {
      handleError("Update failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Edit Party Details
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              {...register("phone", {
                required: "Phone is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Enter a valid 10-digit phone number",
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
              {...register("name", { required: "Name is required" })}
              className="w-full mt-1 px-4 py-2 border rounded-lg text-sm"
              placeholder="Enter party name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
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
                  message: "Enter a valid email",
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
              {...register("gstin")}
              className="w-full mt-1 px-4 py-2 border rounded-lg text-sm"
              placeholder="Enter GSTIN"
            />
          </div>

          {/* Buttons */}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
