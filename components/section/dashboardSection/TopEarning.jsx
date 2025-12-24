"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const TopEarning = ({ data, timeframe, onTimeframeChange }) => {
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Top Earnings */}
      <div className="bg-white dark:bg-transparent rounded-lg border border-gray-200 dark:border-[#334155] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-[#334155] flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Top Earnings
          </h2>
          {/* dropdown of month, year, days etc */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 border border-gray-300 rounded-full px-3 py-1"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {timeframe}
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#161F2D] border border-gray-200 dark:border-[#334155] rounded-md shadow-lg z-10 overflow-hidden">
                {timeframeOptions.map((option) => (
                  <button
                    key={option}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[#334155]">
            <thead className="bg-gray-50 dark:bg-transparent">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider ">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-200  uppercase tracking-wider">
                  Contribution
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-[#334155]">
              {data.map((item) => (
                <tr
                  key={item.rank}
                  className="hover:bg-gray-50 dark:hover:bg-[#161F2D]"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-400 text-center">
                    {item.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-400 text-left">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-400 text-center">
                    {item.revenue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-400 text-center">
                    {item.contribution}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopEarning;
