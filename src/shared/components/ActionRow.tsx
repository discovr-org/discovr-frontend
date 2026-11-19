import { GlobeIcon, InstagramIcon, MessageIcon, NavigationIcon, PhoneIcon, ShareIcon } from "./icons";
import styles from "./ActionRow.module.css";

export type ActionButtonId = "call" | "directions" | "instagram" | "whatsapp" | "website" | "share";

/** The row as it has always been. A layout can pick its own. */
export const DEFAULT_ACTION_BUTTONS: ActionButtonId[] = ["call", "directions", "instagram", "share"];

export interface ActionRowProps {
  hostName: string;
  /** E.164 phone, e.g. "+919876543210". Empty hides Call. */
  phone: string;
  directionsHref: string;
  /** Empty hides Instagram. */
  instagramHandle?: string;
  /** Empty hides WhatsApp. */
  whatsappHref?: string;
  /** Empty hides Website. */
  websiteHref?: string;
  /** Which buttons to show, in this order. A button with nothing to open is left out. */
  buttons?: ActionButtonId[];
  onShare: () => void;
  /** Told when someone taps Call or Directions (the links still open as normal). */
  onAction?: (action: "call" | "directions") => void;
  /** When set, Call runs this instead of dialling (e.g. to gate it behind login). */
  onCall?: () => void;
}

/** Call, Directions, Instagram, WhatsApp, Website, Share. Real links where they leave the app. */
export function ActionRow({ hostName, phone, directionsHref, instagramHandle, whatsappHref, websiteHref, buttons = DEFAULT_ACTION_BUTTONS, onShare, onAction, onCall }: ActionRowProps) {
  const external = { target: "_blank", rel: "noopener noreferrer" } as const;
  const tiles = buttons.flatMap((id) => {
    switch (id) {
      case "call":
        return phone
          ? [
              <a
                key={id}
                className={styles.tile}
                href={`tel:${phone}`}
                aria-label={`Call ${hostName}`}
                onClick={(e) => {
                  onAction?.("call");
                  if (!onCall) return;
                  e.preventDefault();
                  onCall();
                }}
              >
                <PhoneIcon />
                <span>Call</span>
              </a>,
            ]
          : [];
      case "directions":
        return [
          <a key={id} className={styles.tile} href={directionsHref} {...external} onClick={() => onAction?.("directions")}>
            <NavigationIcon />
            <span>Directions</span>
          </a>,
        ];
      case "instagram":
        return instagramHandle
          ? [
              <a key={id} className={styles.tile} href={`https://www.instagram.com/${instagramHandle}/`} {...external} aria-label={`${hostName} on Instagram`}>
                <InstagramIcon />
                <span>Instagram</span>
              </a>,
            ]
          : [];
      case "whatsapp":
        return whatsappHref
          ? [
              <a key={id} className={styles.tile} href={whatsappHref} {...external} aria-label={`${hostName} on WhatsApp`}>
                <MessageIcon />
                <span>WhatsApp</span>
              </a>,
            ]
          : [];
      case "website":
        return websiteHref
          ? [
              <a key={id} className={styles.tile} href={websiteHref} {...external} aria-label={`${hostName} website`}>
                <GlobeIcon />
                <span>Website</span>
              </a>,
            ]
          : [];
      case "share":
        return [
          <button key={id} type="button" className={styles.tile} onClick={onShare} aria-label="Share this experience">
            <ShareIcon />
            <span>Share</span>
          </button>,
        ];
    }
  });
  // Up to four sit in one row; more wrap into rows of three.
  const columns = tiles.length <= 4 ? Math.max(tiles.length, 1) : 3;
  return (
    <div className={styles.row} style={columns === 4 ? undefined : { gridTemplateColumns: `repeat(${columns}, 1fr)` }} role="group" aria-label="Contact the host">
      {tiles}
    </div>
  );
}
