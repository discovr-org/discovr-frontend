import type { Metadata } from "next";
import { HubIndex } from "@/features/hubs/components/HubPage";
import { buildHubs } from "@/features/hubs/utils/hubs";
import { GOA_ANSWER, GOA_FAQS } from "@/features/hubs/utils/guides";
import { JsonLd } from "@/shared/seo/components/JsonLd";
import { SITE_URL } from "@/shared/seo/utils/site";
import { getCatalogCards } from "@/shared/utils/catalogCached";

const INTRO = GOA_ANSWER;

export const metadata: Metadata = {
  title: "Things to do in Goa",
  description: INTRO,
  alternates: { canonical: "/goa" },
  openGraph: { title: "Things to do in Goa", description: INTRO },
};

export default async function Page() {
  const cards = await getCatalogCards().catch(() => []);
  const hubs = buildHubs(cards);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "discovr", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Things to do in Goa", item: `${SITE_URL}/goa` },
              ],
            },
            {
              "@type": "ItemList",
              name: "Things to do in Goa",
              itemListElement: hubs.map((h, i) => ({ "@type": "ListItem", position: i + 1, name: h.title, url: `${SITE_URL}/goa/${h.slug}` })),
            },
            {
              "@type": "FAQPage",
              mainEntity: GOA_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ],
        }}
      />
      <HubIndex hubs={hubs} intro={INTRO} faqs={GOA_FAQS} />
    </>
  );
}
