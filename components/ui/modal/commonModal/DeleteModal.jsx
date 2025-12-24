"use client";
import { Icon } from "@iconify/react";

export default function DeleteModal({
  deleteModal,
  setDeleteModal,
  title,
  text,
  onConfirm,
}) {
  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-black/50 center z-[1000] ani3 ${deleteModal ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-[27rem] bg-white p-5 rounded-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex-col center py-8 ${
          deleteModal
            ? "opacity-100 visible scale-100"
            : "opacity-0 invisible scale-95"
        }`}
      >
        <div className="size-[4.8rem] rounded-full bg-[#FFE7E7] center mb-5">
          <Icon
            icon="fluent:delete-24-regular"
            className="size-9 text-[#FF0000]"
          />
        </div>

        <h3 className="text-lg font-medium">{title}</h3>

        <p className="px-4 text-[#6D6D6D] text-sm text-center mt-2 mb-6">
          {text}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModal(false)}
            className="px-4 py-2 text-sm rounded-md bg-[#F6F6F6] text-[#1A1A1A] hover:bg-gray-200 font-medium"
          >
            No, Keep It!
          </button>
          <button
            onClick={() => {
              onConfirm();
              setDeleteModal(false);
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
