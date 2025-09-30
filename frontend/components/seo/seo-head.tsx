import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  noIndex?: boolean;
  structuredData?: object;
}

export function SEOHead({
  title = 'The Pitch Deck - Case Competition Platform',
  description = 'The All-in-One Platform for Case Competitors',
  keywords,
  canonicalUrl,
  ogImage = '/og-image.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
  structuredData,
}: SEOHeadProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thepitchdeck.com';
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;
  const fullCanonicalUrl = canonicalUrl || baseUrl;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:site_name" content="The Pitch Deck" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:creator" content="@thepitchdeck" />
      <meta name="twitter:site" content="@thepitchdeck" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#19613F" />
      <meta name="color-scheme" content="light dark" />
      <meta name="author" content="The Pitch Deck Team" />
      <meta name="publisher" content="The Pitch Deck" />
      <meta name="format-detection" content="telephone=no, address=no, email=no" />

      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.png" />
      <link rel="shortcut icon" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/favicon.png" />

      {/* Web App Manifest */}
      <link rel="manifest" href="/manifest.json" />

      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2),
          }}
        />
      )}
    </Head>
  );
}

// Utility function to generate default structured data
export function generateDefaultStructuredData(pageType: 'website' | 'article' | 'organization' = 'website') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thepitchdeck.com';

  const baseData = {
    '@context': 'https://schema.org',
  };

  switch (pageType) {
    case 'organization':
      return {
        ...baseData,
        '@type': 'Organization',
        name: 'The Pitch Deck',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'The All-in-One Platform for Case Competitors',
        sameAs: [
          // Add social media URLs when available
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: 'English',
        },
      };

    case 'website':
      return {
        ...baseData,
        '@type': 'WebSite',
        name: 'The Pitch Deck',
        url: baseUrl,
        description: 'The All-in-One Platform for Case Competitors',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/competitions?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      };

    case 'article':
      return {
        ...baseData,
        '@type': 'Article',
        publisher: {
          '@type': 'Organization',
          name: 'The Pitch Deck',
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`,
          },
        },
      };

    default:
      return baseData;
  }
}
