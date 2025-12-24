"use client";

import { cn } from "@/lib/utils";

// Sample data for the activities
const sampleActivities = [
  {
    id: 1,
    title: "New Network Created",
    description: "BrandTech has submitted a new network for approval.",
  },
  {
    id: 2,
    title: "Network Approved/Rejected",
    description: "BrandTech network was approved.",
  },
  {
    id: 3,
    title: "New Advertiser Joined",
    description: "ClickTech signed up as an advertiser.",
  },
  {
    id: 4,
    title: "Affiliate Joined",
    description: "John Doe joined as an affiliate.",
  },
  {
    id: 5,
    title: "Subscription Upgrade",
    description: "BrandTech upgraded to Premium plan.",
  },
  {
    id: 6,
    title: "Subscription Expiring",
    description: "ClickTech's subscription expires on 16.03.2025",
  },
  {
    id: 7,
    title: "Payout Processed",
    description: "$500 payout sent to John Doe (Affiliate).",
  },
  {
    id: 8,
    title: "Affiliate Joined",
    description: "John Doe joined as an affiliate.",
  },
  {
    id: 9,
    title: "Subscription Upgrade",
    description: "BrandTech upgraded to Premium plan.",
  },
];

// Activity item component
const ActivityItem = ({ activity }) => {
  return (
    <div className="flex items-start py-[14px] group transition-colors">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gray-200 dark:bg-gray-900 ",
        )}
      ></div>
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm font-medium dark:font-normal text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-300">
          {activity.title}
        </p>
        <p className="text-xs text-gray-500 truncate">{activity.description}</p>
      </div>
      <div className="ml-2 flex-shrink-0">
        <p className="text-xs text-gray-500">4 hours ago</p>
      </div>
    </div>
  );
};

// Main RecentActivity component
const RecentActivity = ({ className }) => {
  return (
    <div className={cn(" rounded-lg  overflow-hidden", className)}>
      <div className=" pb-3">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent Activity
        </h2>
      </div>

      <div className="2xl:max-h-[800px] max-h-[74vh] overflow-y-auto">
        {sampleActivities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      {sampleActivities.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
