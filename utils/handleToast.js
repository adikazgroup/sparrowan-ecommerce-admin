import toast from "react-hot-toast";

/**
 * Show toast based on API result.
 *
 * @param {Object} params
 * @param {Object} params.result - The result object from RTK Query mutation.
 * @param {string} [params.type='success'] - Type of toast: 'success' | 'error'.
 * @param {string} [params.id='default'] - Toast ID for updating/dismissing.
 * @param {string} [params.message] - Custom message (used only for success).
 */
export function handleToast({
  result,
  type = "success",
  id = "default",
  message,
}) {
  if (type === "success") {
    const successMessage =
      message || result?.data?.message || "Operation completed successfully.";
    toast.success(successMessage, { id });
  } else {
    const errorMessage =
      result?.error?.data?.errorMessages?.[0]?.message ||
      result?.error?.data?.message ||
      "Something went wrong. Please try again.";
    toast.error(errorMessage, { id });
  }
}
