"use client";

const MenuSkeleton = ({ openMenu = true }) => {
  // Create an array of different heights to make the skeleton look more natural
  const itemHeights = [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11];

  return (
    <div className="animate-pulse">
      {itemHeights.map((height, index) => (
        <div key={index} className="cursor-pointer mb-2">
          <div
            className={`relative flex gap-4 items-center h-${height} w-full px-3 rounded-md bg-gray-200 dark:bg-gray-700`}
          >
            {/* Icon placeholder */}
            <div className="text-xl absolute opacity-100 h-[23px] w-[24px] flex justify-start">
              <div className="size-6 rounded-md bg-gray-300 dark:bg-gray-600"></div>
            </div>

            {/* Menu text placeholder */}
            <div
              className={`flex items-center justify-between absolute left-0 pl-[54px] w-full pr-2`}
            >
              <div
                className={`h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 transition-all ease-linear ${
                  openMenu
                    ? "opacity-100 -right-0 duration-200"
                    : "opacity-0 -right-16 duration-200"
                }`}
              ></div>

              {index % 3 === 0 && (
                <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded transition-all duration-200 ease-in-out"></div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuSkeleton;
