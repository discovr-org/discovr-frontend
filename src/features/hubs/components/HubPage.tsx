import Link from "next/link";
import { areaOf } from "@/features/home/utils/feedFilters";
import { priceLabel } from "@/features/home/utils/feedData";
import type { Hub } from "@/features/hubs/utils/hubs";
import styles from "@/features/hubs/styles/hubs.module.css";
import { AS_OF } from "@/features/hubs/utils/guides";
import { ExperienceCard } from "@/shared/components/ExperienceCard";

/** One hub: answer first, then every listing, then the other hubs. */
export function HubPage({ hub, others }: { hub: Hub; others: Hub[] }) {
  return (
    <article className={styles.page}>
      <h1 className="display-md">{hub.title}</h1>
      <p className={styles.intro}>{hub.intro}</p>

      <div className={styles.stack}>
        {hub.items.map((item, i) => (
          <ExperienceCard
            key={item.slug}
            density="landscape"
            href={`/experiences/${item.slug}`}
            title={item.title}
            placeLabel={areaOf(item)}
            imageSrc={item.imageSrc}
            imageAlt={item.imageAlt}
            blurb={item.blurb}
            durationLabel={item.durationLabel}
            priceLabel={priceLabel(item)}
            priority={i === 0}
          />
        ))}
      </div>

      {hub.guide ? (
        <>
          <section className={styles.section} aria-labelledby="compare-h">
            <h2 id="compare-h">Compared</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Place</th>
                    <th>Area</th>
                    <th>Best for</th>
                    <th>Price</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {hub.guide.rows.map((r) => (
                    <tr key={r.slug}>
                      <td>
                        <Link href={`/experiences/${r.slug}`} className={styles.link}>
                          {r.name}
                        </Link>
                      </td>
                      <td>{r.area}</td>
                      <td>{r.bestFor}</td>
                      <td>{r.price}</td>
                      <td>{r.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.count}>Details as listed on {AS_OF}.</p>
          </section>
          <section className={styles.section} aria-labelledby="faq-h">
            <h2 id="faq-h">Questions</h2>
            {hub.guide.faqs.map((f) => (
              <div key={f.q}>
                <h3 className={styles.q}>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </section>
        </>
      ) : null}

      {others.length > 0 ? (
        <section className={styles.section} aria-labelledby="more-h">
          <h2 id="more-h">More of Goa</h2>
          <ul className={styles.links}>
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/goa/${o.slug}`} className={styles.link}>
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

export function HubIndex({ hubs, intro, faqs }: { hubs: Hub[]; intro: string; faqs: { q: string; a: string }[] }) {
  return (
    <article className={styles.page}>
      <h1 className="display-md">Things to do in Goa</h1>
      <p className={styles.intro}>{intro}</p>
      <ul className={styles.links}>
        {hubs.map((h) => (
          <li key={h.slug}>
            <Link href={`/goa/${h.slug}`} className={styles.link}>
              {h.title}
            </Link>{" "}
            <span className={styles.count}>{h.items.length} places</span>
          </li>
        ))}
      </ul>
      <section className={styles.section} aria-labelledby="faq-h">
        <h2 id="faq-h">Questions</h2>
        {faqs.map((f) => (
          <div key={f.q}>
            <h3 className={styles.q}>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
