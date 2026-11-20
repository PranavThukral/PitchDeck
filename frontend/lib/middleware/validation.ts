import Joi from "joi";
import { NextRequest, NextResponse } from "next/server";

// General user signup validation (students)
const generalUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
  userType: Joi.string().valid("general").required(),
  school: Joi.string().trim().min(2).max(100).required(),
  grade: Joi.string()
    .valid("9", "10", "11", "12", "undergraduate", "graduate")
    .required(),
});

// Organizer signup validation
const organizerUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
  userType: Joi.string().valid("organizer").required(),
  organization: Joi.string().trim().min(2).max(100).required(),
  position: Joi.string().trim().min(2).max(100).required(),
});

// Admin login validation
const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  userType: Joi.string().valid("admin").required(),
});

// General login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
  userType: Joi.string().valid("general", "organizer").optional(),
});

// Competition creation validation
const competitionSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required(),
  organizer: Joi.string().trim().min(2).max(100).required(),
  logo: Joi.string()
    .uri()
    .pattern(/\.(png)$/i)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base": "Logo must be a PNG image URL ending with .png",
    }),
  gradeEligibility: Joi.string().trim().required(),
  deadline: Joi.string().isoDate().required(),
  prize: Joi.string().trim().required(),
  description: Joi.string().trim().min(50).max(5000).required(),
  applicationType: Joi.string().valid("individual", "team", "both").required(),
  applyUrl: Joi.string().uri().optional().allow(""),
  frequency: Joi.string()
    .valid("one-time", "annual", "monthly", "weekly")
    .required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  location: Joi.string().trim().required(),
  cost: Joi.string().trim().required(),
  category: Joi.string()
    .valid("case-competition", "hackathon", "business-plan", "other")
    .required(),
  maxParticipants: Joi.number().integer().min(1).optional(),
  requirements: Joi.string().trim().max(2000).optional().allow(""),
  contactEmail: Joi.string().email().required(),
  contactPhone: Joi.string().trim().optional().allow(""),
  website: Joi.string().uri().optional().allow(""),
  tags: Joi.array()
    .items(Joi.string().trim().min(1).max(30))
    .max(10)
    .default([]),
});

// Business opportunity creation validation
const businessOpportunitySchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required(),
  company: Joi.string().trim().min(2).max(100).required(),
  logo: Joi.string()
    .uri()
    .pattern(/\.(png)$/i)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base": "Logo must be a PNG image URL ending with .png",
    }),
  type: Joi.string()
    .valid("internship", "job", "entrepreneurship", "partnership", "other")
    .required(),
  location: Joi.string().trim().required(),
  remote: Joi.boolean().default(false),
  deadline: Joi.string().isoDate().required(),
  description: Joi.string().trim().min(50).max(5000).required(),
  requirements: Joi.string().trim().min(20).max(3000).required(),
  compensation: Joi.string().trim().optional().allow(""),
  duration: Joi.string().trim().optional().allow(""),
  contactEmail: Joi.string().email().required(),
  contactPhone: Joi.string().trim().optional().allow(""),
  website: Joi.string().uri().optional().allow(""),
  applyUrl: Joi.string().uri().optional().allow(""),
  tags: Joi.array()
    .items(Joi.string().trim().min(1).max(30))
    .max(10)
    .default([]),
});

// Favourites validation - supports both MongoDB ObjectIds and Google Sheets string IDs
const favouritesSchema = Joi.object({
  itemId: Joi.string().min(1).required(),
  itemType: Joi.string()
    .valid("competition", "business-opportunity")
    .required(),
});

// Admin approval validation
const adminApprovalSchema = Joi.object({
  itemId: Joi.string().hex().length(24).required(),
  itemType: Joi.string()
    .valid("competition", "business-opportunity")
    .required(),
  action: Joi.string().valid("approve", "reject").required(),
  rejectionReason: Joi.when("action", {
    is: "reject",
    then: Joi.string().trim().min(10).max(500).required(),
    otherwise: Joi.string().optional().allow(""),
  }),
});

export function validateGeneralSignup(data: unknown) {
  const { error } = generalUserSchema.validate(data);
  if (error) {
    return { isValid: false, message: error.details[0].message };
  }
  return { isValid: true };
}

export function validateOrganizerSignup(data: unknown) {
  const { error } = organizerUserSchema.validate(data);
  if (error) {
    return { isValid: false, message: error.details[0].message };
  }
  return { isValid: true };
}

export function validateLogin(data: unknown) {
  const { error } = loginSchema.validate(data);
  if (error) {
    return { isValid: false, message: error.details[0].message };
  }
  return { isValid: true };
}

export function validateAdminLogin(data: unknown) {
  const { error } = adminLoginSchema.validate(data);
  if (error) {
    return { isValid: false, message: error.details[0].message };
  }
  return { isValid: true };
}

export function validateCompetition(data: unknown) {
  const { error } = competitionSchema.validate(data);
  if (error) {
    return { isValid: false, message: error.details[0].message };
  }
  return { isValid: true };
}

export function validateBusinessOpportunity(data: unknown) {
  const { error } = businessOpportunitySchema.validate(data);
  if (error) {
    return { isValid: false, message: error.details[0].message };
  }
  return { isValid: true };
}

export function validateFavourites(data: unknown) {
  const { error } = favouritesSchema.validate(data);
  if (error) {
    return { isValid: false, message: error.details[0].message };
  }
  return { isValid: true };
}

export function validateAdminApproval(data: unknown) {
  const { error } = adminApprovalSchema.validate(data);
  if (error) {
    return { isValid: false, message: error.details[0].message };
  }
  return { isValid: true };
}

export async function withValidation<T>(
  request: NextRequest,
  validator: (data: unknown) => { isValid: boolean; message?: string },
  handler: (request: NextRequest, data: T) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = validator(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { message: validation.message },
        { status: 400 },
      );
    }

    return await handler(request, body as T);
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
}
