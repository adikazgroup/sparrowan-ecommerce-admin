"use client";
import Menu from "./Menu";
import { useDispatch, useSelector } from "react-redux";
import { setOpenMenu } from "@/features/menu/menuSlice";

export default function SideNav() {
  const dispatch = useDispatch();
  const openMenu = useSelector((state) => state.menu.openMenu);

  return (
    <div className="relative !z-[1000]">
      <div
        onClick={() => dispatch(setOpenMenu(false))}
        className={` bg-opacity-25 w-screen min-h-[92vh] lg:hidden ani3 fixed bottom-0 ${openMenu ? "visible opacity-100" : "invisible opacity-0"}`}
      ></div>
      <div
        className={`fixed bottom-0 h-[92vh]  bg-white dark:bg-[#010611] border-r-[#f3f3f3] dark:border-r-[#475569] border-r ani3 scrollbar scroll-smooth py-5 ${openMenu ? "2xl:w-[19rem] xl:w-[17rem] w-64 p-5 -left-0 sm:left-0" : "sm:w-20 w-64 -left-[16rem] sm:left-0 px-[15px] "}`}
      >
        <div className="dynamic-height overflow-y-auto noBar relative  h-full ani3  ">
          <Menu openMenu={openMenu} />
        </div>
      </div>
    </div>
  );
}
