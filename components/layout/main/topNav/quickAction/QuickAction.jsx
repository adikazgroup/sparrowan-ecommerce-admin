"use client";

import Image from "next/image";
import { useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { FiMinus, FiPlus } from "react-icons/fi";
import DropdownLayout from "@/components/ui/dropdown/DropdownLayout";
import { Icon } from "@iconify/react";

export default function QuickAction() {
  const theme = useTheme();
  const pathname = usePathname();
  const [clickMenu, setClickMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Menu data
  const menuItems = [
    {
      id: 1,
      name: "Create New Network",
      icon: "hugeicons:neural-network",
      path: "/",
    },
    {
      id: 2,
      name: "Add New User",
      icon: "mynaui:user-square",
      path: "/network/approved",
    },
    {
      id: 3,
      name: "Create New Package",
      icon: "hugeicons:package-02",
      path: "package/create-package",
    },
    {
      id: 4,
      name: "Generate Report",
      icon: "cil:featured-playlist",
      path: "/seller/finance",
    },
    {
      id: 5,
      name: "Subscriptions",
      icon: "solar:bag-2-broken",
      path: "/seller/finance",
    },
  ];

  return (
    <DropdownLayout
      dropdownOpen={dropdownOpen}
      setDropdownOpen={setDropdownOpen}
      clickMenu={clickMenu}
      setClickMenu={setClickMenu}
    >
      <div className="flex items-center text-sm gap-3 group ">
        <h4 className="whitespace-nowrap lg:block hidden">Quick Actions</h4>
        <div className="size-11 rounded-full bg-[#DEF4FF80] dark:bg-[#161F2D] center text-xl">
          <FiPlus className="group-hover:hidden " />
          <FiMinus className="group-hover:block hidden " />
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute xs:pt-[15px] ani3 w-[15rem]  -left-12 z-[22] ${
          dropdownOpen
            ? "opacity-100 visible top-[3.2rem]"
            : "opacity-0 invisible top-[3.5rem]"
        }`}
      >
        <div className="xs:p-5 p-3 pb-3 rounded-xl relative border border-gray-200 shadow-md bg-white dark:bg-[#161F2D] dark:border-gray-800 ">
          <div className="max-h-[16rem] overflow-scroll noBar pt-1 space-y-1">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`flex py-2 px-2 items-center gap-3 rounded text-sm ${pathname === item.path ? "bg-gray-100 dark:bg-[#2C3D57]" : "hover:bg-gray-100 dark:hover:bg-[#2C3D57]"}`}
              >
                <div>
                  <Icon icon={item?.icon} className="size-5" />
                </div>
                <h2>{item.name}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DropdownLayout>
  );
}
