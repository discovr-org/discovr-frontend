/** Support line shown in ContactSheet. Placeholder until production number ships. */
export const DISCOVR_PHONE = "+918169992510";
export const DISCOVR_PHONE_DISPLAY = "+91 81699 92510";

/** WhatsApp chat with the team, optionally with the message typed in. */
export function discovrWhatsApp(text?: string): string {
  const base = `https://wa.me/${DISCOVR_PHONE.replace(/[^\d]/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
