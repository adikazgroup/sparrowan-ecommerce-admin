"use client";

import { useState } from "react";
import { Button } from "../button/Button";
import {
  LuSun,
  LuSend,
  LuPlus,
  LuMail,
  LuMoon,
  LuTrash,
  LuHeart,
  LuBellDot,
  LuDownload,
  LuSettings,
  LuThumbsUp,
  LuArrowRight,
} from "react-icons/lu";

export default function ButtonExample() {
  const [loading, setLoading] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  // Toggle loading state for a specific button
  const toggleLoading = (id) => {
    setLoading((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    // Auto reset after 2 seconds
    if (!loading[id]) {
      setTimeout(() => {
        setLoading((prev) => ({
          ...prev,
          [id]: false,
        }));
      }, 2000);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1>Button Ui</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          startIcon={
            darkMode ? (
              <LuSun className="size-5" />
            ) : (
              <LuMoon className="size-5" />
            )
          }
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        />
      </div>

      <div className="grid gap-12">
        {/* Variants */}
        <section>
          <h2 className="mb-5 bg-accent/5 p-2.5 rounded">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
            <Button variant="light">Light</Button>
            <Button variant="dark">Dark</Button>
            <Button variant="link">Link Button</Button>
          </div>
        </section>

        {/* Sizes */}
        <section>
          <h2 className="mb-5 bg-accent/5 p-2.5 rounded">Button Sizes</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>
        </section>

        {/* Icon Buttons */}
        <section>
          <h2 className="mb-5 bg-accent/5 p-2.5 rounded">Icon Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button size="icon-sm" aria-label="Settings">
              <LuSettings className="h-4 w-4" />
            </Button>
            <Button size="icon" aria-label="Notifications">
              <LuBellDot className="h-5 w-5" />
            </Button>
            <Button size="icon-lg" aria-label="Mail">
              <LuMail className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Like">
              <LuHeart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Thumbs up">
              <LuThumbsUp className="h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Buttons with Icons */}
        <section>
          <h2 className="mb-5 bg-accent/5 p-2.5 rounded">Buttons with Icons</h2>
          <div className="flex flex-wrap gap-4">
            <Button startIcon={<LuDownload className="h-4 w-4" />}>
              Download
            </Button>
            <Button endIcon={<LuArrowRight className="h-4 w-4" />}>Next</Button>
            <Button
              variant="success"
              startIcon={<LuSend className="h-4 w-4" />}
            >
              Send Message
            </Button>
            <Button
              variant="destructive"
              startIcon={<LuTrash className="h-4 w-4" />}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              startIcon={<LuPlus className="h-4 w-4" />}
            >
              Add Item
            </Button>
          </div>
        </section>

        {/* Loading States */}
        <section>
          <h2 className="mb-5 bg-accent/5 p-2.5 rounded">Loading States</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              loading={loading.btn1}
              onClick={() => toggleLoading("btn1")}
            >
              {loading.btn1 ? "Loading..." : "Click Me"}
            </Button>

            <Button
              variant="success"
              loading={loading.btn2}
              loadingText="Saving..."
              onClick={() => toggleLoading("btn2")}
            >
              Save Changes
            </Button>

            <Button
              variant="outline"
              loading={loading.btn3}
              loadingText="Uploading..."
              onClick={() => toggleLoading("btn3")}
              startIcon={<LuDownload className="h-4 w-4" />}
            >
              Upload File
            </Button>
          </div>
        </section>

        {/* Rounded Variants */}
        <section>
          <h2 className="mb-5 bg-accent/5 p-2.5 rounded">Rounded Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button rounded="none">Square</Button>
            <Button rounded="sm">Small Rounded</Button>
            <Button rounded="default">Default Rounded</Button>
            <Button rounded="lg">Large Rounded</Button>
            <Button rounded="xl">Extra Large Rounded</Button>
            <Button rounded="full">Fully Rounded</Button>
          </div>
        </section>

        {/* Elevation Variants */}
        <section>
          <h2 className="mb-5 bg-accent/5 p-2.5 rounded">Elevation Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" elevation="none">
              No Shadow
            </Button>
            <Button variant="secondary" elevation="sm">
              Small Shadow
            </Button>
            <Button variant="secondary" elevation="default">
              Default Shadow
            </Button>
            <Button variant="secondary" elevation="md">
              Medium Shadow
            </Button>
            <Button variant="secondary" elevation="lg">
              Large Shadow
            </Button>
            <Button variant="secondary" elevation="xl">
              Extra Large Shadow
            </Button>
          </div>
        </section>

        {/* Full Width */}
        <section>
          <h2 className="mb-5 bg-accent/5 p-2.5 rounded">Full Width Button</h2>
          <Button fullWidth>Full Width Button</Button>
        </section>

        {/* Disabled State */}
        <section>
          <h2 className="mb-5 bg-accent/5 p-2.5 rounded">Disabled State</h2>
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled Button</Button>
            <Button variant="outline" disabled>
              Disabled Outline
            </Button>
            <Button variant="ghost" disabled>
              Disabled Ghost
            </Button>
          </div>
        </section>

        {/* Call to Action Examples */}
        <section>
          <h2 className="mb-5 bg-accent/5 p-2.5 rounded">
            Call to Action Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium mb-4">
                Subscribe to Newsletter
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Get the latest updates and news delivered to your inbox.
              </p>
              <Button
                variant="info"
                size="lg"
                fullWidth
                rounded="lg"
                elevation="md"
                endIcon={<LuArrowRight className="h-5 w-5" />}
              >
                Subscribe Now
              </Button>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium mb-4">
                Start Your Free Trial
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                No credit card required. Cancel anytime.
              </p>
              <Button
                variant="success"
                size="lg"
                fullWidth
                rounded="lg"
                elevation="md"
              >
                Get Started
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
