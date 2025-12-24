import { Icon } from "@iconify/react";

export default function RejectModal({
  text,
  title,
  rejectModal,
  setRejectModal,
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`w-[27rem] bg-white p-5 rounded-2xl  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300  flex-col center py-8 ${
        rejectModal
          ? "opacity-100 visible scale-100"
          : "opacity-0 invisible scale-95"
      }`}
    >
      <div className="size-[4.8rem] rounded-full bg-[#FF0000] center mb-5 ">
        <Icon icon="basil:cancel-outline" className="size-9 text-white" />
      </div>

      <h3 className="text-lg font-medium ">{title}</h3>

      <p className=" px-16 text-[#6D6D6D] text-sm text-center mt-2 mb-6">
        {text}
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setRejectModal(false)}
          className="px-4 py-2 text-sm rounded-md bg-[#F6F6F6] text-[#1A1A1A] hover:bg-gray-200 font-medium"
        >
          No, Keep It!
        </button>
        <button
          onClick={() => {
            setRejectModal(false);
          }}
          className="px-4 py-2 text-sm rounded-md bg-[#FF0000] text-white hover:bg-red-700 font-medium"
        >
          Yes, Reject It!
        </button>
      </div>
    </div>
  );
}
