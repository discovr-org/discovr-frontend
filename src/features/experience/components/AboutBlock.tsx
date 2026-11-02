import Image from "next/image";
import { useId } from "react";
import type { Photo } from "@/types/experience";
import styles from "../styles/listingSections.module.css";

export interface AboutBlockProps {
  /** The listing name, repeated as the big heading under the "About" label. */
  title: string;
  /** Italic lead: the pitch for experiences, the whole description for places. */
  lead?: string;
  /** Plain description under the lead. */
  text?: string;
  photo?: Photo;
}

/** About: small label, the name as a heading, italic lead, description, one photo. */
export function AboutBlock({ title, lead, text, photo }: AboutBlockProps) {
  const headingId = useId();
  return (
    <section className={styles.about} aria-labelledby={headingId}>
      <p className={`t-caption ${styles.overline}`}>About</p>
      <h2 className="t-display-md" id={headingId}>
        {title}
      </h2>
      {lead ? <p className={`t-body ${styles.italic}`}>{lead}</p> : null}
      {text ? (
        <p className={`t-body ${lead ? styles.body : ""}`}>{text}</p>
      ) : null}
      {photo ? (
        <div className={`${styles.photo} photo-lift`}>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            unoptimized={photo.src.startsWith("http")}
          />
        </div>
      ) : null}
    </section>
  );
}
