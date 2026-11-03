import type { HostCredit } from "@/types/experience";
import styles from "./Disclaimer.module.css";

export type DisclaimerProps = {
  hostName: string;
  /** Matches admin credit: run / hosted / owned. */
  credit?: HostCredit;
};

const VERB: Record<HostCredit, string> = {
  run: "runs",
  hosted: "hosts",
  owned: "owns",
};

/** Quiet footnote: discovr's standard disclaimer on every listing. */
export function Disclaimer({ hostName, credit = "hosted" }: DisclaimerProps) {
  const verb = VERB[credit];
  return (
    <aside className={styles.root} aria-label="About booking">
      <p>
        {hostName} {verb} this experience and handles the booking. discovr isn&apos;t part of the
        booking or the payment. We&apos;ve been, and we vouch for what&apos;s on this page, but check
        the price and terms with {hostName} before you pay.
      </p>
      <a href="/legal/disclaimer" className={styles.link}>
        Read the full disclaimer
      </a>
    </aside>
  );
}
