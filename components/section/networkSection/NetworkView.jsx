import { Input } from "@/components/ui/input/Input";
import { Modal } from "@/components/ui/modal/Modal";
import moment from "moment";

export default function NetworkView({ selectedNetwork, viewModal }) {
  console.log("selectedNetwork", selectedNetwork);
  return (
    <Modal
      open={viewModal.isOpen}
      onClose={viewModal.close}
      size="xxlarge"
      showCloseButton={true}
    >
      {selectedNetwork && (
        <div className="pl-0.5">
          <h2 className="text-xl font-semibold mb-6  dark:text-white">
            View Network
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Network name"
                value={selectedNetwork.networkName}
                readOnly
                className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Domain"
                value={selectedNetwork.networkDomain}
                readOnly
                className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Email"
                value={selectedNetwork.email}
                readOnly
                className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                fullWidth
              />
            </div>
            <div>
              <Input
                label="Status"
                value={selectedNetwork.status}
                readOnly
                className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Package Name"
                value={selectedNetwork.packageName}
                readOnly
                className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                fullWidth
              />
            </div>
            <div>
              <Input
                label="Password"
                type="password"
                value={selectedNetwork.password}
                readOnly
                className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Start date"
                value={moment(selectedNetwork.startDate).format("L")}
                readOnly
                className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                fullWidth
              />
            </div>

            <div>
              <Input
                label="End date"
                value={moment(selectedNetwork.endDate).format("L")}
                readOnly
                className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                fullWidth
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
