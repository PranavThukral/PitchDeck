import React from 'react';

interface CompetitionSchemaProps {
  competition: {
    name: string;
    description: string;
    organizer: string;
    startDate: string;
    endDate: string;
    applicationDeadline: string;
    location?: string;
    isVirtual?: boolean;
    prizes?: string[];
    eligibility?: string;
    website?: string;
    image?: string;
  };
}

export function CompetitionSchemaMarkup({ competition }: CompetitionSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thepitchdeck.com';

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: competition.name,
    description: competition.description,
    startDate: competition.startDate,
    endDate: competition.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: competition.isVirtual
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: competition.isVirtual
      ? {
          '@type': 'VirtualLocation',
          url: competition.website || baseUrl,
        }
      : competition.location
      ? {
          '@type': 'Place',
          name: competition.location,
          address: competition.location,
        }
      : undefined,
    organizer: {
      '@type': 'Organization',
      name: competition.organizer,
      url: competition.website,
    },
    offers: competition.prizes && competition.prizes.length > 0 ? {
      '@type': 'Offer',
      description: `Prizes include: ${competition.prizes.join(', ')}`,
      availability: 'https://schema.org/InStock',
      validThrough: competition.applicationDeadline,
    } : undefined,
    audience: {
      '@type': 'Audience',
      audienceType: 'Students',
      name: competition.eligibility || 'High school students',
    },
    image: competition.image ? `${baseUrl}${competition.image}` : `${baseUrl}/og-image.png`,
    url: competition.website || baseUrl,
    applicationDeadline: competition.applicationDeadline,
    additionalType: 'https://schema.org/Competition',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2),
      }}
    />
  );
}

interface OpportunitySchemaProps {
  opportunity: {
    title: string;
    description: string;
    organization: string;
    type: 'internship' | 'program' | 'fellowship' | 'course';
    startDate?: string;
    endDate?: string;
    applicationDeadline?: string;
    location?: string;
    isRemote?: boolean;
    salary?: string;
    website?: string;
    image?: string;
    requirements?: string[];
  };
}

export function OpportunitySchemaMarkup({ opportunity }: OpportunitySchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thepitchdeck.com';

  const getSchemaType = (type: string) => {
    switch (type) {
      case 'internship':
        return 'JobPosting';
      case 'program':
      case 'course':
        return 'Course';
      case 'fellowship':
        return 'EducationalOccupationalProgram';
      default:
        return 'JobPosting';
    }
  };

  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': getSchemaType(opportunity.type),
    name: opportunity.title,
    description: opportunity.description,
    provider: {
      '@type': 'Organization',
      name: opportunity.organization,
      url: opportunity.website,
    },
    image: opportunity.image ? `${baseUrl}${opportunity.image}` : `${baseUrl}/og-image.png`,
    url: opportunity.website || baseUrl,
  };

  let schemaData: any = baseSchema;

  if (opportunity.type === 'internship' || getSchemaType(opportunity.type) === 'JobPosting') {
    schemaData = {
      ...baseSchema,
      '@type': 'JobPosting',
      hiringOrganization: {
        '@type': 'Organization',
        name: opportunity.organization,
        url: opportunity.website,
      },
      jobLocation: opportunity.isRemote
        ? {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Remote',
              addressCountry: 'US',
            },
          }
        : opportunity.location
        ? {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: opportunity.location,
            },
          }
        : undefined,
      datePosted: new Date().toISOString().split('T')[0],
      validThrough: opportunity.applicationDeadline,
      employmentType: 'INTERN',
      baseSalary: opportunity.salary ? {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: {
          '@type': 'QuantitativeValue',
          value: opportunity.salary,
        },
      } : undefined,
      qualifications: opportunity.requirements?.join(', '),
    };
  } else if (opportunity.type === 'program' || opportunity.type === 'course') {
    schemaData = {
      ...baseSchema,
      '@type': 'Course',
      courseMode: opportunity.isRemote ? 'online' : 'onsite',
      startDate: opportunity.startDate,
      endDate: opportunity.endDate,
      coursePrerequisites: opportunity.requirements?.join(', '),
      location: opportunity.isRemote
        ? {
            '@type': 'VirtualLocation',
            url: opportunity.website || baseUrl,
          }
        : opportunity.location
        ? {
            '@type': 'Place',
            name: opportunity.location,
            address: opportunity.location,
          }
        : undefined,
    };
  } else if (opportunity.type === 'fellowship') {
    schemaData = {
      ...baseSchema,
      '@type': 'EducationalOccupationalProgram',
      startDate: opportunity.startDate,
      endDate: opportunity.endDate,
      applicationDeadline: opportunity.applicationDeadline,
      programType: 'Fellowship',
      educationalCredentialAwarded: 'Fellowship Certificate',
      occupationalCategory: 'Business and Entrepreneurship',
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2),
      }}
    />
  );
}

