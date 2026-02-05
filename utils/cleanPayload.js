/**
 * Data Sanitization Utility
 *
 * Purpose: Removes undefined, null, and empty string values from objects
 * before sending to API. This ensures clean payloads and prevents
 * unnecessary data from being sent to the server.
 *
 * @param {Object} obj - The object to sanitize
 * @returns {Object} - A new object with only defined, non-null, non-empty values
 *
 * @example
 * const formData = { name: "John", email: "", phone: undefined, age: null };
 * const clean = cleanPayload(formData);
 * // Result: { name: "John" }
 */
export function cleanPayload(obj) {
  if (!obj || typeof obj !== "object") {
    return {};
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    // Skip undefined, null, and empty strings
    if (value !== undefined && value !== null && value !== "") {
      // Handle nested objects recursively (but not arrays)
      if (typeof value === "object" && !Array.isArray(value)) {
        const cleaned = cleanPayload(value);
        if (Object.keys(cleaned).length > 0) {
          acc[key] = cleaned;
        }
      } else {
        acc[key] = value;
      }
    }
    return acc;
  }, {});
}
