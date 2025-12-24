"use client";

const SuccessModal = ({
  onClose,
  onGoToAllManagers,
  onCreateAnother,
  firstBtnText,
  text,
  edit,
}) => {
  return (
    <div
      onClick={() => onClose()}
      className="fixed inset-0 bg-black/70 flex items-center justify-center !z-[1000]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Success!</h2>
          <p className="text-[#888888] mb-6 text-sm">{text}</p>

          <div className="center space-x-4 w-full pb-2">
            <button
              onClick={onGoToAllManagers}
              className=" py-2 px-4 bg-[#FFE5E0] hover:bg-[#f7d9d3] text-[#E23D21] rounded-md transition-colors text-sm"
            >
              {firstBtnText}
            </button>
            <button
              onClick={onCreateAnother}
              className="py-2 px-4 bg-primary hover:bg-[#C2280E] text-white rounded-md transition-colors text-sm"
            >
              {edit ? "Keep Editing" : "Create Another"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
