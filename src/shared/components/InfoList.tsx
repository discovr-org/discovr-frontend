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
import {
  openTodayStatus,
  venueHoursStatus,
} from "@/features/experience/utils/venueHours";
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
}

const Sep = () => (
  <span className={styles.sep} aria-hidden="true">
    |
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
}: InfoListProps) {
  const [open, setOpen] = useState(false);
  const weekId = useId();
  const today = todayIndex(timeZone);
  const hasVenueHours = Boolean(
    hours?.days || hours?.timeSlot || hours?.bestTime,
  );
  const hasTripTimes = WEEK.some((d) => (schedule[d] ?? []).length > 0);
  const useHours = venue || (hasVenueHours && !hasTripTimes);
  const showTripSchedule = !venue && !useHours;
  const showPrice = !venue;
  const showPeople = !venue;
  const summary = showTripSchedule ? summarise(schedule, today) : null;
  // Places: open/closed right now. Trips: open today and the slot times.
  const openClosed = !useHours
    ? null
    : venue
      ? (venueHoursStatus(hours?.timeSlot, timeZone) ??
        openTodayStatus(hours?.days, hours?.timeSlot, timeZone))
      : (openTodayStatus(hours?.days, hours?.timeSlot, timeZone) ??
        venueHoursStatus(hours?.timeSlot, timeZone));
  const pinHref = mapsHref || googleMapsPin(place.lat, place.lng);
  const placeName = place.neighborhood?.trim() || place.name;
  const placeLabel = `${placeName}${place.distance ? `, ${place.distance}` : ""}. Open in Google Maps`;
  const peopleLine = durationPeopleLine(duration, groupSize);

  const hoursDetail = [
    hours?.days,
    hours?.timeSlot,
    hours?.bestTime ? `Best: ${hours.bestTime}` : null,
  ].filter(Boolean) as string[];

  return (
    <ul className={styles.list} aria-label="Key details">
      {showPrice ? (
        <li className={styles.row}>
          <RupeeIcon />
          <span className={styles.text}>
            {askForPrice ? (
              "Ask for the price"
            ) : (
              <>
                From {rupees(priceFrom)} per person
                <Sep />
                <span className={styles.muted}>
                  {taxes === "extra" ? "+ taxes" : "inclusive of taxes"}
                </span>
              </>
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
            onClick={() => setOpen((o) => !o)}
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
                  <Sep />
                  {openClosed.hours}
                </>
              ) : null}
            </span>
            <ChevronDownIcon className={styles.chev} />
          </button>
          {hoursDetail.length > 0 ? (
            <ul
              className={styles.week}
              id={weekId}
              hidden={!open}
              aria-label="Opening hours"
            >
              {hoursDetail.map((line) => (
                <li key={line} className={styles.day}>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ) : null}

      {useHours && !openClosed && hours ? (
        <li>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={weekId}
            onClick={() => setOpen((o) => !o)}
            disabled={hoursDetail.length === 0}
          >
            <ClockIcon />
            <span className={styles.text}>
              {[hours.days, hours.timeSlot].filter(Boolean).join(" · ") ||
                hours.bestTime ||
                "Hours on request"}
            </span>
            {hoursDetail.length > 0 ? (
              <ChevronDownIcon className={styles.chev} />
            ) : null}
          </button>
          {hoursDetail.length > 0 ? (
            <ul
              className={styles.week}
              id={weekId}
              hidden={!open}
              aria-label="Opening hours"
            >
              {hoursDetail.map((line) => (
                <li key={line} className={styles.day}>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ) : null}

      {showTripSchedule ? (
        <li>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={weekId}
            onClick={() => setOpen((o) => !o)}
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
                    <Sep />
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
