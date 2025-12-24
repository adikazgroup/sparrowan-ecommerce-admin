"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import SalesCard from "@/components/section/dashboardSection/SalesCard";
import SalesCardSkeleton from "@/components/skeleton/SalesCardSkeleton";
import TopEarning from "@/components/section/dashboardSection/TopEarning";
import TopEarningSkeleton from "@/components/skeleton/TopEarningSkeleton";
import { DateRangePicker } from "@/components/ui/calender/DateRangePicker";
import ShortOverview from "@/components/section/dashboardSection/ShortOverview";
import DashShortCardSkeleton from "@/components/skeleton/DashShortCardSkeleton";
import RecentActivity from "@/components/section/dashboardSection/RecentActivity";
import RecentActivitySkeleton from "@/components/skeleton/RecentActivitySkeleton";
import RecentTransactionSkeleton from "@/components/skeleton/RecentTransactionSkeleton";
import RecentTransactions from "@/components/section/dashboardSection/RecentTransactions";
import PackagePerformance from "@/components/section/dashboardSection/PackagePerformance";
import PackagePerformanceSkeleton from "@/components/skeleton/PackagePerformanceSkeleton";

const Dashboard = () => {
  const { data: session } = useSession();

  console.log("user", session);
  const [salesTimeframe, setSalesTimeframe] = useState("This month");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [earningsTimeframe, setEarningsTimeframe] = useState("This month");

  // Sample data for sales chart
  const salesData = {
    value: "$2201",
    growth: "15%",
    chartData: [
      { week: "1st week", value: 100 },
      { week: "2nd week", value: 400 },
      { week: "3rd week", value: 400 },
      { week: "4th week", value: 1000 },
      { week: "5th week", value: 600 },
      { week: "6th week", value: 1000 },
    ],
  };

  // Sample data for package performance
  const activePackages = 21;

  const distribution = [
    { name: "Basic", value: 30, color: "#36CBFC" },
    { name: "Standard", value: 40, color: "#0066FF" },
    { name: "Premium", value: 20, color: "#2D9CFF" },
    { name: "Others", value: 10, color: "#FFA500" },
  ];

  // Sample data for top earnings
  const topEarningsData = [
    { rank: 1, name: "Brand Tech", revenue: "$500", contribution: "45%" },
    { rank: 2, name: "Click Tech", revenue: "$500", contribution: "45%" },
    { rank: 3, name: "Soft Tech", revenue: "$500", contribution: "45%" },
    { rank: 4, name: "Bogura Tech", revenue: "$500", contribution: "45%" },
  ];

  // Sample data for recent transactions
  const transactionsData = [
    { date: "18.03.25", advertiserName: "Brand Tech", amount: "$350" },
    { date: "18.03.25", advertiserName: "Click Tech", amount: "$150" },
    { date: "18.03.25", advertiserName: "Bogura Tech", amount: "$100" },
  ];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 0);

  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  // Static loading states
  const salesCardLoading = false;
  const topEarningLoading = false;
  const shortOverViewLoading = false;
  const recentActivityLoading = false;
  const packagePerformanceLoading = false;
  const recentTransactionsLoading = false;

  return (
    <div>
      {shortOverViewLoading ? (
        <DashShortCardSkeleton />
      ) : (
        <div className="sm:p-6 p-2.5 bg-white dark:bg-transparent rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden relative ">
          <div className="flex sm:flex-row flex-col gap-4 justify-between sm:items-center mb-6 z-[10]">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white dark:font-semibold">
              Dashboard
            </h1>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              minDate={tomorrow}
              maxDate={oneYearLater}
              placeholder="Start Date - End Date"
              align="right-0"
            />
          </div>
          <ShortOverview />
        </div>
      )}

      <div className="flex lg:flex-nowrap flex-wrap  gap-5">
        {recentActivityLoading ? (
          <RecentActivitySkeleton />
        ) : (
          <div className="mt-6 2xl:w-[28%] lg:w-[30%] md:w-[48%] w-full order-3 flex-1 border border-gray-200 dark:border-[#334155] p-5 rounded-lg h-fit bg-white dark:bg-transparent">
            <RecentActivity />
          </div>
        )}

        <div className="mt-6 2xl:w-[44%] lg:w-[36%] w-full  space-y-5 lg:order-2 order-3">
          {topEarningLoading ? (
            <TopEarningSkeleton />
          ) : (
            <TopEarning
              data={topEarningsData}
              transactions={transactionsData}
              timeframe={earningsTimeframe}
              onTimeframeChange={setEarningsTimeframe}
            />
          )}
          {salesCardLoading ? (
            <SalesCardSkeleton />
          ) : (
            <SalesCard
              value={salesData.value}
              growth={salesData.growth}
              chartData={salesData.chartData}
              timeframe={salesTimeframe}
              onTimeframeChange={setSalesTimeframe}
            />
          )}
        </div>

        <div className="mt-6 2xl:w-[28%] lg:w-[30%] md:w-[48%] w-full flex-1  space-y-5 lg:order-1 order-2">
          {packagePerformanceLoading ? (
            <PackagePerformanceSkeleton />
          ) : (
            <PackagePerformance
              activePackages={activePackages}
              distribution={distribution}
            />
          )}

          {recentTransactionsLoading ? (
            <RecentTransactionSkeleton />
          ) : (
            <RecentTransactions
              data={topEarningsData}
              transactions={transactionsData}
              timeframe={earningsTimeframe}
              onTimeframeChange={setEarningsTimeframe}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
