import { Modal } from "@/components/ui/modal/Modal";
import React from "react";
import { LuTrash2 } from "react-icons/lu";

export default function UserDelete({
  deleteModal,
  isDeleting,
  selectedUser,
  handleConfirmDelete,
}) {
  return (
    <Modal
      open={deleteModal.isOpen}
      onClose={deleteModal.close}
      className="p-0 overflow-hidden"
      size="medium"
      showCloseButton={false}
    >
      <div className="flex flex-col text-center">
        {/* Icon and Title */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 dark:bg-red-900/10 size-16 center rounded-full mr-4">
            <LuTrash2 className="size-7 text-red-500" />
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Are you sure you want to delete user {selectedUser?.name}?
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={deleteModal.close}
            className="px-5 py-2 border dark:bg-gray-500 dark:border-gray-500 dark:text-white dark:hover:bg-transparent rounded-md text-sm"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
