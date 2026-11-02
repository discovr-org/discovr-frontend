"use client";

import { useId, useState } from "react";
import type { ListingHours, Place, WeekSchedule } from "@/types/experience";
import {
  WEEK,
  googleMapsPin,
  rupees,
  summarise,
  todayIndex,
} from "@/features/experience/utils/schedule";
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
  /** e.g. "paid to the host" */
  paidTo: string;
  /** No published tariff — show "Ask for the price" instead of From ₹… */
  askForPrice?: boolean;
  place: Place;
  schedule: WeekSchedule;
  /** Venue hours from catalog sheet when week grid is empty. */
  hours?: ListingHours;
  duration: string;
  groupSize: string;
  /** IANA timezone used to decide which day is "today". Defaults to India. */
  timeZone?: string;
  mapsHref?: string;
}

const Sep = () => (
  <span className={styles.sep} aria-hidden="true">
    ·
  </span>
);

function hoursLine(hours: ListingHours): string {
  const parts = [hours.days, hours.timeSlot].filter(Boolean);
  return parts.join(" · ") || hours.bestTime || "Hours on request";
}

/** Price, place, times (week grid or venue hours), duration and group size. */
export function InfoList({
  priceFrom,
  paidTo,
  askForPrice,
  place,
  schedule,
  hours,
  duration,
  groupSize,
  timeZone,
  mapsHref,
}: InfoListProps) {
  const [open, setOpen] = useState(false);
  const weekId = useId();
  const today = todayIndex(timeZone);
  const useHours =
    Boolean(hours?.days || hours?.timeSlot || hours?.bestTime) &&
    !WEEK.some((d) => (schedule[d] ?? []).length > 0);
  const summary = useHours
    ? null
    : summarise(schedule, today);
  const pinHref = mapsHref || googleMapsPin(place.lat, place.lng);
  const placeLabel = `${place.name}${place.distance ? `, ${place.distance}` : ""}. Open in Google Maps`;

  return (
    <ul className={styles.list} aria-label="Key details">
      <li className={styles.row}>
        <RupeeIcon />
        <span className={styles.text}>
          {askForPrice ? (
            <>
              Ask for the price
              <Sep />
              <span className={styles.muted}>{paidTo}</span>
            </>
          ) : (
            <>
              From {rupees(priceFrom)} per person
              <Sep />
              <span className={styles.muted}>{paidTo}</span>
            </>
          )}
        </span>
      </li>

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
            <span className={styles.place}>{place.name}</span>
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

      {useHours && hours ? (
        <li className={styles.row}>
          <ClockIcon />
          <span className={styles.text}>{hoursLine(hours)}</span>
        </li>
      ) : (
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
                  (summary.kind === "today"
                    ? summary.times
                    : summary.next) && (
                    <>
                      <Sep />
                      {summary.kind === "today"
                        ? summary.times
                        : summary.next}
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
      )}

      <li className={styles.row}>
        <UsersIcon />
        <span className={styles.text}>
          {duration}
          <Sep />
          {groupSize}
        </span>
      </li>
    </ul>
  );
}
