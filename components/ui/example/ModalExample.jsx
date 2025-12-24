"use client";

import { LuX } from "react-icons/lu";
import { Input } from "../input/Input";
import { Modal } from "../modal/Modal";
import { useState, useRef } from "react";
import { useModal } from "@/lib/useModal";

export default function ModalExample() {
  // Basic modal
  const basicModal = useModal();

  // Form modal
  const formModal = useModal();
  const [formData, setFormData] = useState({ name: "", email: "" });
  const nameInputRef = useRef(null);

  // Confirmation modal
  const confirmModal = useModal();
  const [isDeleting, setIsDeleting] = useState(false);

  // Different sizes modal
  const [modalSize, setModalSize] = useState("medium");
  const sizeModal = useModal();

  // Different variants modal
  const [modalVariant, setModalVariant] = useState("default");
  const variantModal = useModal();

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    formModal.close();

    // Reset form
    setFormData({ name: "", email: "" });
  };

  // Handle delete confirmation
  const handleDelete = () => {
    setIsDeleting(true);

    // Simulate API call
    setTimeout(() => {
      setIsDeleting(false);
      confirmModal.close();

      // Show success message
      alert("Item deleted successfully!");
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 ">
      <h1 className=" mb-6">Modal Ui</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Basic Modal */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h2 className=" font-medium mb-2">Basic Modal</h2>
          <p className="text-sm text-gray-500 mb-4">
            A simple modal with title and content.
          </p>
          <button
            onClick={basicModal.open}
            className="text-[13px] font-medium border px-3 py-1.5 rounded hover:bg-black hover:text-white cursor-pointer"
          >
            Open Basic Modal
          </button>

          <Modal
            open={basicModal.isOpen}
            onClose={basicModal.close}
            title="Basic Modal"
            description="This is a simple modal with a title and description."
          >
            <p>
              This is the content of the modal. You can put any React components
              here.
            </p>

            <div className="flex justify-end mt-4">
              <button onClick={basicModal.close} className="mr-2">
                Close
              </button>
              <button onClick={basicModal.close}>Confirm</button>
            </div>
          </Modal>
        </div>

        {/* Form Modal */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h2 className=" font-medium mb-2">Form Modal</h2>
          <p className="text-sm text-gray-500 mb-4">
            A modal containing a form with initial focus.
          </p>
          <button
            onClick={formModal.open}
            className="text-[13px] font-medium border px-3 py-1.5 rounded hover:bg-black hover:text-white cursor-pointer"
          >
            Open Form Modal
          </button>

          <Modal
            open={formModal.isOpen}
            onClose={formModal.close}
            title="Form Modal"
            description="Please fill out the form below."
            initialFocus={nameInputRef}
          >
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  ref={nameInputRef}
                  label="Name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end mt-6">
                {/* <Button
                  type="button"
                  variant="outline"
                  onClick={formModal.close}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button type="submit">Submit</Button> */}
              </div>
            </form>
          </Modal>
        </div>

        {/* Confirmation Modal */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h2 className=" font-medium mb-2">Confirmation Modal</h2>
          <p className="text-sm text-gray-500 mb-4">
            A modal for confirming destructive actions.
          </p>
          <button
            type="button"
            onClick={confirmModal.open}
            className="text-[13px] font-medium border px-3 py-1.5 rounded hover:bg-black hover:text-white cursor-pointer"
          >
            Delete Item
          </button>

          <Modal
            open={confirmModal.isOpen}
            onClose={confirmModal.close}
            title="Confirm Deletion"
            description="Are you sure you want to delete this item? This action cannot be undone."
            variant="destructive"
            size="small"
          >
            <div className="flex justify-end mt-4">
              <button
                onClick={confirmModal.close}
                className="mr-2"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Modal>
        </div>

        {/* Different Sizes Modal */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h2 className=" font-medium mb-2">Different Sizes</h2>
          <p className="text-sm text-gray-500 mb-4">
            Modals with different size options.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {["small", "medium", "large", "xlarge", "full"].map((size) => (
              <button
                key={size}
                className="text-[13px] font-medium border px-3 py-1.5 rounded hover:bg-black hover:text-white cursor-pointer capitalize"
                onClick={() => {
                  setModalSize(size);
                  sizeModal.open();
                }}
              >
                {size}
              </button>
            ))}
          </div>

          <button
            className="text-[13px] font-medium border px-3 py-1.5 rounded hover:bg-black hover:text-white cursor-pointer capitalize"
            onClick={sizeModal.open}
          >
            Open {modalSize} Modal
          </button>

          <Modal
            open={sizeModal.isOpen}
            onClose={sizeModal.close}
            title={`${modalSize.charAt(0).toUpperCase() + modalSize.slice(1)} Modal`}
            description={`This is a modal with the ${modalSize} size.`}
            size={modalSize}
          >
            <div className="space-y-4">
              <p>
                This modal demonstrates the {modalSize} size option. You can
                adjust the size based on your content needs.
              </p>
              {(modalSize === "large" ||
                modalSize === "xlarge" ||
                modalSize === "full") && (
                <p>
                  Larger modals are useful for displaying more complex content,
                  forms with multiple fields, or data tables. They provide more
                  space while still maintaining a focused user experience.
                </p>
              )}
              {modalSize === "full" && (
                <p>
                  The full-width modal is particularly useful for mobile views
                  or when you need to display a large amount of content. It
                  still maintains margins on the sides for better readability.
                </p>
              )}
            </div>

            <div className="flex justify-end mt-4">
              {/* <Button onClick={sizeModal.close}>Close</Button> */}
            </div>
          </Modal>
        </div>

        {/* Different Variants Modal */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h2 className="text-lg font-medium mb-2">Different Variants</h2>
          <p className="text-sm text-gray-500 mb-4">
            Modals with different visual styles.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {["default", "destructive", "warning", "success"].map((variant) => (
              <button
                key={variant}
                className="text-[13px] font-medium border px-3 py-1.5 rounded hover:bg-black hover:text-white cursor-pointer capitalize"
                onClick={() => {
                  setModalVariant(variant);
                  variantModal.open();
                }}
              >
                {variant}
              </button>
            ))}
          </div>

          <button
            onClick={variantModal.open}
            className="text-[13px] font-medium border px-3 py-1.5 rounded hover:bg-black hover:text-white cursor-pointer capitalize"
          >
            Open {modalVariant} Modal
          </button>

          <Modal
            open={variantModal.isOpen}
            onClose={variantModal.close}
            title={`${modalVariant.charAt(0).toUpperCase() + modalVariant.slice(1)} Variant`}
            description={`This modal uses the ${modalVariant} visual style.`}
            variant={modalVariant}
          >
            <p>
              Different variants help communicate the purpose or context of the
              modal to users. For example, use the destructive variant for
              deletion confirmations, warning for important notices, and success
              for completion messages.
            </p>

            <div className="flex justify-end mt-4">
              {/* <Button
                variant={modalVariant === "default" ? "default" : modalVariant}
                onClick={variantModal.close}
              >
                Close
              </Button> */}
            </div>
          </Modal>
        </div>

        {/* Custom Modal */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h2 className=" font-medium mb-2">Fully Customizable</h2>
          <p className="text-sm text-gray-500 mb-4">
            Create any modal layout you need.
          </p>

          <CustomModalExample />
        </div>
      </div>
    </div>
  );
}

// Custom Modal Example
function CustomModalExample() {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <button
        onClick={open}
        className="text-[13px] font-medium border px-3 py-1.5 rounded hover:bg-black hover:text-white cursor-pointer capitalize"
      >
        Open Custom Modal
      </button>

      <Modal
        open={isOpen}
        onClose={close}
        className="p-0 overflow-hidden"
        size="xxlarge"
        showCloseButton={false}
      >
        <div className="flex flex-col md:flex-row  ">
          {/* Image Section */}
          <div className="bg-blue-600 text-white p-6 md:w-1/3 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
              <p className="text-blue-100">
                This is a fully customizable modal that you can design however
                you want.
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:w-2/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Custom Modal</h3>
              <button
                onClick={close}
                className="text-gray-500 hover:text-gray-700"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4">
              This modal demonstrates how flexible the Modal component is. You
              can create any layout or design you need by customizing the
              content and styles.
            </p>

            <ul className="space-y-2 mb-4">
              <li className="flex items-center">
                <span className="bg-green-500 rounded-full p-1 mr-2">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                Fully customizable layout
              </li>
              <li className="flex items-center">
                <span className="bg-green-500 rounded-full p-1 mr-2">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                Responsive design
              </li>
              <li className="flex items-center">
                <span className="bg-green-500 rounded-full p-1 mr-2">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                Accessible with keyboard navigation
              </li>
            </ul>

            <div className="flex justify-end">
              {/* <Button onClick={close}>Got it</Button> */}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
