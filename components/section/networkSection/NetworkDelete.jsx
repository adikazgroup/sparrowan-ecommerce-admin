import { OctagonX } from "lucide-react";
import { Modal } from "@/components/ui/modal/Modal";
import { Button } from "@/components/ui/button/Button";

export default function NetworkDelete({
  isDeleting,
  deleteModal,
  selectedNetwork,
  handleDeleteNetwork,
}) {
  return (
    <Modal
      open={deleteModal.isOpen}
      onClose={deleteModal.close}
      size="medium"
      showCloseButton={false}
      className="p-0"
    >
      <div className="flex flex-col items-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-800/20 rounded-full flex items-center justify-center mb-4">
          <OctagonX className="h-8 w-8 text-red-500" />
        </div>

        <h3 className="text-lg font-medium mb-2 dark:text-white">
          You are about to Disable this Network
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to disable "{selectedNetwork?.networkName}"?
        </p>

        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            onClick={deleteModal.close}
            className="flex-1 dark:hover:bg-transparent dark:text-gray-800"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleDeleteNetwork}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8.009 8.009 0 0 1 12 20Z"
                  />
                </svg>
                Disabling...
              </span>
            ) : (
              "Disable"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
