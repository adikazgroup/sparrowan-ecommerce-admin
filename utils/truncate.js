export function truncate(str, length) {
  if (typeof str === "string" && typeof length === "number" && length > 0) {
    return str.length > length ? `${str.slice(0, length)} ..` : str;
  }
  return str;
}
