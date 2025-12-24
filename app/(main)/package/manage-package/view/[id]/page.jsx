"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button/Button";

// Mock data based on your form structure
const packageData = {
  id: "pkg_001",
  title: "Amazing Bali Adventure Tour",
  duration: "5 Days 4 Nights",
  maxPeople: 20,
  location: "Bali, Indonesia",
  price: {
    adultPrice: 500,
    babyPrice: 100,
    childPrice: 300,
    bookingAmount: 100,
  },
  discount: {
    type: "percentage",
    value: 15,
  },
  images: [
    { url: "/placeholder.svg?height=400&width=600", publicId: "img1" },
    { url: "/placeholder.svg?height=400&width=600", publicId: "img2" },
    { url: "/placeholder.svg?height=400&width=600", publicId: "img3" },
    { url: "/placeholder.svg?height=400&width=600", publicId: "img4" },
  ],
  highlights: [
    "Visit iconic temples and cultural sites",
    "Experience traditional Balinese cuisine",
    "Relax on pristine beaches",
    "Adventure activities like volcano hiking",
    "Professional local guide included",
  ],
  overview:
    "Discover the magic of Bali with our comprehensive 5-day adventure tour. From ancient temples to pristine beaches, volcanic landscapes to vibrant markets, this package offers the perfect blend of culture, adventure, and relaxation. Experience authentic Balinese hospitality while exploring the island's most spectacular destinations with our expert local guides.",
  inclusion: [
    "4-star hotel accommodation",
    "Daily breakfast and 2 dinners",
    "Private air-conditioned transport",
    "Professional English-speaking guide",
    "All entrance fees to attractions",
    "Airport transfers",
  ],
  exclusions: [
    "International flights",
    "Personal expenses and shopping",
    "Travel insurance",
    "Lunch (except mentioned)",
    "Tips and gratuities",
    "Visa fees",
  ],
  itinerary: [
    {
      label: "Day 1 - Arrival & Ubud Exploration",
      activities: [
        {
          time: "10:00 AM",
          title: "Airport Pickup",
          location: "Ngurah Rai International Airport",
          description:
            "Meet and greet at the airport, transfer to hotel in Ubud",
        },
        {
          time: "02:00 PM",
          title: "Sacred Monkey Forest",
          location: "Ubud Monkey Forest Sanctuary",
          description:
            "Explore the sacred sanctuary and interact with playful monkeys",
        },
        {
          time: "04:00 PM",
          title: "Ubud Traditional Market",
          location: "Ubud Central Market",
          description: "Browse local crafts, textiles, and souvenirs",
        },
      ],
    },
    {
      label: "Day 2 - Temple Tour & Rice Terraces",
      activities: [
        {
          time: "08:00 AM",
          title: "Tegenungan Waterfall",
          location: "Tegenungan Village",
          description: "Visit the stunning waterfall and enjoy swimming",
        },
        {
          time: "11:00 AM",
          title: "Tegallalang Rice Terraces",
          location: "Tegallalang Village",
          description: "Marvel at the UNESCO World Heritage rice terraces",
        },
        {
          time: "02:00 PM",
          title: "Tirta Empul Temple",
          location: "Tampaksiring",
          description: "Experience the holy spring water temple",
        },
      ],
    },
  ],
  isFeatured: true,
  bookingDeadline: "2024-12-31",
  status: "active",
  packagePdf: {
    name: "bali-adventure-itinerary.pdf",
    url: "/documents/bali-adventure-itinerary.pdf",
  },
  tipsAndTricks: [
    "Best time to visit is April to October (dry season)",
    "Bring comfortable walking shoes for temple visits",
    "Respect local customs and dress modestly at temples",
    "Try local currency (Indonesian Rupiah) for better deals",
    "Don't forget sunscreen and insect repellent",
  ],
  faq: [
    {
      question: "What is included in the package price?",
      answer:
        "The package includes 4-star accommodation, daily breakfast, private transport, professional guide, entrance fees, and airport transfers. International flights and personal expenses are not included.",
    },
    {
      question: "Is this tour suitable for children?",
      answer:
        "Yes, this tour is family-friendly. We offer special rates for children and can customize activities based on age groups. Baby seats and high chairs are available upon request.",
    },
    {
      question: "What should I pack for this trip?",
      answer:
        "Pack comfortable walking shoes, light cotton clothing, swimwear, sunscreen, insect repellent, and modest clothing for temple visits. A detailed packing list will be provided upon booking.",
    },
  ],
  createdAt: "2024-01-15",
  rating: 4.8,
  totalReviews: 124,
};

