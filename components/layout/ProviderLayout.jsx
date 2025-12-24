"use client";
import { useSelector } from "react-redux";

export default function ProviderLayout({ children }) {
  const openMenu = useSelector((state) => state.menu.openMenu);
  return (
    <div
      className={` ${openMenu ? "2xl:pl-[19rem] xl:pl-[17rem] lg:pl-64 sm:pl-[5rem]" : "sm:pl-[5rem]"} ani5 min-h-[calc(100vh-8vh)] `}
    >
      <div className="sm:p-5 p-1">{children}</div>
    </div>
  );
}
