import DropdownLayout from "@/components/ui/dropdown/DropdownLayout";
import React, { useState } from "react";
import { MdOutlineNotificationsActive } from "react-icons/md";

export default function Notification() {
  const [activeTab, setActiveTab] = useState("all");
  const [clickMenu, setClickMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      avatar: "/placeholder.svg?height=40&width=40",
      content: (
        <>
          A new network, <span className="font-semibold">Brand Tech</span>, has
          been submitted for <span className="font-semibold">approval</span>.
        </>
      ),
      time: "Sunday 12:12 PM",
      timeAgo: "5 min ago",
      unread: true,
      actions: [
        { label: "View Details", primary: true },
        { label: "Deny", primary: false },
      ],
    },
    {
      id: 2,
      avatar: "/placeholder.svg?height=40&width=40",
      content: (
        <>
          User <span className="font-semibold">Brand Tech</span> has upgraded to
          the <span className="font-semibold">Premium plan</span> subscription.
        </>
      ),
      time: "Sunday 12:12 PM",
      timeAgo: "5 min ago",
      unread: true,
      actions: [{ label: "See Plans", primary: true }],
    },
    {
      id: 3,
      avatar: "/placeholder.svg?height=40&width=40",
      content: (
        <>
          Subscription for <span className="font-semibold">Click Tech</span> is
          expiring on <span className="font-semibold">16.03.2025</span>. Send
          renewal reminder?
        </>
      ),
      time: "Sunday 12:12 PM",
      timeAgo: "5 min ago",
      unread: true,
      actions: [{ label: "Send Reminder", primary: true }],
    },
    {
      id: 4,
      initials: "CT",
      initialsColor: "bg-sky-200 text-sky-800",
      content: (
        <>
          <span className="font-semibold">Click tech</span> successfully{" "}
          <span className="font-semibold">upgraded</span> their plans
        </>
      ),
      time: "Sunday 12:12 PM",
      timeAgo: "5 min ago",
      unread: false,
    },
    {
      id: 5,
      initials: "CT",
      initialsColor: "bg-sky-200 text-sky-800",
      content: (
        <>
          <span className="font-semibold">Click tech</span> successfully{" "}
          <span className="font-semibold">upgraded</span> their plans
        </>
      ),
      time: "Sunday 12:12 PM",
      timeAgo: "5 min ago",
      unread: false,
    },
  ];
  return (
    <DropdownLayout
      dropdownOpen={dropdownOpen}
      setDropdownOpen={setDropdownOpen}
      clickMenu={clickMenu}
      setClickMenu={setClickMenu}
    >
      <button>
        <MdOutlineNotificationsActive className="text-2xl" />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute xs:pt-[15px] ani3 w-[26rem]  -right-3 z-[22] ${
          dropdownOpen
            ? "opacity-100 visible top-[3.2rem]"
            : "opacity-0 invisible top-[3.5rem]"
        }`}
      >
        <div className=" rounded-xl relative border border-gray-200 shadow-md bg-white dark:bg-[#010611] dark:border-gray-800  w-full overflow-auto noBar h-[40rem] ">
          <div className="p-4 pb-2 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <button className="text-blue-500 text-sm ">Mark all as read</button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-300 dark:border-gray-700">
            <button
              className={`flex items-center px-4 py-3 text-sm relative ${activeTab === "all" ? "text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("all")}
            >
              All
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
              {activeTab === "all" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              className={`px-4 py-3 text-sm relative ${activeTab === "messages" ? "text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("messages")}
            >
              New Messages
              {activeTab === "messages" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              className={`px-4 py-3 text-sm relative ${activeTab === "approvals" ? "text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("approvals")}
            >
              Network Approvals
              {activeTab === "approvals" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="px-4 py-3 flex dark:hover:bg-[#2c3d571a]"
              >
                {/* Avatar or Initials */}
                {notification.avatar ? (
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  </div>
                ) : (
                  <div
                    className={`flex-shrink-0 mr-3 w-10 h-10 rounded-full ${notification.initialsColor} flex items-center justify-center`}
                  >
                    <span className="text-sm font-medium">
                      {notification.initials}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-800 dark:text-gray-400">
                      {notification.content}
                    </p>
                    {notification.unread && (
                      <span className="flex-shrink-0 ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.time}
                    </p>
                    <div className="flex-shrink-0 ml-3 self-start mt-1">
                      <span className="text-xs text-gray-500">
                        {notification.timeAgo}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {notification.actions && (
                    <div className="mt-2 flex space-x-2">
                      {notification.actions.map((action, index) => (
                        <button
                          key={index}
                          className={`px-3 py-2 text-xs font-medium rounded ${
                            action.primary
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DropdownLayout>
  );
}
