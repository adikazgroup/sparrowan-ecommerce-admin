import toast from "react-hot-toast";

export function handleToast(result, type = "success", id = "default") {
  const message =
    type === "success"
      ? result?.data?.message || "Operation completed successfully."
      : result?.error?.data?.errorMessages?.[0]?.message ||
        "Something went wrong. Please try again.";

  type === "success"
    ? toast.success(message, { id })
    : toast.error(message, { id });
}
