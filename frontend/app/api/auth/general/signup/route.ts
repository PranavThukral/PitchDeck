import { NextRequest } from "next/server";
import {
  createAccount,
  databaseUnavailable,
  serverError,
} from "@/lib/auth/handlers";
import { isMongoDBConfigured } from "@/lib/config/database";
import {
  validateGeneralSignup,
  withValidation,
} from "@/lib/middleware/validation";
import type { GeneralSignupData } from "@/lib/types/api";

export async function POST(request: NextRequest) {
  return withValidation<GeneralSignupData>(
    request,
    validateGeneralSignup,
    async (_request, data) => {
      if (!isMongoDBConfigured()) return databaseUnavailable();
      try {
        return await createAccount(
          {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: data.email,
            password: data.password,
            userType: "general",
            school: data.school.trim(),
            grade: data.grade.trim(),
          },
          "Account created successfully",
        );
      } catch (error) {
        return serverError("General signup error", error);
      }
    },
  );
}
