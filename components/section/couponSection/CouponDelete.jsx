import { LuTrash2 } from "react-icons/lu";
import { Modal } from "@/components/ui/modal/Modal";
import { Button } from "@/components/ui/button/Button";

export default function CouponDelete({
  deleteModal,
  handleDeleteCoupon,
  isLoading,
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
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <LuTrash2 className="h-8 w-8 text-red-500" />
        </div>

        <h3 className="text-lg font-medium mb-2 dark:text-gray-200">
          You are about to delete this Coupon
        </h3>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={deleteModal.close}
            className="mr-2 px-6 dark:bg-gray-500 dark:border-gray-500 dark:text-white dark:hover:bg-transparent"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleDeleteCoupon}
            className="px-6 bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Delete Now"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
