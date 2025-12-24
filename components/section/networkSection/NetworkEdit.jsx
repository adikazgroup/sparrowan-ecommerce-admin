"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input/Input";
import { Modal } from "@/components/ui/modal/Modal";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { Calendar } from "@/components/ui/calender/Calender";

// Status options
const statusOptions = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "disabled", label: "Disabled" },
];

export default function NetworkEdit({
  formData,
  editModal,
  isUpdating = false,
  selectedNetwork,
  handleFormChange,
  handleUpdateNetwork,
}) {
  // Calculate min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    <Modal
      open={editModal.isOpen}
      onClose={editModal.close}
      size="xxlarge"
      showCloseButton={true}
    >
      {selectedNetwork && (
        <div className="pl-0.5">
          <h2 className="text-xl font-semibold mb-6 dark:text-white">
            Edit Network
          </h2>

          <form onSubmit={handleUpdateNetwork}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Network name"
                  value={formData.networkName}
                  onValueChange={(value) =>
                    handleFormChange("networkName", value)
                  }
                  required
                  className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Domain"
                  value={formData.networkDomain}
                  onValueChange={(value) =>
                    handleFormChange("networkDomain", value)
                  }
                  required
                  className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onValueChange={(value) => handleFormChange("email", value)}
                  required
                  className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                  fullWidth
                />
              </div>

              <div>
                <Select
                  label="Status"
                  options={statusOptions}
                  value={formData.status}
                  onValueChange={(value) => handleFormChange("status", value)}
                  required
                  className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                  fullWidth
                />
              </div>

              <div>
                <Calendar
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(value) => handleFormChange("startDate", value)}
                  minDate={tomorrow}
                  required
                  inputClass="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                  upper={true}
                />
              </div>

              <div>
                <Calendar
                  label="End Date"
                  value={formData.endDate}
                  onChange={(value) => handleFormChange("endDate", value)}
                  minDate={tomorrow}
                  required
                  inputClass="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569] dark:text-gray-200"
                  upper={true}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={editModal.close}
                className="hover:bg-transparent dark:text-gray-800"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Network"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
