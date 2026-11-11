import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HubPage } from "@/features/hubs/components/HubPage";
import { FALLBACK_HUB_SLUGS, buildHubs } from "@/features/hubs/utils/hubs";
import { JsonLd } from "@/shared/seo/components/JsonLd";
import { SITE_URL } from "@/shared/seo/utils/site";
import { getCatalogCards } from "@/shared/utils/catalogCached";

type PageProps = { params: Promise<{ hub: string }> };

async function findHub(slug: string) {
  const cards = await getCatalogCards().catch(() => []);
  const hubs = buildHubs(cards);
  return { hub: hubs.find((h) => h.slug === slug), hubs };
}

export async function generateStaticParams() {
  const cards = await getCatalogCards().catch(() => []);
  const slugs = buildHubs(cards).map((h) => h.slug);
  return (slugs.length ? slugs : FALLBACK_HUB_SLUGS).map((hub) => ({ hub }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hub: slug } = await params;
  const { hub } = await findHub(slug);
  if (!hub) return { title: "Not found" };
  return {
    title: hub.title,
    description: hub.intro,
    alternates: { canonical: `/goa/${hub.slug}` },
    openGraph: {
      title: hub.title,
      description: hub.intro,
      images: hub.items[0] ? [{ url: hub.items[0].imageSrc, alt: hub.items[0].imageAlt }] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { hub: slug } = await params;
  const { hub, hubs } = await findHub(slug);
  if (!hub) notFound();

  const url = `${SITE_URL}/goa/${hub.slug}`;
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
                { "@type": "ListItem", position: 3, name: hub.title, item: url },
              ],
            },
            {
              "@type": "ItemList",
              name: hub.title,
              url,
              itemListElement: hub.items.map((item, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: item.title,
                url: `${SITE_URL}/experiences/${item.slug}`,
              })),
            },
          ],
        }}
      />
      <HubPage hub={hub} others={hubs.filter((h) => h.slug !== hub.slug)} />
    </>
  );
}
