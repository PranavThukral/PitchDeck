import React from 'react';

interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbStructuredData({ items }: BreadcrumbsProps) {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <StructuredData data={breadcrumbData} />;
}

export function OrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thepitchdeck.com';

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Pitch Deck',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'The All-in-One Platform for Case Competitors',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    sameAs: [
      // Add social media URLs when available
    ],
  };

  return <StructuredData data={organizationData} />;
}

export function WebSiteStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thepitchdeck.com';

  const websiteData = {
    '@context': 'https://schema.org',
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

  return <StructuredData data={websiteData} />;
}
