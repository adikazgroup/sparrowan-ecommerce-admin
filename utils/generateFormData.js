export default function generateFormData(obj) {
  const formData = new FormData();

  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      const value = obj[prop];

      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(prop, item));
      } else {
        formData.append(prop, value);
      }
    }
  }

  return formData;
}
