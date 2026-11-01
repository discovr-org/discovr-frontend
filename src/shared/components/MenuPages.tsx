import Image from "next/image";
import type { MenuPage } from "@/types/experience";
import styles from "./MenuPages.module.css";

export interface MenuPagesProps {
  pages: MenuPage[];
  /** Opens the reader at page `index`. The button that was pressed is passed so focus can return to it. */
  onOpen: (index: number, opener: HTMLElement) => void;
}

/** The cover of the venue's menu with the page count under it. Tapping it opens <MenuViewer>. */
export function MenuPages({ pages, onOpen }: MenuPagesProps) {
  if (!pages.length) return null;
  const n = pages.length;
  const count = `${n} ${n === 1 ? "page" : "pages"}`;
  return (
    <div className={styles.row}>
      <button type="button" className={styles.tile} aria-label={`Open the menu, ${count}`} onClick={(e) => onOpen(0, e.currentTarget)}>
        <span className={`${styles.stack} ${n > 1 ? "" : styles.single}`}>
          <span className={styles.thumb}>
            <Image src={pages[0].src} alt="" fill sizes="180px" />
          </span>
        </span>
        <span className={styles.count}>{count}</span>
      </button>
    </div>
  );
}
