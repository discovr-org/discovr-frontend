import type { Metadata } from "next";
import { HubIndex } from "@/features/hubs/components/HubPage";
import { buildHubs } from "@/features/hubs/utils/hubs";
import { JsonLd } from "@/shared/seo/components/JsonLd";
import { SITE_URL } from "@/shared/seo/utils/site";
import { getCatalogCards } from "@/shared/utils/catalogCached";

const INTRO =
  "Every place here is one someone from our team has been to. Pick an area, or pick what you feel like doing tonight.";

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
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "discovr", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Things to do in Goa", item: `${SITE_URL}/goa` },
          ],
        }}
      />
      <HubIndex hubs={hubs} intro={INTRO} />
    </>
  );
}
