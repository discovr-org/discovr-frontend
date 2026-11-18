import Image from "next/image";
import { AlertIcon, ChevronDownIcon, CrossIcon, InfoIcon, TickIcon } from "@/shared/components/icons";
import type { StoryBlock } from "@/types/experience";
import { rupees } from "../utils/schedule";
import styles from "../styles/storyBlocks.module.css";

/** The About story: headings, quotes, photos, steps, callouts, checklists, FAQs, in order. */
type StoryBlocksProps = {
  blocks: StoryBlock[];
  /** Admin preview only: where each block sits in the saved story, so a click can name it. */
  indexes?: number[];
  onFaqOpen?: (question: string, position: number) => void;
};

export function StoryBlocks({ blocks, indexes, onFaqOpen }: StoryBlocksProps) {
  // Two `half` blocks in a row sit side by side; a lone one stays full width.
  const rows: number[][] = [];
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].size === "half" && blocks[i + 1]?.size === "half") rows.push([i, ++i]);
    else rows.push([i]);
  }
  return (
    <div className={`${styles.stack} ds-keep-lines`}>
      {rows.map((row, i) => (
        <div key={i} className={row.length === 2 ? styles.halfPair : undefined}>
          {row.map((n) => (
            <div key={n} data-pv={indexes ? `block:${indexes[n]}` : undefined}>
              <Block block={blocks[n]} onFaqOpen={onFaqOpen} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Block({ block, onFaqOpen }: { block: StoryBlock; onFaqOpen?: (question: string, position: number) => void }) {
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
    case "stats":
      return (
        <dl className={styles.stats}>
          {block.items.map((item, i) => (
            <div key={i} className={styles.stat}>
              <dt className={styles.statLabel}>{item.label}</dt>
              <dd className={styles.statValue}>{item.value}</dd>
            </div>
          ))}
        </dl>
      );
    case "packages":
      return (
        <div className={styles.packages}>
          {block.title ? <h4 className={styles.headingSmall}>{block.title}</h4> : null}
          <ul className={styles.packageList}>
            {block.items.map((item, i) => {
              const amount = Number(item.price.replace(/[^\d.]/g, ""));
              return (
                <li key={i} className={styles.packageRow}>
                  <div>
                    <p className={styles.packageName}>{item.name}</p>
                    {item.detail ? <p className={styles.caption}>{item.detail}</p> : null}
                  </div>
                  <p className={styles.packagePrice}>{amount > 0 ? rupees(amount) : item.price}</p>
                </li>
              );
            })}
          </ul>
        </div>
      );
    case "faq":
      return (
        <div className={styles.qa}>
          {block.items.map((item, i) => (
            <details
              key={item.q}
              className={styles.qaItem}
              onToggle={(e) => {
                if (e.currentTarget.open) onFaqOpen?.(item.q, i + 1);
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
