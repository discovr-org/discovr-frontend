/** "45 mins" / "1 hr" / "2 hrs 30 mins". Empty when unknown. */
export function formatDuration(minutes: number | undefined): string {
  if (!minutes || minutes <= 0) return "";
  if (minutes < 60) return `${minutes} mins`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hours = `${h} hr${h === 1 ? "" : "s"}`;
  return m ? `${hours} ${m} mins` : hours;
}
