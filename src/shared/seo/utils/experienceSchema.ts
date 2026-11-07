import type { Experience } from "@/types/experience";
import { SITE_URL } from "@/shared/seo/utils/site";

/** schema.org markup for one listing. Venues are a LocalBusiness, trips a TouristTrip. */
export function experienceSchema(e: Experience) {
  const url = `${SITE_URL}/experiences/${e.slug}`;
  const venue = e.content?.format === "venue";
  const rated = e.reviews && e.reviews.count > 0;

  return {
    "@context": "https://schema.org",
    "@type": venue ? "LocalBusiness" : "TouristTrip",
    "@id": `${url}#listing`,
    name: e.title,
    url,
    description: e.verdict || e.about,
    image: e.photos.map((p) => p.src),
    inLanguage: e.host.languages.length ? e.host.languages : undefined,
    ...(venue
      ? {
          address: e.place.neighborhood || e.place.name,
          geo: { "@type": "GeoCoordinates", latitude: e.place.lat, longitude: e.place.lng },
        }
      : {
          touristType: e.groupSize,
          itinerary: {
            "@type": "Place",
            name: e.place.name,
            geo: { "@type": "GeoCoordinates", latitude: e.place.lat, longitude: e.place.lng },
          },
        }),
    provider: { "@type": "Organization", name: e.host.businessName },
    ...(!e.price.askForPrice && e.price.fromAmount > 0
      ? {
          offers: {
            "@type": "Offer",
            price: e.price.fromAmount,
            priceCurrency: "INR",
            url,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    ...(rated
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: e.reviews!.average,
            reviewCount: e.reviews!.count,
            bestRating: 5,
          },
        }
      : {}),
    // Mirrors the visible FAQ on the page. Only add what a visitor can see.
    ...(e.content?.faqs?.length
      ? {
          subjectOf: {
            "@type": "FAQPage",
            mainEntity: e.content.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        }
      : {}),
  };
}
