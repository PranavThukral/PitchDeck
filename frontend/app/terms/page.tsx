import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { Metadata } from "next";
import {
  CheckSquare,
  UserCircle,
  ShieldOff,
  Copyright,
  AlertTriangle,
  XCircle,
  Scale,
  MessageSquare,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | The Pitch Deck",
  description:
    "Read our terms of service and user agreement for The Pitch Deck, a Canadian case competition platform.",
  keywords: "terms of service, user agreement, terms and conditions, canada",
  openGraph: {
    title: "Terms of Service | The Pitch Deck",
    description:
      "Read our terms of service and user agreement for The Pitch Deck case competition platform.",
    type: "website",
    url: "/terms",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | The Pitch Deck",
    description:
      "Read our terms of service and user agreement for The Pitch Deck case competition platform.",
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
      <Icon className="h-8 w-8 text-[#19613F] mr-4 flex-shrink-0" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
    </div>
    <div className="prose prose-lg max-w-none dark:prose-invert text-gray-600 dark:text-gray-300">
      {children}
    </div>
  </div>
);

export default function TermsPage() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Terms of Service", url: "/terms" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <Navigation />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold font-serif text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Last Updated: October 5, 2025
            </p>
          </div>

          {/* --- New Summary Section --- */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-8 rounded-2xl mb-16">
            <h2 className="text-2xl font-bold text-center text-blue-900 dark:text-blue-100 mb-4">The Short Version</h2>
            <p className="text-center text-lg text-blue-800 dark:text-blue-200">
              Welcome to The Pitch Deck! By using our platform, you agree to these rules. In short: be respectful, submit your own original work, and keep your account secure. We provide this platform to connect you with amazing opportunities, and these terms help ensure a fair and safe environment for everyone.
            </p>
          </div>
          
          <PolicySection icon={CheckSquare} title="1. Acceptance of Terms">
            <p>By creating an account or using our website (“Service”), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with these terms, you may not use the Service. These terms form a legally binding agreement between you and The Pitch Deck.</p>
          </PolicySection>
          
          <PolicySection icon={UserCircle} title="2. User Accounts">
            <p>You must provide accurate and complete information when creating your account. You are solely responsible for all activity that occurs under your account and for keeping your password confidential. You must be a high school student (or equivalent) to create a student account.</p>
          </PolicySection>

          <PolicySection icon={ShieldOff} title="3. User Conduct and Responsibilities">
            <p>You agree to use our Service responsibly. You will not submit plagiarized work, harass other users, share false information, or attempt to disrupt or gain unauthorized access to our platform. We reserve the right to disqualify participants or terminate accounts that violate these rules.</p>
          </PolicySection>

          <PolicySection icon={Copyright} title="4. Intellectual Property">
            <p>You retain ownership of the original work and content you submit to competitions. However, by submitting content, you grant The Pitch Deck and the respective competition organizers a non-exclusive, worldwide, royalty-free license to use, display, and distribute your submission for promotional, educational, and operational purposes related to the competition and our platform.</p>
          </PolicySection>

          <PolicySection icon={AlertTriangle} title="5. Disclaimers and Limitation of Liability">
            <p>The Service is provided "as is," without any warranties. We do our best to ensure the platform is reliable, but we are not responsible for any losses or damages that may result from your use of the site or participation in competitions hosted by third-party organizers.</p>
          </PolicySection>

          <PolicySection icon={XCircle} title="6. Termination">
            <p>We may terminate or suspend your account at our sole discretion, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.</p>
          </PolicySection>

          <PolicySection icon={Scale} title="7. Governing Law">
            <p>These Terms shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to its conflict of law provisions.</p>
          </PolicySection>

          <PolicySection icon={MessageSquare} title="8. Contact Us">
            <p>If you have any questions about these Terms of Service, please contact us at our official email address:</p>
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