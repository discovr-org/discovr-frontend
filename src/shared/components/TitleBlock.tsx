import styles from "./TitleBlock.module.css";

export interface TitleBlockProps {
  title: string;
  hostName: string;
  /** Where the host name links to, normally the host section on the same page. */
  hostHref?: string;
}

/** The screen's h1 in display-md, then "by <host>" underlined as a link. */
export function TitleBlock({ title, hostName, hostHref = "#host" }: TitleBlockProps) {
  return (
    <div className={styles.block}>
      <h1 className="t-display-md">{title}</h1>
      <p className={`t-body ${styles.byline}`}>
        by <a href={hostHref}>{hostName}</a>
      </p>
    </div>
  );
}
