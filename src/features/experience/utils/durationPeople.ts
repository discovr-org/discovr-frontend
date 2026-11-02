/**
 * People-row copy under the users icon.
 * Shape: "1 hr 45 mins | upto 15 people" / "By appointment" / "usually 6".
 */

export function formatDurationShort(raw: string): string {
  const text = raw.trim();
  if (!text) return "";

  const hoursMins = text.match(
    /(\d+)\s*hours?\s*(\d+)\s*min(?:ute)?s?/i,
  );
  if (hoursMins) {
    const h = Number(hoursMins[1]);
    const m = Number(hoursMins[2]);
    return `${h} hr${h === 1 ? "" : "s"} ${m} mins`;
  }

  const hoursOnly = text.match(/^(\d+)\s*hours?$/i);
  if (hoursOnly) {
    const h = Number(hoursOnly[1]);
    return h === 1 ? "1 hr" : `${h} hrs`;
  }

  const minsOnly = text.match(/^(\d+)\s*min(?:ute)?s?$/i);
  if (minsOnly) {
    return `${Number(minsOnly[1])} mins`;
  }

  // Already short forms like "1 hr 45 mins"
  return text
    .replace(/\bhours?\b/gi, (m) => (m.toLowerCase().startsWith("hour") ? (m.toLowerCase() === "hour" ? "hr" : "hrs") : m))
    .replace(/\bminutes?\b/gi, "mins")
    .replace(/\bmin\b/gi, "mins");
}

export function formatPeopleShort(raw: string): string {
  const text = raw.trim();
  if (!text) return "";

  // Generic "come solo / couple / friends" copy — hide it.
  if (/come solo|as a couple|with friends/i.test(text)) return "";

  if (/appointment/i.test(text)) return "By appointment";

  const usually = text.match(/usually\s+(\d+)/i);
  if (usually) return `usually ${usually[1]}`;

  const upto = text.match(/(?:up\s*to|upto|max(?:imum)?)\s*(\d+)/i);
  if (upto) return `upto ${upto[1]} people`;

  const justNum = text.match(/^(\d+)\s*people?$/i);
  if (justNum) return `upto ${justNum[1]} people`;

  return text;
}

/** One line for the people icon row. */
export function durationPeopleLine(
  duration: string,
  groupSize: string,
): { duration: string; people: string } {
  return {
    duration: formatDurationShort(duration),
    people: formatPeopleShort(groupSize),
  };
}
