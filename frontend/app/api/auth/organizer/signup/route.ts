import { NextRequest } from "next/server";
import {
  createAccount,
  databaseUnavailable,
  serverError,
} from "@/lib/auth/handlers";
import { isMongoDBConfigured } from "@/lib/config/database";
import {
  validateOrganizerSignup,
  withValidation,
} from "@/lib/middleware/validation";
import type { OrganizerSignupData } from "@/lib/types/api";

export async function POST(request: NextRequest) {
  return withValidation<OrganizerSignupData>(
    request,
    validateOrganizerSignup,
    async (_request, data) => {
      if (!isMongoDBConfigured()) return databaseUnavailable();
      try {
        return await createAccount(
          {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: data.email,
            password: data.password,
            userType: "organizer",
            organization: data.organization.trim(),
            position: data.position.trim(),
          },
          "Organizer account created successfully",
        );
      } catch (error) {
        return serverError("Organizer signup error", error);
      }
    },
  );
}
