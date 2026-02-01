import type { Metadata } from "next";

type SimpleMetadataOptions = {
  title: string;
  description: string;
  keywords?: string | string[];
  url: string;
  robots?: string;
};

export const buildPageMetadata = ({
  title,
  description,
  keywords,
  url,
  robots,
}: SimpleMetadataOptions): Metadata => ({
  title,
  description,
  keywords,
  robots,
  openGraph: {
    title,
    description,
    type: "website",
    url,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
});
