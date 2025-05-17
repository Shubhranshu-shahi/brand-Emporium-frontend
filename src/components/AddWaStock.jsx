import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

export const AddWaStock = ({
  isOpen,
  onClose,
  onSave,
  waBrandAndoff,
  setWaBrandAndoff,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      brands: "",
      off: "",
    },
  });

  const brands = watch("brands");
  const off = watch("off");

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    setWaBrandAndoff({ brands: data.brands, off: data.off });
    onSave({ brands: data.brands, off: data.off });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Add Brand Names and Percentage Off
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Brand Names */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Brand Names
            </label>
            <input
              type="text"
              {...register("brands", {
                required: "Brand names are required",
              })}
              className={`w-full mt-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.brands ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Puma, Addidas, Levi's"
            />
            {errors.brands && (
              <p className="text-xs text-red-500 mt-1">
                {errors.brands.message}
              </p>
            )}
          </div>

          {/* Percentage Off */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Percentage Off
            </label>
            <input
              type="number"
              {...register("off", {
                required: "Percentage off is required",
              })}
              className={`w-full mt-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.off ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., 20"
            />
            {errors.off && (
              <p className="text-xs text-red-500 mt-1">{errors.off.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm shadow"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
