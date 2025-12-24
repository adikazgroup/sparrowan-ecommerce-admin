import React, { useEffect, useRef } from "react";

export default function DropdownLayout({
  children,
  dropdownOpen,
  setDropdownOpen,
  clickMenu,
  setClickMenu,
}) {
  const dropdownRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
      setClickMenu(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen || clickMenu) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [dropdownOpen, clickMenu]);

  return (
    <div
      className="text-gray-0 flex gap-3 items-center relative cursor-pointer"
      onMouseEnter={() => !clickMenu && setDropdownOpen(true)}
      onMouseLeave={() => !clickMenu && setDropdownOpen(false)}
      onClick={() => {
        setDropdownOpen(true);
        setClickMenu((prev) => !prev);
      }}
      ref={dropdownRef}
    >
      {children}
    </div>
  );
}
