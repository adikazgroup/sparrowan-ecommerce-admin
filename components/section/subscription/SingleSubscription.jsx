import React from "react";
import moment from "moment";
import { Input } from "@/components/ui/input/Input";

export default function SingleSubscription({ subscription }) {
  const formatDate = (date) =>
    date ? moment(date).format("D MMMM, YYYY") : "";

  const fields = [
    { label: "Package", value: subscription?.packageName },
    { label: "User Name", value: subscription?.name },
    { label: "User Email", value: subscription?.email },
    { label: "User Phone", value: subscription?.phoneNumber },
    { label: "Network", value: subscription?.networkName },
    { label: "Price", value: subscription?.price },
    { label: "Payment Status", value: subscription?.paymentStatus },
    { label: "Billing Cycle", value: subscription?.billingCycle },
    { label: "Start Date", value: formatDate(subscription?.startDate) },
    { label: "End Date", value: formatDate(subscription?.endDate) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-0.5">
      {fields.map((field, index) => (
        <Input
          key={index}
          label={field.label}
          value={field.value || ""}
          readOnly
          fullWidth
          className="h-12 dark:border-[#475569]"
        />
      ))}
    </div>
  );
}
