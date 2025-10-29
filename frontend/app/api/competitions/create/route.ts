import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "../../../../lib/config/database";
import Competition from "../../../../lib/models/Competition";
import {
  validateCompetition,
  withValidation,
} from "../../../../lib/middleware/validation";
import { verifyAuth } from "../../../../lib/middleware/auth";
import { CreateCompetitionData } from "../../../../lib/types/api";

export async function POST(request: NextRequest) {
  return withValidation<CreateCompetitionData>(
    request,
    validateCompetition,
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
            { message: "Only organizers can create competitions" },
            { status: 403 },
          );
        }

        await connectToDatabase();

        const {
          title,
          organizer,
          logo,
          gradeEligibility,
          deadline,
          prize,
          description,
          applicationType,
          applyUrl,
          frequency,
          startDate,
          endDate,
          location,
          cost,
          category,
          maxParticipants,
          requirements,
          contactEmail,
          contactPhone,
          website,
          tags,
        } = data;

        // Create new competition
        const competition = new Competition({
          title: title.trim(),
          organizer: organizer.trim(),
          organizerEmail: authResult.user.email,
          organizerId: authResult.user.id,
          logo: logo?.trim() || "",
          gradeEligibility: gradeEligibility.trim(),
          deadline: new Date(deadline),
          prize: prize.trim(),
          status: "pending",
          description: description.trim(),
          applicationType,
          applyUrl: applyUrl?.trim() || "",
          frequency,
          dates: [startDate, endDate],
          location: location.trim(),
          cost: cost.trim(),
          category,
          maxParticipants,
          requirements: requirements?.trim() || "",
          contactEmail: contactEmail.toLowerCase().trim(),
          contactPhone: contactPhone?.trim() || "",
          website: website?.trim() || "",
          tags: tags || [],
          approved: false,
          submittedAt: new Date(),
        });

        await competition.save();

        // Remove sensitive data from response
        const { organizerId, ...competitionData } = competition.toObject();

        return NextResponse.json(
          {
            message: "Competition submitted for approval",
            competition: competitionData,
            success: true,
          },
          { status: 201 },
        );
      } catch (error) {
        console.error("Competition creation error:", error);
        return NextResponse.json(
          { message: "Server error", success: false },
          { status: 500 },
        );
      }
    },
  );
}
