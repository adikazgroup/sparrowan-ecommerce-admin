"use client";
import { Icon } from "@iconify/react";

export default function ConfirmVariantDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  variantDetails,
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className={`fixed top-0 left-0 w-full h-full bg-black/50 center z-[1000] ani3 ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-[30rem] bg-white dark:bg-gray-800 p-5 rounded-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex-col center py-8 ${
          isOpen
            ? "opacity-100 visible scale-100"
            : "opacity-0 invisible scale-95"
        }`}
      >
        <div className="size-[4.8rem] rounded-full bg-[#FFE7E7] dark:bg-red-900/30 center mb-5">
          <Icon
            icon="fluent:delete-24-regular"
            className="size-9 text-[#FF0000] dark:text-red-400"
          />
        </div>

        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Delete Variant?
        </h3>

        <p className="px-4 text-[#6D6D6D] dark:text-gray-400 text-sm text-center mt-2 mb-4">
          Are you sure you want to remove this variant? This action will be
          applied when you save the product.
        </p>

        {variantDetails && (
          <div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 space-y-2">
            {variantDetails.sku && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">SKU:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {variantDetails.sku}
                </span>
              </div>
            )}
            {variantDetails.attributes &&
              Object.entries(variantDetails.attributes).some(
                ([_, val]) => val,
              ) && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Attributes:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Object.entries(variantDetails.attributes)
                      .filter(([_, val]) => val)
                      .map(([key, val]) => `${key}: ${val}`)
                      .join(", ")}
                  </span>
                </div>
              )}
            {variantDetails.stock !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {variantDetails.stock}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 w-full px-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md bg-[#F6F6F6] dark:bg-gray-700 text-[#1A1A1A] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
          >
            No, Keep It!
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm rounded-md bg-[#FF0000] text-white hover:bg-red-700 font-medium"
          >
            Yes, Delete It!
          </button>
        </div>
      </div>
    </div>
  );
}
