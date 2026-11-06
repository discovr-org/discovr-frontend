import { InstagramIcon, NavigationIcon, PhoneIcon, ShareIcon } from "./icons";
import styles from "./ActionRow.module.css";

export interface ActionRowProps {
  hostName: string;
  /** E.164 phone, e.g. "+919876543210" */
  phone: string;
  directionsHref: string;
  /** Omit if the host has no Instagram; the grid then has three columns. */
  instagramHandle?: string;
  onShare: () => void;
  /** Told when someone taps Call or Directions (the links still open as normal). */
  onAction?: (action: "call" | "directions") => void;
  /** When set, Call runs this instead of dialling (e.g. to gate it behind login). */
  onCall?: () => void;
}

/** Call, Directions, Instagram, Share. Real links where they leave the app. */
export function ActionRow({ hostName, phone, directionsHref, instagramHandle, onShare, onAction, onCall }: ActionRowProps) {
  const columns = instagramHandle ? 4 : 3;
  return (
    <div className={styles.row} style={columns === 3 ? { gridTemplateColumns: "repeat(3, 1fr)" } : undefined} role="group" aria-label="Contact the host">
      <a
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
      </a>
      <a
        className={styles.tile}
        href={directionsHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onAction?.("directions")}
      >
        <NavigationIcon />
        <span>Directions</span>
      </a>
      {instagramHandle && (
        <a
          className={styles.tile}
          href={`https://www.instagram.com/${instagramHandle}/`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${hostName} on Instagram`}
        >
          <InstagramIcon />
          <span>Instagram</span>
        </a>
      )}
      <button type="button" className={styles.tile} onClick={onShare} aria-label="Share this experience">
        <ShareIcon />
        <span>Share</span>
      </button>
    </div>
  );
}
