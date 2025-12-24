// Format date into "YYYY-MM-DD HH:mm:ss"
const formatDateTime = (date) => {
  const pad = (n) => n.toString().padStart(2, "0");

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
};

// Generate Sample data
export const generateData = (count, status) => {
  return Array.from({ length: count }, (_, i) => {
    const randomDate = new Date(
      Date.now() - Math.floor(Math.random() * 10000000000)
    );

    return {
      id: i + 1,
      name: [
        "Zubayer Salehin",
        "Nayeem Khan",
        "Arif Sikder",
        "Rimon Mia",
        "Abbas Khan",
      ][Math.floor(Math.random() * 5)],
      managerName: "Abu Sufiyan",
      email: [
        "network1@gmail.com",
        "network2@gmail.com",
        "network3@gmail.com",
        "network4@gmail.com",
      ][Math.floor(Math.random() * 4)],
      contact: "+8801334144130",
      companyName: "BrandTech",
      role: ["General Manager", "Affiliate Manager", "Account Manager"][
        Math.floor(Math.random() * 3)
      ],
      price: ["$299", "$499", "$999"][Math.floor(Math.random() * 3)],
      status: ["approved", "pending", "disabled"][
        Math.floor(Math.random() * status)
      ],
      joinDate: formatDateTime(randomDate),
    };
  });
};