export default function PackageView() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const [activeItineraryDay, setActiveItineraryDay] = useState(0);

  const calculateDiscountedPrice = (originalPrice) => {
    if (packageData.discount.type === "percentage") {
      return originalPrice - (originalPrice * packageData.discount.value) / 100;
    } else {
      return originalPrice - packageData.discount.value;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="bg-white dark:bg-[#010611]  p-6 rounded-xl">
      {/* Header */}
      <div className=" border-b border-gray-200 dark:border-gray-700 flex justify-between items-center pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/packages"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white flex items-center font-medium text-sm gap-2"
          >
            <Icon icon="lucide:arrow-left" className="size-5" />
            Back to Packages
          </Link>
          {packageData.isFeatured && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
              <Icon icon="lucide:star" className="size-3 inline mr-1" />
              Featured
            </span>
          )}
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
              packageData.status === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
            }`}
          >
            {packageData.status.charAt(0).toUpperCase() +
              packageData.status.slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 px-4 bg-transparent"
            startIcon={<Icon icon="lucide:edit" className="size-4" />}
          >
            Edit Package
          </Button>

          <Link href={"/create-package"}>
            <Button
              className="h-10 px-4"
              startIcon={<Icon icon="lucide:plus" className="size-4" />}
            >
              Create New
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Package Header */}

          <div className="space-y-4">
            {/* Location, duration, people and ratting */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:map-pin" className="size-4" />
                  <span>{packageData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:clock" className="size-4" />
                  <span>{packageData.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:users" className="size-4" />
                  <span>Max {packageData.maxPeople} people</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Icon icon="lucide:star" className="size-4 text-yellow-500" />
                  <span className="font-medium">{packageData.rating}</span>
                  <span className="text-gray-500 text-sm font-medium">
                    ({packageData.totalReviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden">
                <div className="w-full h-full bg-gray-100"></div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {packageData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-video rounded-lg overflow-hidden border transition-all ${
                      selectedImageIndex === index
                        ? "border-primary "
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-full h-full bg-gray-100"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {packageData.title}
            </h1>
          </div>

          {/* Overview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="lucide:file-text" className="size-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Package Overview
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {packageData.overview}
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:star" className="size-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Package Highlights
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(showAllHighlights
                ? packageData.highlights
                : packageData.highlights.slice(0, 4)
              ).map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <Icon
                    icon="lucide:check-circle"
                    className="size-5 text-green-600 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
            {packageData.highlights.length > 4 && (
              <button
                onClick={() => setShowAllHighlights(!showAllHighlights)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                {showAllHighlights
                  ? "Show Less"
                  : `Show ${packageData.highlights.length - 4} More`}
                <Icon
                  icon={
                    showAllHighlights
                      ? "lucide:chevron-up"
                      : "lucide:chevron-down"
                  }
                  className="size-4"
                />
              </button>
            )}
          </div>

          {/* Inclusion & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inclusions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon
                  icon="lucide:check-circle"
                  className="size-5 text-green-600"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  What's Included
                </h3>
              </div>
              <div className="space-y-2">
                {packageData.inclusion.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Icon
                      icon="lucide:check"
                      className="size-4 text-green-600 mt-1 flex-shrink-0"
                    />
                    <span className="text-gray-700 dark:text-gray-300 ">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:x-circle" className="size-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  What's Not Included
                </h3>
              </div>
              <div className="space-y-2">
                {packageData.exclusions.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Icon
                      icon="lucide:x"
                      className="size-4 text-red-600 mt-1 flex-shrink-0"
                    />
                    <span className="text-gray-700 dark:text-gray-300 ">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Icon
                icon="lucide:calendar-days"
                className="size-5 text-primary"
              />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detailed Itinerary
              </h2>
            </div>

            {/* Day Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
              {packageData.itinerary.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setActiveItineraryDay(index)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeItineraryDay === index
                      ? "bg-primary text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>

            {/* Active Day Content */}
            <div className="space-y-4">
              {packageData.itinerary[activeItineraryDay]?.activities.map(
                (activity, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-primary/5 dark:bg-primary rounded-full flex items-center justify-center">
                        <Icon
                          icon="lucide:clock"
                          className="size-6 text-primary"
                        />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-primary bg-primary/5 dark:bg-blue-900 px-2 py-1 rounded">
                          {activity.time}
                        </span>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {activity.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Icon icon="lucide:map-pin" className="size-4" />
                        <span className="text-sm">{activity.location}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Tips & Tricks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="lucide:lightbulb"
                className="size-5 text-yellow-600"
              />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tips & Tricks
              </h2>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
              <div className="space-y-3">
                {packageData.tipsAndTricks.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Icon
                      icon="lucide:arrow-right"
                      className="size-4 text-yellow-600 mt-1 flex-shrink-0"
                    />
                    <span className="text-gray-700 dark:text-gray-300 ">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="lucide:help-circle"
                className="size-5 text-purple-600"
              />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {packageData.faq.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {item.question}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white dark:bg-[#161F2D] border border-gray-200 dark:border-gray-700 rounded-xl p-6 ">
            <div className="space-y-4 ">
              <div className="between">
                <div className="flex flex-col mb-2">
                  {packageData.discount.value > 0 && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(packageData.price.adultPrice)}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(
                      calculateDiscountedPrice(packageData.price.adultPrice)
                    )}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    per adult
                  </p>
                  {packageData.discount.value > 0 && (
                    <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300 mt-2">
                      <Icon icon="lucide:tag" className="size-3" />
                      Save {packageData.discount.value}
                      {packageData.discount.type === "percentage" ? "%" : "$"}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Adult Price:
                  </span>
                  <span className="font-medium">
                    {formatPrice(
                      calculateDiscountedPrice(packageData.price.adultPrice)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Child Price:
                  </span>
                  <span className="font-medium">
                    {formatPrice(
                      calculateDiscountedPrice(packageData.price.childPrice)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Baby Price:
                  </span>
                  <span className="font-medium">
                    {formatPrice(
                      calculateDiscountedPrice(packageData.price.babyPrice)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Booking Amount:
                  </span>
                  <span className="font-medium text-blue-600">
                    {formatPrice(packageData.price.bookingAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-white dark:bg-[#161F2D] border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Package Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Duration:
                </span>
                <span className="font-medium">{packageData.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Max People:
                </span>
                <span className="font-medium">{packageData.maxPeople}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Booking Deadline:
                </span>
                <span className="font-medium">
                  {new Date(packageData.bookingDeadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Package ID:
                </span>
                <span className="font-medium font-mono text-xs">
                  {packageData.id}
                </span>
              </div>
            </div>
          </div>

          {/* Package PDF */}
          {packageData.packagePdf && (
            <div className="bg-white dark:bg-[#161F2D] border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Package Documents
              </h3>
              <a
                href={packageData.packagePdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Icon icon="lucide:file-text" className="size-8 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {packageData.packagePdf.name}
                  </p>
                  <p className="text-xs text-gray-500">Download PDF</p>
                </div>
                <Icon icon="lucide:download" className="size-4 text-gray-400" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
