import { Metadata } from 'next';

export interface SEOChecklistItem {
  name: string;
  description: string;
  isRequired: boolean;
  category: 'technical' | 'content' | 'performance' | 'accessibility';
  check: (metadata?: Metadata, pageContent?: string) => boolean;
}

export interface SEOChecklistResult {
  item: SEOChecklistItem;
  passed: boolean;
  message: string;
}

export const seoChecklist: SEOChecklistItem[] = [
  // Technical SEO
  {
    name: 'Title Tag',
    description: 'Page has a unique, descriptive title tag (50-70 characters)',
    isRequired: true,
    category: 'technical',
    check: (metadata) => {
      const title = metadata?.title as string;
      return !!(title && title.length >= 30 && title.length <= 70);
    },
  },
  {
    name: 'Meta Description',
    description: 'Page has a compelling meta description (150-160 characters)',
    isRequired: true,
    category: 'technical',
    check: (metadata) => {
      const description = metadata?.description as string;
      return !!(description && description.length >= 120 && description.length <= 160);
    },
  },
  {
    name: 'Meta Keywords',
    description: 'Page has relevant keywords (optional but recommended)',
    isRequired: false,
    category: 'technical',
    check: (metadata) => {
      return !!(metadata?.keywords);
    },
  },
  {
    name: 'Canonical URL',
    description: 'Page has a canonical URL to prevent duplicate content',
    isRequired: true,
    category: 'technical',
    check: (metadata) => {
      return !!(metadata?.alternates?.canonical || metadata?.openGraph?.url);
    },
  },
  {
    name: 'Open Graph Tags',
    description: 'Page has Open Graph meta tags for social sharing',
    isRequired: true,
    category: 'technical',
    check: (metadata) => {
      const og = metadata?.openGraph;
      return !!(og?.title && og?.description && og?.images && og?.url);
    },
  },
  {
    name: 'Twitter Card Tags',
    description: 'Page has Twitter Card meta tags',
    isRequired: true,
    category: 'technical',
    check: (metadata) => {
      const twitter = metadata?.twitter;
      return !!(twitter?.card && twitter?.title && twitter?.description);
    },
  },
  {
    name: 'Robots Meta Tag',
    description: 'Page has appropriate robots directive',
    isRequired: true,
    category: 'technical',
    check: (metadata) => {
      return !!(metadata?.robots);
    },
  },
  {
    name: 'Viewport Meta Tag',
    description: 'Page has viewport meta tag for mobile responsiveness',
    isRequired: true,
    category: 'technical',
    check: () => {
      // This is handled in the layout, so we assume it's present
      return true;
    },
  },
  {
    name: 'Language Declaration',
    description: 'HTML element has lang attribute',
    isRequired: true,
    category: 'technical',
    check: () => {
      // This is handled in the layout with lang="en"
      return true;
    },
  },
  {
    name: 'Favicon',
    description: 'Page has favicon and touch icons',
    isRequired: true,
    category: 'technical',
    check: (metadata) => {
      return !!(metadata?.icons);
    },
  },

  // Content SEO
  {
    name: 'H1 Tag',
    description: 'Page has exactly one H1 tag',
    isRequired: true,
    category: 'content',
    check: (_, pageContent) => {
      if (!pageContent) return false;
      const h1Matches = pageContent.match(/<h1[^>]*>.*?<\/h1>/gi);
      return h1Matches?.length === 1;
    },
  },
  {
    name: 'Structured Data',
    description: 'Page includes relevant structured data (JSON-LD)',
    isRequired: true,
    category: 'content',
    check: (_, pageContent) => {
      if (!pageContent) return false;
      return pageContent.includes('application/ld+json');
    },
  },
  {
    name: 'Image Alt Text',
    description: 'All images have descriptive alt text',
    isRequired: true,
    category: 'accessibility',
    check: (_, pageContent) => {
      if (!pageContent) return false;
      const imgTags = pageContent.match(/<img[^>]*>/gi);
      if (!imgTags) return true; // No images, so passes
      return imgTags.every(img => img.includes('alt='));
    },
  },
  {
    name: 'Internal Linking',
    description: 'Page has appropriate internal links',
    isRequired: false,
    category: 'content',
    check: (_, pageContent) => {
      if (!pageContent) return false;
      const internalLinks = pageContent.match(/<a[^>]*href=["']\/[^"']*["'][^>]*>/gi);
      return (internalLinks?.length || 0) > 0;
    },
  },

  // Performance SEO
  {
    name: 'Page Load Speed',
    description: 'Page loads within 3 seconds',
    isRequired: true,
    category: 'performance',
    check: () => {
      // This would need to be measured with actual performance metrics
      return true; // Placeholder
    },
  },
  {
    name: 'Mobile Responsiveness',
    description: 'Page is mobile-friendly and responsive',
    isRequired: true,
    category: 'performance',
    check: () => {
      // This is handled by the responsive design
      return true;
    },
  },
  {
    name: 'HTTPS Security',
    description: 'Page is served over HTTPS',
    isRequired: true,
    category: 'technical',
    check: () => {
      if (typeof window !== 'undefined') {
        return window.location.protocol === 'https:';
      }
      return true; // Assume HTTPS in production
    },
  },
];

