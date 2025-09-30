/**
 * Newsletter utility functions and types for MailerLite integration
 */

export interface NewsletterSubscriptionRequest {
  email: string;
  name?: string;
}

export interface NewsletterSubscriptionResponse {
  success: boolean;
  message: string;
  subscriber?: {
    email: string;
    status: string;
    name?: string;
  };
  error?: string;
}

export interface SubscriptionOptions {
  validateEmail?: boolean;
  showToast?: boolean;
}

/**
 * Validates email format using RFC 2821 compliant regex
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Subscribes a user to the newsletter
 */
export async function subscribeToNewsletter(
  email: string,
  name?: string,
  options: SubscriptionOptions = {},
): Promise<NewsletterSubscriptionResponse> {
  const { validateEmail: shouldValidate = true } = options;

  // Validate email if requested
  if (shouldValidate && !validateEmail(email)) {
    return {
      success: false,
      message: "Please enter a valid email address",
      error: "Invalid email format",
    };
  }

  try {
    const requestBody: NewsletterSubscriptionRequest = {
      email: email.trim(),
    };

    if (name && name.trim()) {
      requestBody.name = name.trim();
    }

    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || "Successfully subscribed to newsletter!",
        subscriber: data.subscriber,
      };
    } else {
      return {
        success: false,
        message: data.error || "Failed to subscribe to newsletter",
        error: data.error,
      };
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
      error: "Network error",
    };
  }
}

/**
 * Newsletter subscription status types
 */
export type SubscriptionStatus =
  | "active"
  | "unsubscribed"
  | "unconfirmed"
  | "bounced"
  | "junk";

/**
 * Common newsletter groups/categories
 */
export const NewsletterGroups = {
  COMPETITIONS: "competitions",
  BUSINESS_OPPORTUNITIES: "business-opportunities",
  GENERAL_UPDATES: "general-updates",
  WEEKLY_DIGEST: "weekly-digest",
} as const;

export type NewsletterGroup =
  (typeof NewsletterGroups)[keyof typeof NewsletterGroups];

/**
 * Error types that can occur during subscription
 */
export const NewsletterErrors = {
  INVALID_EMAIL: "invalid_email",
  NETWORK_ERROR: "network_error",
  SERVER_ERROR: "server_error",
  API_KEY_MISSING: "api_key_missing",
  RATE_LIMITED: "rate_limited",
  ALREADY_SUBSCRIBED: "already_subscribed",
} as const;

export type NewsletterError =
  (typeof NewsletterErrors)[keyof typeof NewsletterErrors];

/**
 * Maps error types to user-friendly messages
 */
export const getErrorMessage = (error: string): string => {
  switch (error) {
    case NewsletterErrors.INVALID_EMAIL:
      return "Please enter a valid email address";
    case NewsletterErrors.NETWORK_ERROR:
      return "Network error. Please check your connection and try again.";
    case NewsletterErrors.SERVER_ERROR:
      return "Server error. Please try again later.";
    case NewsletterErrors.API_KEY_MISSING:
      return "Newsletter service is not configured. Please contact support.";
    case NewsletterErrors.RATE_LIMITED:
      return "Too many requests. Please wait a moment and try again.";
    case NewsletterErrors.ALREADY_SUBSCRIBED:
      return "You're already subscribed to our newsletter!";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

/**
 * Configuration for newsletter integration
 */
export const NewsletterConfig = {
  // MailerLite API endpoint
  API_BASE_URL: "https://connect.mailerlite.com/api",

  // Default subscription status
  DEFAULT_STATUS: "active" as SubscriptionStatus,

  // Rate limiting (requests per minute)
  RATE_LIMIT: 120,

  // Validation settings
  VALIDATION: {
    MIN_EMAIL_LENGTH: 5,
    MAX_EMAIL_LENGTH: 254,
    MIN_NAME_LENGTH: 1,
    MAX_NAME_LENGTH: 100,
  },

  // Toast notification settings
  TOAST_DURATION: 5000,
} as const;

/**
 * Utility function to sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Checks if the newsletter feature is enabled
 */
export function isNewsletterEnabled(): boolean {
  return (
    (typeof window !== "undefined" && process.env.NODE_ENV === "production") ||
    Boolean(process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED)
  );
}

/**
 * Google Analytics gtag function interface
 */
interface GtagFunction {
  (
    command: "event",
    eventName: string,
    parameters?: Record<string, unknown>,
  ): void;
}

/**
 * Window interface with optional gtag function
 */
declare global {
  interface Window {
    gtag?: GtagFunction;
  }
}

/**
 * Analytics helper for tracking newsletter subscriptions
 */
export function trackNewsletterSubscription(
  email: string,
  success: boolean,
): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "newsletter_subscription", {
      event_category: "engagement",
      event_label: success ? "success" : "failure",
      custom_parameter_email_domain: email.split("@")[1] || "unknown",
    });
  }
}

/**
 * Types for MailerLite webhook events (for future use)
 */
export interface WebhookEvent {
  type: "subscriber.created" | "subscriber.updated" | "subscriber.unsubscribed";
  fired_at: string;
  data: {
    subscriber: {
      id: string;
      email: string;
      status: SubscriptionStatus;
      source: string;
      sent: number;
      opens_count: number;
      clicks_count: number;
      open_rate: number;
      click_rate: number;
      ip_address?: string;
      subscribed_at: string;
      unsubscribed_at?: string;
      created_at: string;
      updated_at: string;
      fields: Record<string, string>;
      groups: Array<{ id: string; name: string }>;
      opted_in_at?: string;
      optin_ip?: string;
    };
  };
}
