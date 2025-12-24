"use client";

import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Dynamically import ApexCharts with no SSR to avoid hydration issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const SalesCard = ({
  value,
  growth,
  chartData,
  timeframe,
  onTimeframeChange,
}) => {
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const timeframeOptions = [
    "This month",
    "Last month",
    "This quarter",
    "Last quarter",
    "This year",
    "Custom",
  ];

  // Format chart data for ApexCharts
  const series = [
    {
      name: "",
      data: chartData?.map((item) => item.value) || [],
    },
  ];

  const categories = chartData?.map((item) => item.week) || [];

  // ApexCharts options
  const options = {
    chart: {
      type: "area",
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
      width: 2,
      colors: ["#3B82F6"],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "#3B82F6",
            opacity: 0.2,
          },
          {
            offset: 100,
            color: "#3B82F6",
            opacity: 0,
          },
        ],
      },
    },
    grid: {
      borderColor: theme === "light" ? "#E5E7EB" : "#040A1B",
      row: {
        colors: ["transparent"],
        opacity: 0.5,
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
        formatter: (value) => {
          return `$${value}`;
        },
      },
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (value) => {
          return `$${value}`;
        },
      },
      marker: {
        show: true,
      },
      theme: theme === "light" ? "light" : "dark",
      style: {
        fontSize: "12px",
        fontFamily: undefined,
      },
      fillSeriesColor: false,
      backgroundColor: theme !== "light" ? "#1E293B" : "#FFFFFF",
      borderColor: theme !== "light" ? "#334155" : "#E5E7EB",
      textStyle: {
        color: theme !== "light" ? "#F1F5F9" : "#1F2937",
      },
    },
    markers: {
      size: 4,
      colors: ["#3B82F6"],
      strokeColors: "#FFFFFF",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-transparent dark:border-[#334155] rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#334155] flex justify-between items-center">
        <h2 className="text-lg font-medium dark:text-normal text-gray-900 dark:text-white">
          Sales
        </h2>
        {/* dropdown of month, year, days etc */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 dark:border-gray-400 border border-gray-300 rounded-full px-3 py-1"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {timeframe}
            <ChevronDown className="ml-2 h-4 w-4" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#161F2D] border border-gray-200 rounded-md shadow-lg z-10 dark:border-[#334155] overflow-hidden ">
              {timeframeOptions.map((option) => (
                <button
                  key={option}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300  hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    onTimeframeChange(option);
                    setIsDropdownOpen(false);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center pb-0 p-4">
          <h3 className="text-3xl font-bold text-[#04344D] dark:text-[#0285F5]">
            {value}
          </h3>
          <div className="ml-4 flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-2 text-primary dark:text-blue-300 mr-2">
              <Icon icon="uil:arrow-growth" className="size-[18px]" />
              {growth}
            </span>
            growth from last month
          </div>
        </div>

        <div className="h-[15.3rem] w-full ">
          {typeof window !== "undefined" && (
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={"100%"}
              width={"100%"}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesCard;
