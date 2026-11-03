import type { Experience, ExperienceContent, StoryBlock } from "@/types/experience";
import { isVenueListing } from "./listingKind";
import { rupees } from "./schedule";

/**
 * The About story for a listing. Uses the stored blocks when the listing has
 * them, else builds the same shape from the structured fields.
 */
export function storyBlocks(x: Experience): StoryBlock[] {
  const stored = x.content?.blocks;
  if (stored?.length) return stored;
  return isVenueListing(x) ? venueStory(x) : tripStory(x);
}

function tripStory(x: Experience): StoryBlock[] {
  const c = x.content ?? {};
  const blocks: StoryBlock[] = [{ type: "heading", level: "section", text: x.title }, { type: "line" }];
  const pitch = c.pitch?.trim();
  if (pitch) blocks.push({ type: "quote", text: pitch, plain: true }, { type: "line" });
  if (x.about?.trim()) {
    blocks.push({ type: "text", paragraphs: [{ text: "About", strong: true }, { text: x.about.trim() }] });
  }
  const photo = x.photos[1] ?? x.photos[0];
  if (photo) blocks.push({ type: "photo", src: photo.src, alt: photo.alt });
  const facts = detailFacts(x);
  if (facts.length) {
    blocks.push({
      type: "text",
      paragraphs: facts.flatMap(([label, value]) => [{ text: label, strong: true }, { text: value }]),
    });
  }
  const included = x.included.filter((i) => i.included).map((i) => i.title);
  const notIncluded = x.included.filter((i) => !i.included).map((i) => i.title.replace(/^not included:\s*/i, ""));
  if (included.length || notIncluded.length) {
    blocks.push({
      type: "forNotFor",
      columns: [
        ...(included.length ? [{ title: "What's Included", tone: "included" as const, items: included }] : []),
        ...(notIncluded.length ? [{ title: "What's Not Included", tone: "bring" as const, items: notIncluded }] : []),
      ],
    });
  }
  blocks.push(
    { type: "line" },
    { type: "heading", level: "small", text: "The Process" },
    {
      type: "steps",
      items: [
        { marker: "1.", title: "Find it on discovr", caption: "You're here already" },
        { marker: "2.", title: "Call & book your slot", caption: `Call ${x.host.businessName} directly to book` },
        { marker: "3.", title: "Show up", caption: `Arrive at ${x.place.neighborhood?.trim() || x.place.name} on time for your slot` },
      ],
    },
  );
  const health = c.healthAdvisory?.trim();
  if (health) blocks.push({ type: "callout", tone: "heads_up", title: "Health Advisory", paragraphs: [health] });
  const carry = carryList(c);
  if (carry.length) {
    blocks.push({ type: "line" }, { type: "checklist", title: "Things to Get With You", items: carry });
  }
  const tips = knowBeforeYouGo(x);
  if (tips.length) blocks.push({ type: "callout", tone: "tip", title: "Know Before You Go", paragraphs: tips });
  const faqs = (c.faqs ?? []).filter((f) => f.q.trim() && f.a.trim());
  if (faqs.length) {
    blocks.push({ type: "line" }, { type: "heading", level: "small", text: "FAQ's" }, { type: "faq", items: faqs });
  }
  return blocks;
}

function venueStory(x: Experience): StoryBlock[] {
  const blocks: StoryBlock[] = [{ type: "heading", level: "section", text: x.title }, { type: "line" }];
  const lead = x.about?.trim() || x.content?.pitch?.trim();
  if (lead) blocks.push({ type: "quote", text: lead, plain: true });
  const photo = x.photos[1] ?? x.photos[0];
  if (photo) blocks.push({ type: "photo", src: photo.src, alt: photo.alt });
  const price = venuePriceLine(x);
  if (price) blocks.push({ type: "text", paragraphs: [{ text: "Price", strong: true }, { text: price }] });
  blocks.push({ type: "line" });
  return blocks;
}

/** Places: the sheet's own price line, e.g. "₹3,000 for two (approx)". */
function venuePriceLine(x: Experience): string {
  const narrative = x.content?.priceNarrative?.trim();
  if (narrative) return narrative;
  if (x.price.askForPrice || !x.price.fromAmount) return "";
  const unit = x.content?.priceUnit?.trim();
  return unit ? `${rupees(x.price.fromAmount)}, ${unit}` : `${rupees(x.price.fromAmount)} per person`;
}

function detailFacts(x: Experience): Array<[string, string]> {
  const c = x.content ?? {};
  const facts: Array<[string, string]> = [];
  const age = x.hours?.ageGroup?.trim();
  const fitness = (c.fitnessLevel || c.difficulty || x.hours?.difficulty || "").trim();
  const ratio = c.instructorRatio?.trim();
  if (age) facts.push(["Age", age]);
  if (fitness) facts.push(["Fitness Levels", fitness]);
  if (ratio) facts.push(["Student Instructor Ratio", ratio]);
  return facts;
}

function carryList(c: ExperienceContent): string[] {
  if (c.carry?.length) return c.carry.map((s) => s.trim()).filter(Boolean);
  return (c.whatToCarry ?? "")
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function knowBeforeYouGo(x: Experience): string[] {
  const c = x.content ?? {};
  const tips = [...(c.knowBeforeYouGo ?? [])];
  const info = c.additionalInfo?.trim();
  if (info && !tips.some((tip) => info.includes(tip.trim()))) tips.push(info);
  return [...new Set(tips.map((s) => s.trim()).filter(Boolean))];
}
