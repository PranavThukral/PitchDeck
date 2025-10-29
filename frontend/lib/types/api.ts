export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: "general" | "organizer" | "admin";
  school?: string;
  grade?: string;
  organization?: string;
  position?: string;
}

export interface LoginData {
  email: string;
  password: string;
  userType?: "general" | "organizer" | "admin";
}

export interface CompetitionData {
  title: string;
  organizer: string;
  organizerEmail: string;
  organizerId: string;
  logo?: string;
  gradeEligibility: string;
  deadline: Date;
  prize: string;
  status: "draft" | "pending" | "approved" | "rejected" | "live" | "closed";
  description: string;
  applicationType: "individual" | "team" | "both";
  applyUrl?: string;
  frequency: "one-time" | "annual" | "monthly" | "weekly";
  dates: [string, string];
  location: string;
  cost: string;
  category: "case-competition" | "hackathon" | "business-plan" | "other";
  maxParticipants?: number;
  requirements?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  tags: string[];
  approved: boolean;
  rejectionReason?: string;
  submittedAt: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessOpportunityData {
  title: string;
  company: string;
  companyEmail: string;
  organizerId: string;
  logo?: string;
  type: "internship" | "job" | "entrepreneurship" | "partnership" | "other";
  location: string;
  remote: boolean;
  deadline: Date;
  description: string;
  requirements: string;
  compensation?: string;
  duration?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  applyUrl?: string;
  tags: string[];
  status: "draft" | "pending" | "approved" | "rejected" | "live" | "closed";
  approved: boolean;
  rejectionReason?: string;
  submittedAt: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: "general" | "organizer" | "admin";
  school?: string;
  grade?: string;
  organization?: string;
  position?: string;
  approved: boolean;
  favourites: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FavouritesData {
  itemId: string;
  itemType: "competition" | "business-opportunity";
}

export interface AdminApprovalData {
  itemId: string;
  itemType: "competition" | "business-opportunity";
  action: "approve" | "reject";
  rejectionReason?: string;
}

export interface CreateCompetitionData {
  title: string;
  organizer: string;
  logo?: string;
  gradeEligibility: string;
  deadline: string;
  prize: string;
  description: string;
  applicationType: "individual" | "team" | "both";
  applyUrl?: string;
  frequency: "one-time" | "annual" | "monthly" | "weekly";
  startDate: string;
  endDate: string;
  location: string;
  cost: string;
  category: "case-competition" | "hackathon" | "business-plan" | "other";
  maxParticipants?: number;
  requirements?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  tags: string[];
}

export interface CreateBusinessOpportunityData {
  title: string;
  company: string;
  logo?: string;
  type: "internship" | "job" | "entrepreneurship" | "partnership" | "other";
  location: string;
  remote: boolean;
  deadline: string;
  description: string;
  requirements: string;
  compensation?: string;
  duration?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  applyUrl?: string;
  tags: string[];
}

export interface ApiResponse<T = unknown> {
  message?: string;
  user?: UserData;
  competition?: CompetitionData;
  businessOpportunity?: BusinessOpportunityData;
  competitions?: CompetitionData[];
  businessOpportunities?: BusinessOpportunityData[];
  favourites?: string[] | (CompetitionData | BusinessOpportunityData)[];
  data?: T;
  success?: boolean;
  error?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: PaginationData;
}
