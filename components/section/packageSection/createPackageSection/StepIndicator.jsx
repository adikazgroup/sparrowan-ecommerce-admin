import React from "react";

export default function StepIndicator({ currentStep }) {
  const steps = [
    { number: 1, title: "Package name & Type" },
    { number: 2, title: "Pricing & Duration" },
    { number: 3, title: "Discount, Free trial & status" },
    { number: 4, title: "Category & Features" },
    { number: 5, title: "Review & submit" },
  ];
  return (
    <div className="flex md:flex-col flex-wrap md:flex-nowrap gap-6 xl:pl-10">
      {steps.map((step) => (
        <div key={step.number} className="flex items-center gap-3">
          <div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border  ${
                currentStep === step.number
                  ? "border-primary text-primary dark:text-blue-400"
                  : currentStep > step.number
                    ? "bg-blue-500 text-white border-blue-500"
                    : " text-gray-500"
              }`}
            >
              {currentStep > step.number ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
              ) : (
                <span>{step.number}</span>
              )}
            </div>
          </div>
          <span
            className={`text-sm ${currentStep === step.number ? "text-blue-500 dark:text-blue-400 font-medium" : "text-gray-500"}`}
          >
            {step.title}
          </span>
        </div>
      ))}
    </div>
  );
}
