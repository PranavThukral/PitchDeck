import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { Metadata } from "next";
import {
  ShieldCheck,
  User,
  Share2,
  Lock,
  MessageSquare,
  ClipboardList,
  Globe,
  Users,
  } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | The Pitch Deck",
  description:
    "Learn how we protect your privacy and handle your personal information on The Pitch Deck platform, in accordance with Canadian privacy laws.",
  keywords: "privacy policy, data protection, PIPEDA, Canada privacy",
  openGraph: {
    title: "Privacy Policy | The Pitch Deck",
    description:
      "Learn how we protect your privacy and handle your personal information on The Pitch Deck platform.",
    type: "website",
    url: "/privacy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | The Pitch Deck",
    description:
      "Learn how we protect your privacy and handle your personal information on The Pitch Deck platform.",
  },
};

// A reusable component for each styled section of the policy
const PolicySection = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white dark:bg-gray-800/50 p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
    <div className="flex items-center mb-4">
      <Icon className="h-8 w-8 text-[#19613F] mr-4" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
    </div>
    <div className="prose prose-lg max-w-none dark:prose-invert text-gray-600 dark:text-gray-300">
      {children}
    </div>
  </div>
);

export default function PrivacyPage() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Privacy Policy", url: "/privacy" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <Navigation />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold font-serif text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Last Updated: October 5, 2025
            </p>
          </div>
          
          {/* Summary */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-8 rounded-2xl mb-16">
            <h2 className="text-2xl font-bold text-center text-green-900 dark:text-green-100 mb-4">Our Privacy Promise</h2>
            <p className="text-center text-lg text-green-800 dark:text-green-200">
              Your privacy is fundamental to how we operate. We only collect the information we need to run our competitions and connect you with opportunities. We are a Canadian platform and handle your data in accordance with Canadian privacy laws (PIPEDA). We will never sell your data. That's our promise.
            </p>
          </div>

          {/* Policy sections */}
          <PolicySection icon={User} title="1. Information We Collect">
            <p>To provide our services, we collect information you give us directly, such as your name, email, and school when you create an account or apply to a competition. We also automatically collect technical data like your IP address and browser type to help our site run smoothly.</p>
          </PolicySection>

          <PolicySection icon={ClipboardList} title="2. How We Use Your Information">
            <p>We use your information to operate The Pitch Deck. This includes processing your applications, communicating with you, sending our newsletter if you opt-in, and improving the platform. We do not use your information for any other purpose without your explicit consent.</p>
          </PolicySection>
          
          <PolicySection icon={Share2} title="3. How We Share Your Information">
            <p>When you apply to a competition, we share the necessary application details with the verified competition organizers. We may also use third-party services for tasks like website hosting and email delivery. We will never sell your personal information to third parties.</p>
          </PolicySection>
          
          <PolicySection icon={Lock} title="4. Data Security & Retention">
            <p>We use appropriate security measures to protect your data from unauthorized access. We retain your information only for as long as needed to provide our services or as required by law. While no system is 100% secure, we are committed to protecting your information.</p>
          </PolicySection>
          
          <PolicySection icon={ShieldCheck} title="5. Your Rights Under Canadian Law (PIPEDA)">
            <p>As a Canadian platform, we adhere to the Personal Information Protection and Electronic Documents Act (PIPEDA). You have the right to access the personal information we hold about you and to request corrections. You can also withdraw consent for the use of your information at any time, subject to legal or contractual restrictions.</p>
          </PolicySection>

          <PolicySection icon={Users} title="6. Children's Privacy">
             <p>Our service is intended for high school students, who may be considered minors. We require users to be at least 13 years of age. By using our platform, you confirm that you have the necessary consent from a parent or guardian if you are under the age of majority in your province or territory.</p>
          </PolicySection>
          
          <PolicySection icon={Globe} title="7. Third-Party Websites">
             <p>Our site may link to external websites, such as those of competition organizers. We are not responsible for their privacy practices and encourage you to read their policies.</p>
          </PolicySection>

          <PolicySection icon={MessageSquare} title="8. Contact Us">
            <p>If you have any questions about this policy or want to exercise your privacy rights, please contact us. We do not have a physical address for correspondence.</p>
            <ul>
                <li><strong>Primary Contact:</strong> <a href="mailto:info@thepitchdeck.ca" className="text-[#19613F] hover:underline dark:text-[#3dd67f]">info@thepitchdeck.ca</a></li>
            </ul>
          </PolicySection>
        </div>
      </div>

      <Footer />
    </div>
  );
}