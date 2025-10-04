import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

const SEO = ({
  title = 'SHARMORIA - Mobile Massage & Spa Services in Johannesburg & Pretoria',
  description = 'Experience luxurious mobile massage, waxing, and facial services in the comfort of your home. Professional therapists, premium products, and a calming experience delivered to your door in Johannesburg and Pretoria.',
  keywords = 'mobile massage, massage Johannesburg, massage Pretoria, mobile spa, home massage, waxing services, facial treatment, deep tissue massage, hot stone massage, couples massage, Brazilian wax, mobile therapist South Africa',
  ogImage = '/logo.png',
  ogType = 'website',
  canonical,
}: SEOProps) => {
  const siteUrl = window.location.origin;
  const currentUrl = window.location.href;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="SHARMORIA" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {canonical && <link rel="canonical" href={canonical} />}

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "SHARMORIA",
          "description": description,
          "image": `${siteUrl}${ogImage}`,
          "telephone": "+27831234567",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Johannesburg",
            "addressRegion": "Gauteng",
            "addressCountry": "ZA"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "-26.2041",
            "longitude": "28.0473"
          },
          "url": siteUrl,
          "priceRange": "R250-R2300",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "08:00",
              "closes": "17:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Saturday",
              "opens": "08:00",
              "closes": "15:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Sunday",
              "opens": "08:00",
              "closes": "13:00"
            }
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5",
            "reviewCount": "50"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
