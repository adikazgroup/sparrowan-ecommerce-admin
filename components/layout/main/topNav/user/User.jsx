"use client";

import {
  LuLogOut,
  LuReceipt,
  LuSettings,
  LuUserRoundCog,
} from "react-icons/lu";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import { useDispatch } from "react-redux";
import { FaRegUser } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import userImg from "@/public/img/user/user.png";
import { apiSlice } from "@/features/api/apiSlice";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme/ThemeToggle";
import DropdownLayout from "@/components/ui/dropdown/DropdownLayout";
import { useGetProfileQuery } from "@/features/user/userApiSlice";

export default function User() {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { data } = useGetProfileQuery();
  const [clickMenu, setClickMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userData = data?.data;

  // Handle logout
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const loadingToast = toast.loading("Signing out...");
      await signOut({
        redirect: false,
        callbackUrl: "/login",
      });

      dispatch(apiSlice.util.resetApiState());

      toast.dismiss(loadingToast);
      toast.success("Signed out successfully");
      setDropdownOpen(false);

      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  // Handle menu item click
  const handleMenuItemClick =
    (path, isLogout = false) =>
    (e) => {
      if (isLogout) {
        handleLogout(e);
      } else {
        router.push(path);
        setDropdownOpen(false);
      }
    };

  const menuItems = [
    { id: 1, path: "/profile", name: "My profile", icon: FaRegUser },
    { id: 3, path: "/users", name: "Manage Users", icon: LuUserRoundCog },
    {
      id: 4,
      path: "/subscriptions",
      name: "Subscriptions",
      icon: LuReceipt,
    },
    { id: 5, name: "Logout", icon: LuLogOut, isLogout: true },
  ];

  return (
    <DropdownLayout
      dropdownOpen={dropdownOpen}
      setDropdownOpen={setDropdownOpen}
      clickMenu={clickMenu}
      setClickMenu={setClickMenu}
    >
      <div className="flex items-center gap-3">
        <div className="md:block hidden">
          <h3 className="font-medium whitespace-nowrap">
            {userData?.name || "Guest"}
          </h3>
          <p className="text-xs text-gray-500 font-[350] capitalize">
            {userData?.role || "User"}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#F7F7F7] dark:bg-[#161F2D] py-1.5 px-2 pr-4 rounded-full">
          <div className="size-9 rounded-full bg-gray-200">
            <Image
              src={userData?.profilePicture?.url || userImg}
              alt="user"
              width={36}
              height={36}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <IoIosArrowDown />
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute xs:pt-[15px] ani3 w-[13.5rem] right-0 z-[22] ${
          dropdownOpen
            ? "opacity-100 visible top-[3.4rem]"
            : "opacity-0 invisible top-[3.6rem]"
        }`}
      >
        <div className="xs:p-5 p-3 pb-3 rounded-xl relative border border-gray-200 shadow-md bg-white dark:border-gray-800 dark:bg-[#161F2D]">
          <div className="max-h-[16rem] overflow-scroll noBar pt-1 space-y-1">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={handleMenuItemClick(item.path, item.isLogout)}
                className={`flex py-2.5 px-2 items-center gap-3 rounded text-sm cursor-pointer ${
                  pathname === item.path
                    ? "bg-gray-100 dark:bg-[#2C3D57]"
                    : "hover:bg-gray-100 dark:hover:bg-[#2C3D57]"
                } ${item.isLogout ? " hover:bg-red-50 dark:hover:bg-red-900/20" : ""}`}
              >
                <item.icon className="text-lg" />
                <h2>{item.name}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DropdownLayout>
  );
}
