import { Input } from "@/components/ui/input/Input";
import { Modal } from "@/components/ui/modal/Modal";

export default function UserView({ viewModal, selectedUser }) {
  console.log("view Modal", selectedUser);
  // Helper function to render checkbox
  const renderCheckbox = (isChecked) => (
    <div
      className={`size-4 rounded-sm border mr-2 flex items-center justify-center ${
        isChecked
          ? "bg-primary border-primary"
          : "border-gray-300 dark:border-gray-600"
      }`}
    >
      {isChecked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3 text-white"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </div>
  );

  return (
    <Modal
      open={viewModal.isOpen}
      onClose={viewModal.close}
      title="View User"
      size="xxlarge"
    >
      {selectedUser && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Name"
              value={selectedUser.name || ""}
              readOnly
              fullWidth
              className="h-12 dark:border-[#475569]"
            />

            <Input
              label="Email"
              value={selectedUser.email || ""}
              readOnly
              fullWidth
              className="h-12 dark:border-[#475569]"
            />

            <Input
              label="Phone"
              value={selectedUser.phoneNumber || ""}
              readOnly
              fullWidth
              className="h-12 dark:border-[#475569]"
            />

            <Input
              label="Role"
              value={selectedUser.role || ""}
              readOnly
              fullWidth
              className="h-12 dark:border-[#475569] capitalize"
            />

            <Input
              label="Status"
              value={selectedUser.status || ""}
              readOnly
              fullWidth
              className="h-12 dark:border-[#475569] capitalize"
            />
          </div>

          {/* Permissions Display */}

          <div className="mt-8">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Access Permissions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Network */}
              <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                <p className="font-medium text-sm mb-4">1. Network</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.network?.access)}
                    <span className="text-sm">Access</span>
                  </div>
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.network?.create)}
                    <span className="text-sm">Create</span>
                  </div>
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.network?.show)}
                    <span className="text-sm">Show</span>
                  </div>
                </div>
              </div>

              {/* Subscription */}
              <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                <p className="font-medium text-sm mb-4">2. Subscription</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    {renderCheckbox(
                      selectedUser.permission?.subscription?.show,
                    )}
                    <span className="text-sm">Show</span>
                  </div>
                </div>
              </div>

              {/* Package */}
              <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                <p className="font-medium text-sm mb-4">3. Package</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.package?.create)}
                    <span className="text-sm">Create</span>
                  </div>
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.package?.show)}
                    <span className="text-sm">Show</span>
                  </div>
                </div>
              </div>

              {/* User */}
              <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                <p className="font-medium text-sm mb-4">4. User</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.user?.create)}
                    <span className="text-sm">Create</span>
                  </div>
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.user?.show)}
                    <span className="text-sm">Show</span>
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                <p className="font-medium text-sm mb-4">5. Coupon</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.coupon?.create)}
                    <span className="text-sm">Create</span>
                  </div>
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.coupon?.show)}
                    <span className="text-sm">Show</span>
                  </div>
                </div>
              </div>

              {/* Affiliate */}
              <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                <p className="font-medium text-sm mb-4">6. Affiliate</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.affiliate?.access)}
                    <span className="text-sm">Access</span>
                  </div>
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.affiliate?.show)}
                    <span className="text-sm">Show</span>
                  </div>
                </div>
              </div>

              {/* Advertise */}
              <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                <p className="font-medium text-sm mb-4">7. Advertise</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.advertise?.access)}
                    <span className="text-sm">Access</span>
                  </div>
                  <div className="flex items-center">
                    {renderCheckbox(selectedUser.permission?.advertise?.show)}
                    <span className="text-sm">Show</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
