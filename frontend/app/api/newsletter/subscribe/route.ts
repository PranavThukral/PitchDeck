import { NextRequest, NextResponse } from "next/server";

interface SubscribeRequestBody {
  email: string;
  name?: string;
}

interface MailerLiteSubscriber {
  email: string;
  fields?: {
    name?: string;
  };
  groups?: string[];
  status?: string;
}

interface MailerLiteResponse {
  data: {
    id: string;
    email: string;
    status: string;
    source: string;
    fields: {
      name?: string;
      last_name?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  console.log("Newsletter API endpoint called");
  try {
    const body: SubscribeRequestBody = await request.json();
    console.log("Request body:", body);
    const { email, name } = body;

    // Validate email
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check for MailerLite API key
    const apiKey = process.env.MAILERLITE_API_KEY;
    console.log("API key exists:", !!apiKey);
    if (!apiKey) {
      console.error("MailerLite API key not found");
      return NextResponse.json(
        { error: "Newsletter service not configured" },
        { status: 500 },
      );
    }

    // Prepare subscriber data
    const subscriberData: MailerLiteSubscriber = {
      email,
      status: "active",
    };

    // Add name if provided
    if (name) {
      subscriberData.fields = {
        name: name.trim(),
      };
    }

    // Client IP tracking could be added here if needed for analytics

    console.log("Sending data to MailerLite:", subscriberData);
    // Make request to MailerLite API
    const response = await fetch(
      "https://connect.mailerlite.com/api/subscribers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        body: JSON.stringify(subscriberData),
      },
    );

    console.log("MailerLite response status:", response.status);
    const responseData = await response.json();
    console.log("MailerLite response data:", responseData);

    // Handle MailerLite response
    if (response.ok) {
      // Success - either 200 (updated) or 201 (created)
      const subscriber = responseData as MailerLiteResponse;

      return NextResponse.json({
        success: true,
        message:
          response.status === 201
            ? "Successfully subscribed to newsletter!"
            : "Subscription updated successfully!",
        subscriber: {
          email: subscriber.data.email,
          status: subscriber.data.status,
          name: subscriber.data.fields?.name,
        },
      });
    } else {
      // Handle MailerLite errors
      console.error("MailerLite API error:", responseData);

      if (response.status === 422) {
        // Validation error
        const errors = responseData.errors;
        const emailErrors = errors?.email;

        if (
          emailErrors &&
          emailErrors.includes("The email must be a valid email address.")
        ) {
          return NextResponse.json(
            { error: "Please enter a valid email address" },
            { status: 400 },
          );
        }

        return NextResponse.json(
          { error: "Invalid subscription data provided" },
          { status: 400 },
        );
      }

      if (response.status === 401) {
        console.error("MailerLite API authentication failed");
        return NextResponse.json(
          { error: "Newsletter service authentication failed" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { error: "Failed to subscribe to newsletter" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));

    // Handle network or parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
