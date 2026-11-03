import Link from "next/link";
import { Button } from "@/shared/components/Button";
import { ChevronDownIcon } from "@/shared/components/icons";
import styles from "../styles/about.module.css";

export const ABOUT_INTRO =
  "discovr is a guide to things to do in Goa, India. Someone from our team goes to every experience before it's listed, and writes a one-line verdict and the date they went. You find an experience here and book it directly with the host, on their site or by phone. discovr doesn't take payment.";

const STEPS = [
  {
    title: "Find it",
    text: "The home page is a short list of things to do in Goa, in sections. Search or filter by area, time and price if you know what you want.",
  },
  {
    title: "We went",
    text: "Every listing has a verdict from the person who went, the month they went, and the host's price with the date we last checked it.",
  },
  {
    title: "Book with the host",
    text: "You book directly with the host, on their site or by phone.",
  },
];

const FAQ = [
  {
    q: "What is discovr?",
    a: "discovr is a guide to things to do in Goa. Someone from our team has been to every experience on it, and each listing carries their verdict, the date they went and the price we checked.",
  },
  {
    q: "Is discovr free to use?",
    a: "Yes. Browsing is free and needs no account. You add a phone number if you want to save things or write a review.",
  },
  {
    q: "How do I book an experience?",
    a: "You book directly with the host, on their site or by phone. Each listing has the host's booking link or phone number.",
  },
  {
    q: "Does discovr take payment?",
    a: "No. You pay the host, and discovr doesn't take payments or a cut of the price you pay them.",
  },
  {
    q: "How does discovr choose what to list?",
    a: "We only list experiences someone from our team has been to, and we turn down anything we wouldn't recommend to a friend. Popular doesn't get a place on the list. The full answer is on the How we pick page.",
  },
  {
    q: "Can I list my experience on discovr?",
    a: "Yes. Tell us what you run on the List with us page. We visit before we list, so it can take a while.",
  },
  {
    q: "Which cities does discovr cover?",
    a: "Goa only, for now. We'll add other cities once we've been to what's in them.",
  },
  {
    q: "How are reviews checked?",
    a: "A review needs 2 to 6 photos taken at the experience. A person on our team reads every review and looks at every photo before it goes up.",
  },
];

export function AboutPage() {
  return (
    <div className="app-shell">
      <article className={styles.page}>
        <h1 className="display-md">About discovr</h1>
        <p className={styles.intro}>{ABOUT_INTRO}</p>

        <section className={styles.section} aria-labelledby="how-h">
          <h2 id="how-h">How it works</h2>
          <ol className={styles.steps}>
            {STEPS.map((step, i) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.num} aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="trust-h">
          <h2 id="trust-h">Why trust us</h2>
          <p>
            We only list what we&apos;ve been to, and some of what we visit never goes up.
            Prices are checked at least every 30 days. Reviews need photos taken there, and a
            person on our team reads each one before it shows.
          </p>
          <p>
            <Link href="/how-we-pick" className={styles.link}>
              How we pick
            </Link>
          </p>
        </section>

        <section className={styles.section} aria-labelledby="hosts-h">
          <h2 id="hosts-h">For hosts</h2>
          <p>
            Run something in Goa? Tell us about it. If it sounds right, someone from the team
            will come and try it. You keep taking your own bookings.
          </p>
          <p>
            <Link href="/list-with-us" className={styles.link}>
              List with us
            </Link>
          </p>
        </section>

        <section className={styles.section} aria-labelledby="where-h">
          <h2 id="where-h">Where we are</h2>
          <p>Goa, for now. We add a city when we can visit what&apos;s in it, so it will take a while.</p>
          <div className={styles.cta}>
            <Button href="/">See things to do in Goa</Button>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="faq-h">
          <h2 id="faq-h">Questions people ask</h2>
          <div className={styles.faq}>
            {FAQ.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary className={styles.faqSummary}>
                  <span>{item.q}</span>
                  <ChevronDownIcon />
                </summary>
                <p className={styles.faqAnswer}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
