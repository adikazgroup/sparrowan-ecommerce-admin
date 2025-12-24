"use client";

import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from "@/components/ui/dropdown/Dropdown";
import {
  LuUser,
  LuSettings,
  LuLogOut,
  LuBell,
  LuMail,
  LuPlus,
  LuTrash,
  LuCopy,
  LuShare,
  LuFilter,
  LuChevronDown,
  LuCircleHelp,
} from "react-icons/lu";
import { Button } from "@/components/ui/button/Button";
import { LucideEdit, LucideMoreVertical } from "lucide-react";

export default function DropdownDemo() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedTheme, setSelectedTheme] = useState("Light");
  const [notifications, setNotifications] = useState(true);

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
  ];

  const themes = ["Light", "Dark", "System"];

  return (
    <div className="max-w-5xl mx-auto my-20 ">
      <h1 className=" font-medium mb-8">Dynamic Dropdown Menu Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Basic Dropdown */}
        <div className="p-6 border border-gray-200 rounded-lg ">
          <h2 className=" font-medium text-gray-800 mb-4">Basic Dropdown</h2>
          <Dropdown>
            <DropdownTrigger>Options</DropdownTrigger>
            <DropdownMenu>
              <DropdownItem onClick={() => console.log("Edit")}>
                Edit
              </DropdownItem>
              <DropdownItem onClick={() => console.log("Duplicate")}>
                Duplicate
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => console.log("Archive")}>
                Archive
              </DropdownItem>
              <DropdownItem
                onClick={() => console.log("Delete")}
                className="text-red-600 hover:bg-red-50"
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* User Menu */}
        <div className="p-6 border border-gray-200 rounded-lg ">
          <h2 className=" font-medium text-gray-800 mb-4">User Menu</h2>
          <Dropdown>
            <DropdownTrigger className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                JD
              </div>
              <span>John Doe</span>
            </DropdownTrigger>
            <DropdownMenu align="right">
              <DropdownLabel>Signed in as</DropdownLabel>
              <div className="px-4 py-2 text-sm">john.doe@example.com</div>
              <DropdownSeparator />
              <DropdownItem
                icon={<LuUser />}
                onClick={() => console.log("Profile")}
              >
                Your Profile
              </DropdownItem>
              <DropdownItem
                icon={<LuSettings />}
                onClick={() => console.log("Settings")}
              >
                Settings
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                icon={<LuCircleHelp />}
                onClick={() => console.log("Help")}
              >
                Help & Support
              </DropdownItem>
              <DropdownItem
                icon={<LuLogOut />}
                onClick={() => console.log("Sign out")}
                className="text-red-600 hover:bg-red-50"
              >
                Sign out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Notification Menu */}
        <div className="p-6 border border-gray-200 rounded-lg ">
          <h2 className=" font-medium text-gray-800 mb-4">Notification Menu</h2>
          <Dropdown>
            <DropdownTrigger
              showChevron={false}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <LuBell className="h-5 w-5" />
            </DropdownTrigger>
            <DropdownMenu align="right" className="w-80">
              <DropdownLabel>Notifications</DropdownLabel>
              <div className="max-h-64 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                          <LuMail className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          New message received
                        </p>
                        <p className="text-xs text-gray-500">
                          You have a new message from User {i}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">5 min ago</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <DropdownSeparator />
              <DropdownItem
                onClick={() => console.log("View all")}
                className="text-center text-primary"
              >
                View all notifications
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Selection Dropdown */}
        <div className="p-6 border border-gray-200 rounded-lg ">
          <h2 className=" font-medium text-gray-800 mb-4">
            Selection Dropdown
          </h2>
          <Dropdown>
            <DropdownTrigger>
              <span>Language: {selectedLanguage}</span>
            </DropdownTrigger>
            <DropdownMenu>
              {languages.map((language) => (
                <DropdownItem
                  key={language}
                  onClick={() => setSelectedLanguage(language)}
                  selected={selectedLanguage === language}
                >
                  {language}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Settings Dropdown */}
        <div className="p-6 border border-gray-200 rounded-lg ">
          <h2 className=" font-medium text-gray-800 mb-4">Settings Dropdown</h2>
          <Dropdown>
            <DropdownTrigger>
              <LuSettings className="h-5 w-5" />
            </DropdownTrigger>
            <DropdownMenu align="right" className="w-56">
              <DropdownLabel>Settings</DropdownLabel>
              <DropdownItem
                onClick={() => setNotifications(!notifications)}
                selected={notifications}
              >
                Enable notifications
              </DropdownItem>
              <DropdownSeparator />
              <DropdownLabel>Theme</DropdownLabel>
              {themes.map((theme) => (
                <DropdownItem
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  selected={selectedTheme === theme}
                >
                  {theme}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Action Menu */}
        <div className="p-6 border border-gray-200 rounded-lg ">
          <h2 className=" font-medium text-gray-800 mb-4">Action Menu</h2>
          <div className="flex justify-between items-center p-4  border border-gray-200 rounded-md">
            <div>
              <h3 className="font-medium">Document.pdf</h3>
              <p className="text-sm text-gray-500">Added 2 days ago</p>
            </div>
            <Dropdown>
              <DropdownTrigger
                showChevron={false}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <LucideMoreVertical className="h-5 w-5" />
              </DropdownTrigger>
              <DropdownMenu align="right">
                <DropdownItem
                  icon={<LucideEdit />}
                  onClick={() => console.log("Edit")}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  icon={<LuCopy />}
                  onClick={() => console.log("Duplicate")}
                >
                  Duplicate
                </DropdownItem>
                <DropdownItem
                  icon={<LuShare />}
                  onClick={() => console.log("Share")}
                >
                  Share
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem
                  icon={<LuTrash />}
                  onClick={() => console.log("Delete")}
                  className="text-red-600 hover:bg-red-50"
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Button with Dropdown */}
        <div className="p-6 border border-gray-200 rounded-lg ">
          <h2 className=" font-medium text-gray-800 mb-4">
            Button with Dropdown
          </h2>
          <div className="flex space-x-2">
            <Button>Create</Button>
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="outline" size="icon">
                  <LuChevronDown className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu align="right">
                <DropdownItem
                  icon={<LuPlus />}
                  onClick={() => console.log("New File")}
                >
                  New File
                </DropdownItem>
                <DropdownItem
                  icon={<LuPlus />}
                  onClick={() => console.log("New Folder")}
                >
                  New Folder
                </DropdownItem>
                <DropdownItem
                  icon={<LuPlus />}
                  onClick={() => console.log("New Project")}
                >
                  New Project
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="p-6 border border-gray-200 rounded-lg ">
          <h2 className=" font-medium text-gray-800 mb-4">Filter Dropdown</h2>
          <Dropdown>
            <DropdownTrigger className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50">
              <LuFilter className="h-4 w-4" />
              <span>Filter</span>
            </DropdownTrigger>
            <DropdownMenu className="w-56">
              <DropdownLabel>Filter by</DropdownLabel>
              <div className="px-4 py-2">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Recent</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Modified</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Shared with me</span>
                  </label>
                </div>
              </div>
              <DropdownSeparator />
              <div className="p-2 flex justify-end space-x-2">
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                  Reset
                </button>
                <button className="px-3 py-1 text-sm bg-primary text-white rounded">
                  Apply
                </button>
              </div>
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Full Width Dropdown */}
        <div className="p-6 border border-gray-200 rounded-lg ">
          <h2 className=" font-medium text-gray-800 mb-4">
            Full Width Dropdown
          </h2>
          <Dropdown fullWidth>
            <DropdownTrigger>Select an option</DropdownTrigger>
            <DropdownMenu>
              <DropdownItem onClick={() => console.log("Option 1")}>
                Option 1
              </DropdownItem>
              <DropdownItem onClick={() => console.log("Option 2")}>
                Option 2
              </DropdownItem>
              <DropdownItem onClick={() => console.log("Option 3")}>
                Option 3
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
