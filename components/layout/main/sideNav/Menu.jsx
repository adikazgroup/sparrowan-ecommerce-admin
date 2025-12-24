"use client";

import SubMenu from "./SubMenu";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { menuItems } from "@/utils/DataHelper";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { usePathname, useRouter } from "next/navigation";
import MenuSkeleton from "@/components/skeleton/MenuSkeleton";
import { useGetProfileQuery } from "@/features/user/userApiSlice";

// eslint-disable-next-line react/prop-types
export default function Menu({ openMenu }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading } = useGetProfileQuery();
  const [activeSubItems, setActiveSubItems] = useState(null);
  const [activeItem, setActiveItem] = useState("Dashboard");

  const userData = data?.data;

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.path === "/") return true;

    const key = item.key || item.name.toLowerCase();
    const permission = userData?.permission?.[key];

    if (!item.items) {
      return permission?.show === true;
    }

    const filteredSubItems = item.items.filter((subItem) => {
      if (!permission) return false;
      const subName = subItem.subName?.toLowerCase();
      if (subName?.includes("add") || subName?.includes("create")) {
        return permission?.create === true;
      }
      return permission?.show === true;
    });

    if (filteredSubItems.length > 0) {
      item.items = filteredSubItems;
      return true;
    }

    return false;
  });

  // To hold clicked menu
  useEffect(() => {
    const matchingItem = menuItems.find(
      (item) =>
        item.path === pathname ||
        (item.items &&
          item.items.some((subItem) => subItem.subPath === pathname))
    );

    if (matchingItem) {
      setActiveItem(matchingItem.name || "");

      // 🔥 New part: auto-open the submenu if matched
      if (matchingItem.items) {
        setActiveSubItems(matchingItem.id);
      } else {
        setActiveSubItems(null);
      }
    } else {
      setActiveItem("");
      setActiveSubItems(null);
    }
  }, [pathname]);

  // For activating the menu
  const handleClick = (item) => {
    const hasSubItems = item.items && item.items.length > 0;

    if (hasSubItems) {
      if (activeSubItems === item.id) {
        setActiveSubItems(null);
      } else {
        setActiveSubItems(item.id);
      }
    } else {
      setActiveItem(item.name || item.subName);
      if (item.path) {
        router.push(item.path);
        setActiveSubItems(null);
      }
    }
  };

  console.log("filteredMenuItems", filteredMenuItems);

  // Css of style
  const baseClasses = `relative flex gap-4 items-center h-11 w-full px-3 relative overflow-hidden rounded-md ani2`;
  const submenuActiveColor = "text-white bg-primary";
  const activeColor = "dark:bg-primary bg-primary text-white";
  const inactiveColor = `text-black dark:text-white hover:bg-primary/20`;

  if (isLoading) {
    return <MenuSkeleton openMenu={openMenu} id={activeSubItems} />;
  }

  return (
    <>
      {menuItems.map((item, index) => (
        <div key={index} className=" cursor-pointer ">
          <div
            onClick={() => handleClick(item)}
            title={item.name}
            className={`relative ${baseClasses} ${activeSubItems === item.id ? submenuActiveColor : activeSubItems === item.id ? activeColor : activeItem === item.name ? activeColor : inactiveColor} ${!openMenu && activeSubItems === item.id ? "rounded-b-none " : ""}`}
          >
            <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[280px] border-b-white opacity-70 blur-xl rotate-[50deg] absolute -top-32 -right-0 "></div>
            {/* <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[280px] border-b-white opacity-70 blur-xl rotate-[70deg] absolute -top-32 -left-5 "></div> */}

            <div
              className={`text-xl absolute opacity-100 transition-all duration-200 ease-in-out h-[23px] w-[24px] flex justify-start `}
            >
              <Icon icon={item?.icon} className="size-6" />
            </div>
            <div
              className={`flex items-center justify-between absolute left-0 pl-[54px] w-full pr-2 `}
            >
              <p
                className={` transition-all ease-linear  whitespace-nowrap font-normal  ${openMenu ? "opacity-100 -right-0 duration-200" : "opacity-0 -right-16 duration-200"}`}
              >
                {item.name}
              </p>
              {item.items && (
                <div className="transition-all duration-200 ease-in-out">
                  {activeSubItems === item.id ? (
                    <FaMinus className="ani2" />
                  ) : (
                    <FaPlus className="ani2" />
                  )}
                </div>
              )}

              {
                <Icon
                  icon="material-symbols-light:remove-rounded"
                  className={`ani2 text-[37px]  absolute -bottom-[24px] left-[4px]  ${!openMenu && item.items ? "visible opacity-100" : "invisible opacity-0"}`}
                />
              }
            </div>
          </div>
          {/* Submenu */}
          <div
            className={` ${!openMenu && activeSubItems === item.id ? "sm:bg-primary sm:rounded sm:rounded-t-none   pt-2 " : "pt-2 "}`}
          >
            <SubMenu
              item={item}
              activeSubItems={activeSubItems}
              openMenu={openMenu}
            />
          </div>
        </div>
      ))}
    </>
  );
}
