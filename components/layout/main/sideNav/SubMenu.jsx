import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";
import treeIcon from "@/public/img/icon/Tree.png";
import { useEffect, useRef, useState } from "react";

export default function SubMenu({ item, openMenu, activeSubItems }) {
  const navRef = useRef(null);
  const pathname = usePathname();
  const [submenuHeight, setSubmenuHeight] = useState(0);

  useEffect(() => {
    if (activeSubItems === item.id) {
      setSubmenuHeight(navRef.current?.clientHeight || 0);
    } else {
      setSubmenuHeight(0);
    }
  }, [activeSubItems, item.id]);

  return (
    <div
      className={`overflow-hidden relative  ${activeSubItems === item.id ? (openMenu ? "visible rounded rounded-t-none mb-2" : "visible  mb-2 -ml-0.5") : "invisible "}  `}
      style={{
        height: submenuHeight,
        transition: "height ease-in-out 0.2s",
      }}
    >
      <div ref={navRef} className="flex flex-col gap-2 ">
        {item?.items?.map((subItem, subIndex) => (
          <Link
            key={subIndex}
            href={subItem.subPath}
            title={subItem?.subName}
            className={`flex gap-4 items-center h-10 pr-4 ${openMenu ? "ml-[40px] rounded" : "ml-[0px]"}  ${pathname === subItem.subPath ? " bg-primary text-white" : "  hover:bg-primary hover:text-white rounded  "} ${!openMenu && "text-white"}`}
          >
            <Image
              src={treeIcon}
              alt="treeIcon"
              className={`transition-all ease-linear absolute  ${openMenu ? "visible opacity-100 -left-0.5 duration-500" : "invisible -left-3 opacity-0 duration-300"}`}
            />

            <div
              className={`transition-all ease-in-out absolute  ${openMenu ? "invisible -left-8 opacity-0 duration-300" : "visible opacity-100 left-[15px] duration-500"}`}
            >
              {subItem.subIcon && (
                <Icon icon={subItem.subIcon} className="size-6" />
              )}
            </div>
            {/* Menu Name */}
            <div
              className={`flex items-center justify-between absolute left-0 pl-[52px] w-full `}
            >
              <p
                className={`transition-all ease-linear text-sm whitespace-nowrap font-normal  ${openMenu ? "opacity-100 -right-0 duration-200" : "opacity-0 -right-16 duration-300"}`}
              >
                {subItem.subName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
