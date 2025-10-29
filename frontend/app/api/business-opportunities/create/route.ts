import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "../../../../lib/config/database";
import BusinessOpportunity from "../../../../lib/models/BusinessOpportunity";
import {
  validateBusinessOpportunity,
  withValidation,
} from "../../../../lib/middleware/validation";
import { verifyAuth } from "../../../../lib/middleware/auth";
import { CreateBusinessOpportunityData } from "../../../../lib/types/api";

export async function POST(request: NextRequest) {
  return withValidation<CreateBusinessOpportunityData>(
    request,
    validateBusinessOpportunity,
    async (req, data) => {
      try {
        if (!isMongoDBConfigured()) {
          return NextResponse.json(
            {
              message: "Database not available - MongoDB not configured",
            },
            { status: 503 },
          );
        }

        // Verify user is authenticated and is an organizer
        const authResult = await verifyAuth(req);
        if (!authResult.success || !authResult.user) {
          return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 },
          );
        }

        if (authResult.user.userType !== "organizer") {
          return NextResponse.json(
            { message: "Only organizers can create business opportunities" },
            { status: 403 },
          );
        }

        await connectToDatabase();

        const {
          title,
          company,
          logo,
          type,
          location,
          remote,
          deadline,
          description,
          requirements,
          compensation,
          duration,
          contactEmail,
          contactPhone,
          website,
          applyUrl,
          tags,
        } = data;

        // Create new business opportunity
        const businessOpportunity = new BusinessOpportunity({
          title: title.trim(),
          company: company.trim(),
          companyEmail: authResult.user.email,
          organizerId: authResult.user.id,
          logo: logo?.trim() || "",
          type,
          location: location.trim(),
          remote: remote || false,
          deadline: new Date(deadline),
          description: description.trim(),
          requirements: requirements.trim(),
          compensation: compensation?.trim() || "",
          duration: duration?.trim() || "",
          contactEmail: contactEmail.toLowerCase().trim(),
          contactPhone: contactPhone?.trim() || "",
          website: website?.trim() || "",
          applyUrl: applyUrl?.trim() || "",
          tags: tags || [],
          status: "pending",
          approved: false,
          submittedAt: new Date(),
        });

        await businessOpportunity.save();

        // Remove sensitive data from response
        const { organizerId, ...opportunityData } =
          businessOpportunity.toObject();

        return NextResponse.json(
          {
            message: "Business opportunity submitted for approval",
            businessOpportunity: opportunityData,
            success: true,
          },
          { status: 201 },
        );
      } catch (error) {
        console.error("Business opportunity creation error:", error);
        return NextResponse.json(
          { message: "Server error", success: false },
          { status: 500 },
        );
      }
    },
  );
}
