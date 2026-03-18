"use client";
import { useState } from "react";
import { ArrowRight, Phone } from "lucide-react";

const CallNowForm = ({ variant = "landing" }) => {
  const [warningMessage, setWarningMessage] = useState(null);

  // Get availability settings from environment variables
  const availableFrom = process.env.NEXT_PUBLIC_AVAILABLE_FROM || "09:00";
  const availableTo = process.env.NEXT_PUBLIC_AVAILABLE_TO || "17:00";
  const availableFromDay =
    process.env.NEXT_PUBLIC_AVAILABLE_FROM_DAY || "Monday";
  const availableToDay = process.env.NEXT_PUBLIC_AVAILABLE_TO_DAY || "Friday";

  // Check if current time is within available hours
  const isAvailable = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Convert day names to numbers
    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const fromDay = dayMap[availableFromDay] || 1;
    const toDay = dayMap[availableToDay] || 5;

    // Parse time strings (HH:MM format)
    const [fromHours, fromMinutes] = availableFrom.split(":").map(Number);
    const [toHours, toMinutes] = availableTo.split(":").map(Number);
    const fromTime = fromHours * 60 + fromMinutes;
    const toTime = toHours * 60 + toMinutes;

    // Check if current day is within available days
    const isDayAvailable = currentDay >= fromDay && currentDay <= toDay;
    const isTimeAvailable = currentTime >= fromTime && currentTime < toTime;

    return isDayAvailable && isTimeAvailable;
  };

  const handleCallNowClick = (e) => {
    if (!isAvailable()) {
      e.preventDefault();
      setWarningMessage(
        `Our services are currently unavailable. We're available ${availableFromDay} – ${availableToDay}, ${availableFrom} – ${availableTo}.`,
      );
      // Clear warning after 5 seconds
      setTimeout(() => setWarningMessage(null), 5000);
    }
  };

  if (variant === "contact-page") {
    return (
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#333333] mb-2">
          Call Now
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Speak directly with our expert team and get immediate answers to your
          questions.
        </p>

        {/* Warning Message */}
        {warningMessage && (
          <div className="mb-4 p-3 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
            {warningMessage}
          </div>
        )}

        {/* Phone Number Card */}
        <div
          className="rounded-xl p-6 mb-0"
          style={{
            background: " #4A2D58",
          }}
        >
          <div className="text-3xl sm:text-4xl font-bold text-white mb-6">
            +971 50 702 0541
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 mb-5">
            <p className="text-white text-sm font-semibold mb-2">Available:</p>
            <p className="text-white/95 text-sm">
              {availableFromDay} – {availableToDay}
            </p>
            <p className="text-white/95 text-sm">
              {availableFrom} – {availableTo} (UTC+4)
            </p>
          </div>
          <a
            href="tel:8006427676"
            onClick={handleCallNowClick}
            className="w-full bg-white text-[#4a5383] font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Call Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <p className="text-gray-600 text-xs sm:text-sm md:text-base">
        Speak directly with our expert team and get immediate answers to your
        questions.
      </p>

      {/* Warning Message */}
      {warningMessage && (
        <div className="p-3 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm">
          {warningMessage}
        </div>
      )}

      <div>
        <a
          href="tel:+971507020541"
          className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-[rgba(55,70,158,1)]"
        >
          +971 50 702 0541
        </a>
      </div>
      <a
        href="tel:8006427676"
        onClick={handleCallNowClick}
        className="w-[181.5px] h-[51.6px] rounded-[5px] bg-white border border-[#3E234C] shadow-sm flex items-center justify-center gap-2 group"
        aria-label="Call Now"
      >
        <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-b from-[#3E234C] to-[#6C3C85]">
          Call Now
        </span>
        <span className="transform transition-transform group-hover:translate-x-1">
          <ArrowRight size={16} color="#6C3C85" />
        </span>
      </a>
      <div
        className="pl-4 py-2"
        style={{
          borderLeftWidth: "4px",
          borderLeftStyle: "solid",
          borderImageSource:
            "linear-gradient(180deg, #4555A7 0%, #53406B 100%)",
          borderImageSlice: 1,
        }}
      >
        <h3 className="font-bold text-gray-900 mb-2">Available:</h3>
        <p className="text-gray-700">
          {availableFromDay} - {availableToDay}
        </p>
        <p className="text-gray-700">
          {availableFrom} - {availableTo} (UTC+4)
        </p>
      </div>
    </div>
  );
};

export default CallNowForm;
