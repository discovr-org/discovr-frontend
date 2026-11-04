"use client";

import { useId, useState } from "react";
import type { ListingHours, Place, WeekSchedule } from "@/types/experience";
import { durationPeopleLine } from "@/features/experience/utils/durationPeople";
import {
  WEEK,
  googleMapsPin,
  rupees,
  summarise,
  todayIndex,
} from "@/features/experience/utils/schedule";
import { todayStatus, weekRows as hoursWeekRows } from "@/features/experience/utils/venueHours";
import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  ClockIcon,
  PinIcon,
  RupeeIcon,
  UsersIcon,
} from "./icons";
import styles from "./InfoList.module.css";

export interface InfoListProps {
  priceFrom: number;
  /** No published tariff — show "Ask for the price" instead of From ₹… */
  askForPrice?: boolean;
  /** "+ taxes" vs "inclusive of taxes". */
  taxes?: "extra" | "inclusive";
  place: Place;
  schedule: WeekSchedule;
  /** Venue hours from catalog sheet when week grid is empty. */
  hours?: ListingHours;
  duration: string;
  groupSize: string;
  /** Bars/venues: hide price + people; open/closed hours instead of trips. */
  venue?: boolean;
  /** IANA timezone used to decide which day is "today". Defaults to India. */
  timeZone?: string;
  mapsHref?: string;
  /** Told when someone opens the week of hours or the map pin. */
  onAction?: (action: "hours" | "directions") => void;
}

const Sep = () => (
  <span className={styles.sep} aria-hidden="true">
    |
  </span>
);

const Dot = () => (
  <span className={styles.sep} aria-hidden="true">
    ·
  </span>
);

/** Price, place, times (week grid or venue hours), duration and group size. */
export function InfoList({
  priceFrom,
  askForPrice,
  taxes = "inclusive",
  place,
  schedule,
  hours,
  duration,
  groupSize,
  venue = false,
  timeZone,
  mapsHref,
  onAction,
}: InfoListProps) {
  const [open, setOpen] = useState(false);
  const toggleHours = () => {
    if (!open) onAction?.("hours");
    setOpen(!open);
  };
  const weekId = useId();
  const today = todayIndex(timeZone);
  const hasVenueHours = Boolean(hours?.days || hours?.timeSlot || hours?.altTimeSlot || hours?.closedDays?.length);
  const hasTripTimes = WEEK.some((d) => (schedule[d] ?? []).length > 0);
  const useHours = venue || (hasVenueHours && !hasTripTimes);
  const showTripSchedule = !venue && !useHours;
  const showPrice = !venue;
  const showPeople = !venue;
  const summary = showTripSchedule ? summarise(schedule, today) : null;
  // Places: open/closed right now. Trips: open today and the slot times.
  const openClosed = useHours && hours ? todayStatus(hours, venue, timeZone) : null;
  const pinHref = mapsHref || googleMapsPin(place.lat, place.lng);
  const placeName = place.neighborhood?.trim() || place.name;
  const placeLabel = `${placeName}${place.distance ? `, ${place.distance}` : ""}. Open in Google Maps`;
  const peopleLine = durationPeopleLine(duration, groupSize);

  const hoursWeek = hours ? hoursWeekRows(hours) : [];
  const weekRows =
    hoursWeek.length > 0 ? (
      <ul className={styles.week} id={weekId} hidden={!open} aria-label="Opening hours">
        {WEEK.map((day, i) => (
          <li
            key={day}
            className={[styles.day, i === today ? styles.today : "", hoursWeek[i] ? "" : styles.off].join(" ").trim()}
            aria-current={i === today ? "date" : undefined}
          >
            <span>
              {day}
              {i === today ? ", today" : ""}
            </span>
            <span>{hoursWeek[i] ?? "Closed"}</span>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <ul className={styles.list} aria-label="Key details">
      {showPrice ? (
        <li className={styles.row}>
          <RupeeIcon />
          <span className={styles.text}>
            {askForPrice ? (
              "Ask for the price"
            ) : (
              `From ${rupees(priceFrom)} per person${taxes === "extra" ? " + taxes" : ""}`
            )}
          </span>
        </li>
      ) : null}

      <li>
        <a
          className={styles.link}
          href={pinHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={placeLabel}
          onClick={() => onAction?.("directions")}
        >
          <PinIcon />
          <span className={styles.text}>
            <span className={styles.place}>{placeName}</span>
            {place.distance && (
              <>
                <Sep />
                <span className={styles.muted}>{place.distance}</span>
              </>
            )}
          </span>
          <ArrowUpRightIcon />
        </a>
      </li>

      {useHours && openClosed ? (
        <li>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={weekId}
            onClick={toggleHours}
          >
            <ClockIcon />
            <span className={styles.text}>
              <span
                className={openClosed.open ? styles.positive : styles.critical}
              >
                {openClosed.status}
              </span>
              {openClosed.hours ? (
                <>
                  <Dot />
                  {openClosed.hours}
                </>
              ) : null}
            </span>
            <ChevronDownIcon className={styles.chev} />
          </button>
          {weekRows}
        </li>
      ) : null}

      {useHours && !openClosed && hours ? (
        <li>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={weekId}
            onClick={toggleHours}
            disabled={!weekRows}
          >
            <ClockIcon />
            <span className={styles.text}>
              {[hours.days, hours.timeSlot].filter(Boolean).join(" · ") || "Hours on request"}
            </span>
            {weekRows ? <ChevronDownIcon className={styles.chev} /> : null}
          </button>
          {weekRows}
        </li>
      ) : null}

      {showTripSchedule ? (
        <li>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={weekId}
            onClick={toggleHours}
          >
            <ClockIcon />
            <span className={styles.text}>
              <span
                className={
                  summary && summary.kind === "today"
                    ? styles.positive
                    : styles.critical
                }
              >
                {summary?.status}
              </span>
              {summary &&
                (summary.kind === "today" ? summary.times : summary.next) && (
                  <>
                    <Dot />
                    {summary.kind === "today" ? summary.times : summary.next}
                  </>
                )}
            </span>
            <ChevronDownIcon className={styles.chev} />
          </button>
          <ul
            className={styles.week}
            id={weekId}
            hidden={!open}
            aria-label="Trip times this week"
          >
            {WEEK.map((day, i) => {
              const times = schedule[day] ?? [];
              const isToday = i === today;
              const cls = [
                styles.day,
                isToday ? styles.today : "",
                times.length ? "" : styles.off,
              ]
                .join(" ")
                .trim();
              return (
                <li
                  key={day}
                  className={cls}
                  aria-current={isToday ? "date" : undefined}
                >
                  <span>
                    {day}
                    {isToday ? ", today" : ""}
                  </span>
                  <span>{times.length ? times.join(", ") : "No trips"}</span>
                </li>
              );
            })}
          </ul>
        </li>
      ) : null}

      {showPeople && (peopleLine.duration || peopleLine.people) ? (
        <li className={styles.row}>
          <UsersIcon />
          <span className={styles.text}>
            {peopleLine.duration}
            {peopleLine.duration && peopleLine.people ? <Sep /> : null}
            {peopleLine.people}
          </span>
        </li>
      ) : null}
    </ul>
  );
}
