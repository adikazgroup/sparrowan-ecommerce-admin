"use client";
import Logo from "./Logo";
import User from "./user/User";
import { LuSearch } from "react-icons/lu";
import QuickAction from "./quickAction/QuickAction";
import { Input } from "@/components/ui/input/Input";
import Notification from "./notification/Notification";
import { useDispatch, useSelector } from "react-redux";
import { setOpenMenu } from "@/features/menu/menuSlice";

import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { Icon } from "@iconify/react";
import moment from "moment";

export default function TopNav() {
  const dispatch = useDispatch();
  const openMenu = useSelector((state) => state.menu.openMenu);
  return (
    <div className="border-b w-full h-[8vh] flex items-center sticky top-0 !z-[1000]  bg-white dark:bg-[#010611] border-b-[#f3f3f3] dark:border-b-[#475569]">
      <div
        className={` items-center justify-between sm:flex hidden border-r border-r-[#f3f3f3] dark:border-r-[#475569] ani5 ${openMenu ? "2xl:w-[19rem] xl:w-[17rem] w-64 px-5" : "sm:w-20  px-1 "}`}
      >
        <Logo openMenu={openMenu} />
        <button
          onClick={() => dispatch(setOpenMenu(!openMenu))}
          className={`h-7 text-2xl center  rounded-sm bg-white dark:bg-[#161F2D] shadow text-gray-400 ani5 !z-[100] relative ${openMenu ? "w-10 ml-0" : "w-7 ml-2.5"}`}
        >
          {openMenu ? (
            <MdKeyboardDoubleArrowLeft />
          ) : (
            <MdKeyboardDoubleArrowRight />
          )}
        </button>
      </div>
      <button
        onClick={() => dispatch(setOpenMenu(!openMenu))}
        className="sm:hidden flex items-center justify-between px-5 "
      >
        <Icon icon="ci:menu-alt-05" className="size-9" />
      </button>

      <div className="flex flex-1 items-center sm:justify-between justify-end sm:gap-8 gap-5 px-5">
        <div>
          <h2 className="font-medium">Welcome back</h2>
          <p className="text-[13px] text-gray-400">
            {moment().format("Do MMMM, YYYY")}
          </p>
        </div>
        <div className="flex gap-10">
          <Notification />
          <User />
        </div>
      </div>
    </div>
  );
}
