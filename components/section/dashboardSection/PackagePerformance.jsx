"use client";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts with no SSR to avoid hydration issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const PackagePerformance = ({ activePackages = 21, distribution = [] }) => {
  // Ensure we have default data if none is provided
  const chartData =
    distribution.length > 0
      ? distribution
      : [
          { name: "Basic", value: 30, color: "#4ABB95" },
          { name: "Standard", value: 40, color: "#F4B400" },
          { name: "Premium", value: 20, color: "#180A0A" },
          { name: "Others", value: 10, color: "#4285F4" },
        ];

  // Format data for ApexCharts
  const series = chartData.map((item) => item.value);
  const labels = chartData.map((item) => item.name);
  const colors = chartData.map((item) => item.color);

  // ApexCharts options
  const chartOptions = {
    chart: {
      type: "donut",
      fontFamily: "Inter, sans-serif",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    labels: labels,
    colors: colors, // ✅ This is correct
    fill: {
      colors: colors, // ✅ Add this to enforce it
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val + "%",
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        colors: ["#fff"],
      },
      background: {
        enabled: false,
      },
      dropShadow: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          background: "transparent",
          labels: {
            show: false,
          },
        },
        customScale: 1,
        offsetX: 0,
        offsetY: 0,
        dataLabels: {
          offset: -8,
        },
      },
    },
    stroke: {
      width: 0,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => val + "%",
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 280,
          },
        },
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-transparent rounded-lg border border-gray-200 dark:border-[#334155] overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#334155]">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Package Performance
        </h2>
      </div>

      <div className="p-4 flex flex-col items-center">
        <div className="w-full relative ">
          {typeof window !== "undefined" && (
            <ReactApexChart
              key={JSON.stringify(series)}
              options={chartOptions}
              series={series}
              type="donut"
              height={242}
            />
          )}

          {/* Custom center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
              Active Packages
            </div>
            <div className="text-4xl font-bold">{activePackages}</div>
          </div>
        </div>

        {/* Custom legend that exactly matches the image */}
        <div className="mt-4 flex flex-wrap  gap-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center 2xl:min-w-[30%]">
              <div
                className="size-[13px] mr-2 rounded-[3px]"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm">
                {item.name} {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackagePerformance;
