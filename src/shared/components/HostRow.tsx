import type { Host } from "@/types/experience";
import { Avatar } from "./Avatar";
import styles from "./HostRow.module.css";

export interface HostRowProps {
  host: Host;
}

/**
 * Host card on the detail screen: avatar + "Hosted by …" + verified / handle / languages.
 * The whole row is the target — the avatar is not a button on its own.
 */
export function HostRow({ host }: HostRowProps) {
  const sub = [
    host.verified ? "Verified" : null,
    host.experienceCount != null
      ? `${host.experienceCount} experiences`
      : null,
    host.instagramHandle ? `@${host.instagramHandle}` : null,
    host.languages.length ? `speaks ${host.languages.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={styles.row}>
      <Avatar
        name={host.personName}
        src={host.avatar?.src}
        size="md"
        verified={host.verified}
      />
      <div>
        <div className={styles.name}>Hosted by {host.personName}</div>
        {sub ? <div className={styles.sub}>{sub}</div> : null}
      </div>
    </div>
  );
}