interface ArticleSchemaProps {
  article: {
    headline: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    url?: string;
    category?: string;
    keywords?: string[];
  };
}

export function ArticleSchemaMarkup({ article }: ArticleSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thepitchdeck.com';

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Pitch Deck',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.image ? `${baseUrl}${article.image}` : `${baseUrl}/og-image.png`,
    url: article.url || baseUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url || baseUrl,
    },
    articleSection: article.category || 'Business Competition',
    keywords: article.keywords?.join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2),
      }}
    />
  );
}

interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQSchemaMarkup({ faqs }: FAQSchemaProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2),
      }}
    />
  );
}

interface LocalBusinessSchemaProps {
  business: {
    name: string;
    description: string;
    address?: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    phone?: string;
    email?: string;
    website?: string;
    hours?: string[];
    priceRange?: string;
  };
}

export function LocalBusinessSchemaMarkup({ business }: LocalBusinessSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thepitchdeck.com';

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    url: business.website || baseUrl,
    telephone: business.phone,
    email: business.email,
    priceRange: business.priceRange,
    address: business.address ? {
      '@type': 'PostalAddress',
      streetAddress: business.address.streetAddress,
      addressLocality: business.address.addressLocality,
      addressRegion: business.address.addressRegion,
      postalCode: business.address.postalCode,
      addressCountry: business.address.addressCountry,
    } : undefined,
    openingHours: business.hours,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/og-image.png`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2),
      }}
    />
  );
}

interface ReviewSchemaProps {
  review: {
    itemName: string;
    reviewBody: string;
    reviewRating: number;
    author: string;
    datePublished: string;
  };
}

export function ReviewSchemaMarkup({ review }: ReviewSchemaProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Thing',
      name: review.itemName,
    },
    reviewBody: review.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.reviewRating,
      bestRating: 5,
    },
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.datePublished,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2),
      }}
    />
  );
}

// Utility component for combining multiple schema markups
interface MultipleSchemaProps {
  schemas: Array<{
    type: 'competition' | 'opportunity' | 'article' | 'faq' | 'business' | 'review';
    data: any;
  }>;
}

export function MultipleSchemaMarkup({ schemas }: MultipleSchemaProps) {
  return (
    <>
      {schemas.map((schema, index) => {
        switch (schema.type) {
          case 'competition':
            return <CompetitionSchemaMarkup key={index} competition={schema.data} />;
          case 'opportunity':
            return <OpportunitySchemaMarkup key={index} opportunity={schema.data} />;
          case 'article':
            return <ArticleSchemaMarkup key={index} article={schema.data} />;
          case 'faq':
            return <FAQSchemaMarkup key={index} faqs={schema.data} />;
          case 'business':
            return <LocalBusinessSchemaMarkup key={index} business={schema.data} />;
          case 'review':
            return <ReviewSchemaMarkup key={index} review={schema.data} />;
          default:
            return null;
        }
      })}
    </>
  );
}
