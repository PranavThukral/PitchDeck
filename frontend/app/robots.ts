import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thepitchdeck.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/competitions',
          '/business-opportunities',
          '/medicine-opportunities',
          '/engineering-opportunities',
          '/apply',
          '/auth/general/signup',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/dashboard/',
          '/auth/login',
          '/api/',
          '/admin/',
          '/_next/',
          '/under-construction',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/competitions',
          '/business-opportunities',
          '/medicine-opportunities',
          '/engineering-opportunities',
          '/apply',
          '/auth/general/signup',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/dashboard/',
          '/auth/login',
          '/api/',
          '/admin/',
          '/_next/',
          '/under-construction',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
