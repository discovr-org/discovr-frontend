import styles from "./Disclaimer.module.css";

export type DisclaimerProps = {
  hostName: string;
};

/** Quiet footnote: discovr's standard disclaimer on every listing. */
export function Disclaimer({ hostName }: DisclaimerProps) {
  return (
    <aside className={styles.box} aria-label="Disclaimer">
      <p className={styles.text}>
        {hostName} runs this and takes your booking. Payments go to them, not
        through discovr.{" "}
        <a href="/terms" className={styles.link}>
          Read the full disclaimer
        </a>
        .
      </p>
      <p className={styles.links}>
        <a href="/privacy" className={styles.link}>
          Report wrong information
        </a>
        <span aria-hidden="true"> · </span>
        <a href="tel:+918169992510" className={styles.link}>
          Any problems with the experience? Contact us
        </a>
      </p>
    </aside>
  );
}
