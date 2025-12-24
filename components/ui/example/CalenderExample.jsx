"use client";

import { useState } from "react";
import { LuCalendar } from "react-icons/lu";
import { Calendar } from "../calender/Calender";
import { DateRangePicker } from "../calender/DateRangePicker";

export default function CalendarExamples() {
  const [birthday, setBirthday] = useState(null);
  const [eventDate, setEventDate] = useState(null);
  const [meetingDate, setMeetingDate] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Calculate age when birthday changes
  const handleBirthdayChange = (date) => {
    setBirthday(date);
    if (date) {
      const ageDifMs = Date.now() - date.getTime();
      const ageDate = new Date(ageDifMs);
      setAge(Math.abs(ageDate.getUTCFullYear() - 1970));
    } else {
      setAge(null);
    }
  };

  // Calculate Date
  const today = new Date();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 0);

  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120);

  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(today.getDate() + 14);

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  return (
    <div className="max-w-5xl mx-auto mb-20 ">
      <h1 className="  mb-8">Calendar Examples</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Calendar
          label="Event Date"
          value={eventDate}
          onChange={setEventDate}
          minDate={tomorrow}
          maxDate={sixMonthsLater}
          helperText="Events must be booked at least 1 day in advance"
          startIcon={<LuCalendar className="h-4 w-4" />}
          required
        />

        <DateRangePicker
          label="Check-in / Check-out"
          value={dateRange}
          onChange={setDateRange}
          minDate={tomorrow}
          maxDate={oneYearLater}
          helperText="Select your stay dates"
          placeholder="Select check-in and check-out dates"
        />

        <Calendar
          label="Date of Birth"
          value={birthday}
          onChange={handleBirthdayChange}
          format="dd MMMM yyyy"
          maxDate={today}
          minDate={minDate}
          helperText="Select your date of birth"
          placeholder="DD Month YYYY"
        />

        <Calendar
          label="Meeting Date"
          value={meetingDate}
          onChange={setMeetingDate}
          helperText="Weekdays only"
          isDateDisabled={(date) => !isWeekday(date)}
          required
        />

        <Calendar
          label="Delivery Date"
          value={deliveryDate}
          onChange={setDeliveryDate}
          minDate={today}
          maxDate={twoWeeksLater}
          isDateDisabled={(date) => date.getDay() === 0}
          helperText="Deliveries available Monday-Saturday, within the next 2 weeks"
        />
      </div>
    </div>
  );
}
