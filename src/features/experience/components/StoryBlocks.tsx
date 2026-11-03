import Image from "next/image";
import { AlertIcon, ChevronDownIcon, CrossIcon, InfoIcon, TickIcon } from "@/shared/components/icons";
import type { StoryBlock } from "@/types/experience";
import styles from "../styles/storyBlocks.module.css";

/** The About story: headings, quotes, photos, steps, callouts, checklists, FAQs, in order. */
type StoryBlocksProps = {
  blocks: StoryBlock[];
  onFaqOpen?: (question: string) => void;
};

export function StoryBlocks({ blocks, onFaqOpen }: StoryBlocksProps) {
  return (
    <div className={`${styles.stack} ds-keep-lines`}>
      {blocks.map((block, i) => (
        <div key={i}>
          <Block block={block} onFaqOpen={onFaqOpen} />
        </div>
      ))}
    </div>
  );
}

function Block({ block, onFaqOpen }: { block: StoryBlock; onFaqOpen?: (question: string) => void }) {
  switch (block.type) {
    case "heading":
      return block.level === "section" ? (
        <h3 className={styles.headingSection}>{block.text}</h3>
      ) : (
        <h4 className={styles.headingSmall}>{block.text}</h4>
      );
    case "line":
      return <hr className={styles.line} />;
    case "quote":
      return (
        <figure className={`${styles.quote} ${block.plain === false ? styles.quotePull : styles.quotePlain}`}>
          <blockquote>
            <p>{block.text}</p>
          </blockquote>
          {block.cite ? <figcaption className={styles.attribution}>{block.cite}</figcaption> : null}
        </figure>
      );
    case "text":
      return (
        <div className={styles.text}>
          {block.paragraphs.map((p, i) => (
            <p key={i}>{p.strong ? <strong>{p.text}</strong> : p.text}</p>
          ))}
        </div>
      );
    case "photo":
      return (
        <figure className={styles.figure}>
          <div className={styles.photo}>
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="(min-width: 1024px) 720px, (min-width: 600px) 688px, 100vw"
            />
          </div>
          {block.caption ? <figcaption className={styles.caption}>{block.caption}</figcaption> : null}
        </figure>
      );
    case "forNotFor":
      return (
        <div className={styles.forNotFor}>
          {block.columns.map((col) => (
            <section key={col.title} className={styles.column}>
              <h4 className={styles.columnTitle}>{col.title}</h4>
              <ul>
                {col.items.map((item) => (
                  <li key={item}>
                    <span
                      className={`${styles.fnfIcon} ${col.tone === "included" ? styles.iconIncluded : styles.iconBring}`}
                    >
                      {col.tone === "included" ? <TickIcon /> : <CrossIcon />}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      );
    case "steps":
      return (
        <ol className={styles.timeline}>
          {block.items.map((step, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.stepTime}>{step.marker}</span>
              <div className={styles.stepBody}>
                <p className={styles.stepTitle}>{step.title}</p>
                {step.caption ? <p className={styles.caption}>{step.caption}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <aside className={`${styles.callout} ${block.tone === "heads_up" ? styles.calloutHeadsUp : styles.calloutTip}`}>
          <div className={styles.calloutHead}>
            {block.tone === "heads_up" ? <AlertIcon /> : <InfoIcon />}
            <p className={styles.calloutTitle}>{block.title}</p>
          </div>
          <div className={`${styles.text} ${styles.calloutBody}`}>
            {block.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </aside>
      );
    case "checklist":
      return (
        <div className={styles.checklist}>
          <h4 className={styles.headingSmall}>{block.title}</h4>
          <ul className={styles.checkItems}>
            {block.items.map((item) => (
              <li key={item} className={styles.checkItem}>
                <span className={styles.iconIncluded}>
                  <TickIcon />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "faq":
      return (
        <div className={styles.qa}>
          {block.items.map((item) => (
            <details
              key={item.q}
              className={styles.qaItem}
              onToggle={(e) => {
                if (e.currentTarget.open) onFaqOpen?.(item.q);
              }}
            >
              <summary className={styles.qaSummary}>
                <span className={styles.qaQuestion}>{item.q}</span>
                <ChevronDownIcon />
              </summary>
              <p className={styles.qaAnswer}>{item.a}</p>
            </details>
          ))}
        </div>
      );
  }
}
