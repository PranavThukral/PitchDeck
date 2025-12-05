import type { Metadata } from "next";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
  canonical?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://thepitchdeck.com";

export const defaultSEO: SEOConfig = {
  title: "The Pitch Deck - Case Competition Platform",
  description:
    "Discover and apply to case competitions, business programs, and opportunities. Track deadlines, collaborate with your team, and level up your skills in one place.",
  keywords: [
    "case competition",
    "business competition",
    "entrepreneurship",
    "pitch deck",
    "business opportunities",
    "startup competition",
    "student competition",
    "business case study",
    "consulting competition",
    "innovation challenge",
  ],
  ogImage: "/og-image.png",
};

export const seoPages: Record<string, SEOConfig> = {
  home: {
    title: "The Pitch Deck - Case Competition Platform",
    description:
      "Join the case competition platform built for students. Discover curated competitions and opportunities, track deadlines, and apply with one profile and team workspace.",
    keywords: [
      "case competition platform",
      "business competition directory",
      "entrepreneurship community",
      "student competitions",
      "business case studies",
      "pitch deck resources",
      "startup competitions",
      "consulting case competitions",
    ],
  },
  competitions: {
    title: "Case Competitions - Find Your Next Challenge | The Pitch Deck",
    description:
      "Browse hundreds of case competitions from top universities and organizations worldwide. Filter by grade level, industry, and application deadlines.",
    keywords: [
      "case competitions",
      "business competitions",
      "university competitions",
      "consulting competitions",
      "MBA competitions",
      "undergraduate competitions",
      "competition directory",
      "business case challenges",
    ],
  },
  businessOpportunities: {
    title:
      "Business Opportunities - Internships, Programs & More | The Pitch Deck",
    description:
      "Discover summer programs, internships, fellowships, and entrepreneurial opportunities. Accelerate your career with curated business opportunities.",
    keywords: [
      "business internships",
      "summer programs",
      "entrepreneurship fellowships",
      "business opportunities",
      "startup internships",
      "consulting internships",
      "MBA programs",
      "business development programs",
    ],
  },
  apply: {
    title: "Apply to Competitions | The Pitch Deck",
    description:
      "Submit your application and pitch deck to join exciting case competitions. Get discovered by top organizations and showcase your business acumen.",
    keywords: [
      "apply competition",
      "pitch deck submission",
      "competition application",
      "business case application",
      "startup pitch",
      "competition entry",
    ],
  },
  login: {
    title: "Login - Access Your Dashboard | The Pitch Deck",
    description:
      "Sign in to your account to manage your competition applications, track opportunities, and connect with the case competition community.",
    keywords: ["login", "sign in", "account access", "dashboard"],
    noIndex: true,
  },
  signup: {
    title: "Sign Up - Join The Pitch Deck Community",
    description:
      "Create your account to access exclusive case competitions, business opportunities, and connect with fellow entrepreneurs and competitors.",
    keywords: ["sign up", "create account", "join community", "register"],
  },
  dashboard: {
    title: "Dashboard | The Pitch Deck",
    description:
      "Manage your applications, track competition deadlines, and access your personalized opportunities dashboard.",
    keywords: ["dashboard", "my applications", "competition tracker"],
    noIndex: true,
  },
  privacy: {
    title: "Privacy Policy | The Pitch Deck",
    description:
      "Learn how we protect your privacy and handle your personal information on The Pitch Deck platform.",
    keywords: ["privacy policy", "data protection", "privacy"],
  },
  terms: {
    title: "Terms of Service | The Pitch Deck",
    description:
      "Read our terms of service and user agreement for The Pitch Deck case competition platform.",
    keywords: ["terms of service", "user agreement", "terms and conditions"],
  },
};

export function generateMetadata(
  pageKey: string,
  customConfig?: Partial<SEOConfig>,
): Metadata {
  const seoConfig = { ...defaultSEO, ...seoPages[pageKey], ...customConfig };

  const metadata: Metadata = {
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords?.join(", "),
    robots: seoConfig.noIndex ? "noindex, nofollow" : "index, follow",
    authors: [{ name: "The Pitch Deck Team" }],
    creator: "The Pitch Deck",
    publisher: "The Pitch Deck",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: seoConfig.canonical || baseUrl,
      siteName: "The Pitch Deck",
      title: seoConfig.title,
      description: seoConfig.description,
      images: [
        {
          url: seoConfig.ogImage || "/og-image.png",
          width: 1200,
          height: 630,
          alt: seoConfig.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoConfig.title,
      description: seoConfig.description,
      images: [seoConfig.ogImage || "/og-image.png"],
      creator: "@thepitchdeck",
    },
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
      apple: "/favicon.png",
    },
    manifest: "/manifest.json",
    other: {
      "theme-color": "#19613F",
      "color-scheme": "light dark",
    },
  };

  if (seoConfig.canonical) {
    metadata.alternates = {
      canonical: seoConfig.canonical,
    };
  }

  return metadata;
}

export function generateStructuredData(
  type: "Organization" | "WebSite" | "BreadcrumbList",
  data?: any,
) {
  const baseStructuredData = {
    "@context": "https://schema.org",
  };

  switch (type) {
    case "Organization":
      return {
        ...baseStructuredData,
        "@type": "Organization",
        name: "The Pitch Deck",
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description:
          "Discover and apply to case competitions, business programs, and opportunities in one place.",
        sameAs: [
          // Add social media URLs here when available
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "English",
        },
      };

    case "WebSite":
      return {
        ...baseStructuredData,
        "@type": "WebSite",
        name: "The Pitch Deck",
        url: baseUrl,
        description:
          "Discover and apply to case competitions, business programs, and opportunities in one place.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/competitions?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      };

    case "BreadcrumbList":
      return {
        ...baseStructuredData,
        "@type": "BreadcrumbList",
        itemListElement: data || [],
      };

    default:
      return baseStructuredData;
  }
}