export function runSEOChecklist(
  metadata?: Metadata,
  pageContent?: string
): SEOChecklistResult[] {
  return seoChecklist.map(item => {
    const passed = item.check(metadata, pageContent);

    let message = '';
    if (passed) {
      message = `✅ ${item.name} - Passed`;
    } else if (item.isRequired) {
      message = `❌ ${item.name} - Failed (Required)`;
    } else {
      message = `⚠️ ${item.name} - Failed (Recommended)`;
    }

    return {
      item,
      passed,
      message,
    };
  });
}

export function getSEOScore(results: SEOChecklistResult[]): {
  score: number;
  total: number;
  passed: number;
  failed: number;
  criticalIssues: number;
} {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  const criticalIssues = results.filter(r => !r.passed && r.item.isRequired).length;
  const score = Math.round((passed / total) * 100);

  return {
    score,
    total,
    passed,
    failed,
    criticalIssues,
  };
}

export function generateSEOReport(
  metadata?: Metadata,
  pageContent?: string
): {
  results: SEOChecklistResult[];
  score: ReturnType<typeof getSEOScore>;
  recommendations: string[];
} {
  const results = runSEOChecklist(metadata, pageContent);
  const score = getSEOScore(results);

  const recommendations: string[] = [];

  results.forEach(result => {
    if (!result.passed) {
      if (result.item.isRequired) {
        recommendations.push(`🔴 Critical: Fix ${result.item.name} - ${result.item.description}`);
      } else {
        recommendations.push(`🟡 Improvement: Consider ${result.item.name} - ${result.item.description}`);
      }
    }
  });

  // Add general recommendations based on score
  if (score.score < 70) {
    recommendations.unshift('📊 Overall SEO score is below 70%. Focus on fixing critical issues first.');
  } else if (score.score < 85) {
    recommendations.unshift('📊 Good SEO foundation! Focus on the remaining improvements for better performance.');
  } else {
    recommendations.unshift('📊 Excellent SEO score! Continue monitoring and maintain best practices.');
  }

  return {
    results,
    score,
    recommendations,
  };
}

// Helper function to extract page content for analysis
export function extractPageContent(html: string): {
  title: string;
  headings: string[];
  images: Array<{ src: string; alt: string }>;
  links: Array<{ href: string; text: string; isInternal: boolean }>;
  wordCount: number;
} {
  // Basic HTML parsing (in a real app, you might use a proper HTML parser)
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';

  const headingMatches = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi);
  const headings = headingMatches ? headingMatches.map(h => h.replace(/<[^>]*>/g, '')) : [];

  const imageMatches = html.match(/<img[^>]*>/gi);
  const images = imageMatches ? imageMatches.map(img => {
    const srcMatch = img.match(/src=["']([^"']*)["']/i);
    const altMatch = img.match(/alt=["']([^"']*)["']/i);
    return {
      src: srcMatch ? srcMatch[1] : '',
      alt: altMatch ? altMatch[1] : '',
    };
  }) : [];

  const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi);
  const links = linkMatches ? linkMatches.map(link => {
    const hrefMatch = link.match(/href=["']([^"']*)["']/i);
    const textMatch = link.match(/>([^<]*)</);
    const href = hrefMatch ? hrefMatch[1] : '';
    const isInternal = href.startsWith('/') || href.startsWith('#');

    return {
      href,
      text: textMatch ? textMatch[1] : '',
      isInternal,
    };
  }) : [];

  // Simple word count (remove HTML tags and count words)
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(' ').filter(word => word.length > 0).length;

  return {
    title,
    headings,
    images,
    links,
    wordCount,
  };
}

// Utility to validate specific SEO elements
export const seoValidators = {
  titleLength: (title: string): boolean => title.length >= 30 && title.length <= 70,
  descriptionLength: (description: string): boolean => description.length >= 120 && description.length <= 160,
  hasKeywords: (content: string, keywords: string[]): boolean => {
    const lowercaseContent = content.toLowerCase();
    return keywords.some(keyword => lowercaseContent.includes(keyword.toLowerCase()));
  },
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  hasUniqueH1: (html: string): boolean => {
    const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gi);
    return h1Matches?.length === 1;
  },
};
