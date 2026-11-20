"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Trophy,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Navigation } from "@/components/layout/navigation";

interface Competition {
  _id: string;
  title: string;
  organizer: string;
  deadline: string;
  prize: string;
  status: string;
  description: string;
  location: string;
  category: string;
  gradeTags: string[];
  submittedAt: string;
  rejectionReason?: string;
}

interface BusinessOpportunity {
  _id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  remote: boolean;
  deadline: string;
  description: string;
  compensation?: string;
  gradeTags: string[];
  status: string;
  submittedAt: string;
  rejectionReason?: string;
}

interface OrganizerData {
  mySubmissions: {
    competitions: Competition[];
    businessOpportunities: BusinessOpportunity[];
  };
  stats: {
    competitions: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    businessOpportunities: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    totalSubmissions: number;
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
  };
  user: {
    firstName: string;
    lastName: string;
    organization: string;
    position: string;
  };
}

export default function OrganizerDashboardSimple() {
  const [dashboardData, setDashboardData] = useState<OrganizerData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/organizer", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        toast.error(data.message || "Failed to load dashboard");
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "live":
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const CompetitionCard = ({ competition }: { competition: Competition }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {competition.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Building className="h-4 w-4" />
              {competition.organizer}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(competition.status)}>
            {competition.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {competition.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span>Deadline: {formatDate(competition.deadline)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>{competition.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span>{competition.prize}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          <Badge variant="secondary">{competition.category}</Badge>
          {(competition.gradeTags || [])
            .slice(0, 2)
            .map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>Submitted: {formatDate(competition.submittedAt)}</p>
        </div>

        {competition.rejectionReason && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400">
              <strong>Rejection Reason:</strong> {competition.rejectionReason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const BusinessOpportunityCard = ({
    opportunity,
  }: {
    opportunity: BusinessOpportunity;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {opportunity.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Building className="h-4 w-4" />
              {opportunity.company}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(opportunity.status)}>
            {opportunity.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {opportunity.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span>Deadline: {formatDate(opportunity.deadline)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>{opportunity.location}</span>
            {opportunity.remote && (
              <Badge variant="outline" className="text-xs ml-2">
                Remote
              </Badge>
            )}
          </div>
          {opportunity.compensation && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span>{opportunity.compensation}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          <Badge variant="secondary">{opportunity.type}</Badge>
          {(opportunity.gradeTags || [])
            .slice(0, 2)
            .map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>Submitted: {formatDate(opportunity.submittedAt)}</p>
        </div>

        {opportunity.rejectionReason && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400">
              <strong>Rejection Reason:</strong> {opportunity.rejectionReason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <Building className="h-12 w-12 animate-pulse text-green-600 mx-auto mb-4" />
            <p className="text-lg">Loading organizer dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-red-600">Failed to load dashboard</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-serif">
                  Welcome, {dashboardData.user.firstName}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {dashboardData.user.position} at{" "}
                  {dashboardData.user.organization}
                </p>
              </div>
              <div className="flex space-x-4">
                <Link href="/create/competition">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Trophy className="h-4 w-4 mr-2" />
                    Create Competition
                  </Button>
                </Link>
                <Link href="/create/business-opportunity">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Building className="h-4 w-4 mr-2" />
                    Create Opportunity
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Submissions
                    </p>
                    <p className="text-2xl font-bold">
                      {dashboardData.stats.totalSubmissions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Pending Review
                    </p>
                    <p className="text-2xl font-bold">
                      {dashboardData.stats.totalPending}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Approved
                    </p>
                    <p className="text-2xl font-bold">
                      {dashboardData.stats.totalApproved}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Rejected
                    </p>
                    <p className="text-2xl font-bold">
                      {dashboardData.stats.totalRejected}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="competitions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="competitions"
                className="flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                My Competitions ({dashboardData.stats.competitions.total})
              </TabsTrigger>
              <TabsTrigger
                value="opportunities"
                className="flex items-center gap-2"
              >
                <Building className="h-4 w-4" />
                My Opportunities (
                {dashboardData.stats.businessOpportunities.total})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="competitions" className="space-y-6">
              {dashboardData.mySubmissions.competitions.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No competitions yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create your first competition to get started!
                    </p>
                    <Link href="/create/competition">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Competition
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.mySubmissions.competitions.map(
                    (competition) => (
                      <CompetitionCard
                        key={competition._id}
                        competition={competition}
                      />
                    ),
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-6">
              {dashboardData.mySubmissions.businessOpportunities.length ===
              0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No opportunities yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create your first business opportunity to get started!
                    </p>
                    <Link href="/create/business-opportunity">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Opportunity
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.mySubmissions.businessOpportunities.map(
                    (opportunity) => (
                      <BusinessOpportunityCard
                        key={opportunity._id}
                        opportunity={opportunity}
                      />
                    ),
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
