import type { Host, HostCredit } from "@/types/experience";
import { Avatar } from "./Avatar";
import styles from "./HostRow.module.css";

export interface HostRowProps {
  host: Host;
  /** Off when the section heading already says "Run by …". */
  showCredit?: boolean;
}

export const CREDIT_LABEL: Record<HostCredit, string> = {
  hosted: "Hosted by",
  run: "Run by",
  owned: "Owned by",
};

/**
 * Host card on the detail screen: avatar + credit + business name + meta.
 * Credit is run by / hosted by / owned by (set in admin).
 */
export function HostRow({ host, showCredit = true }: HostRowProps) {
  const credit = host.credit ?? "hosted";
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
        name={host.businessName}
        src={host.avatar?.src}
        size="md"
        verified={host.verified}
      />
      <div>
        <div className={styles.name}>
          {showCredit ? `${CREDIT_LABEL[credit]} ` : ""}
          {host.businessName}
        </div>
        {sub ? <div className={styles.sub}>{sub}</div> : null}
      </div>
    </div>
  );
}
