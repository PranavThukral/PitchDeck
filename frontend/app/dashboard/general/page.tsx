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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Heart,
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Building,
  Star,
  TrendingUp,
  Filter,
  BookmarkPlus,
  BookmarkMinus,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Competition {
  _id?: string;
  id?: string;
  title: string;
  organizer: string;
  deadline: string;
  prize: string;
  location: string;
  category: string;
  applicationType: string;
  tags: string[];
  description: string;
}

interface BusinessOpportunity {
  _id?: string;
  id?: string;
  title: string;
  company: string;
  type: string;
  location: string;
  remote: boolean;
  deadline: string;
  compensation?: string;
  tags: string[];
  description: string;
}

interface DashboardData {
  competitions: Competition[];
  businessOpportunities: BusinessOpportunity[];
  featured: {
    competitions: Competition[];
    businessOpportunities: BusinessOpportunity[];
  };
  favourites: (Competition | BusinessOpportunity)[];
  stats: {
    totalCompetitions: number;
    totalBusinessOpportunities: number;
    totalFavourites: number;
    categories: Array<{ _id: string; count: number }>;
    opportunityTypes: Array<{ _id: string; count: number }>;
  };
  user: {
    firstName: string;
    lastName: string;
    school: string;
    grade: string;
  };
}

export default function GeneralDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/general");
      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
        setFavouriteIds(
          data.data.favourites.map(
            (fav: Competition | BusinessOpportunity) => fav._id || fav.id,
          ),
        );
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

  const toggleFavourite = async (
    itemId: string,
    itemType: "competition" | "business-opportunity",
  ) => {
    try {
      const isFavourite = favouriteIds.includes(itemId);
      const method = isFavourite ? "DELETE" : "POST";

      const response = await fetch("/api/auth/favourites", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          itemType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (isFavourite) {
          setFavouriteIds((prev) => prev.filter((id) => id !== itemId));
          toast.success("Removed from favourites");
        } else {
          setFavouriteIds((prev) => [...prev, itemId]);
          toast.success("Added to favourites");
        }
      } else {
        toast.error(data.message || "Failed to update favourites");
      }
    } catch (error) {
      console.error("Favourite error:", error);
      toast.error("An error occurred");
    }
  };

  // Helper function to get ID from item with deadline to ensure uniqueness
  const getItemId = (
    item: Competition | BusinessOpportunity,
    index?: number,
    section?: string,
  ): string => {
    const baseId =
      item._id ||
      item.id ||
      `fallback-${item.title?.replace(/\s+/g, "-").toLowerCase() || "unknown"}`;

    // Add section prefix, deadline and index to make key truly unique
    const deadline = item.deadline || "no-date";
    const sectionPrefix = section ? `${section}-` : "";
    const indexSuffix = index !== undefined ? `-${index}` : "";
    const uniqueId = `${sectionPrefix}${baseId}-${deadline}${indexSuffix}`;

    return uniqueId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const CompetitionCard = ({ competition }: { competition: Competition }) => {
    const itemId = getItemId(competition);
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {competition.title}
              </CardTitle>
              <CardDescription>{competition.organizer}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFavourite(itemId, "competition")}
              className="ml-2"
            >
              {favouriteIds.includes(itemId) ? (
                <BookmarkMinus className="h-4 w-4 text-red-500" />
              ) : (
                <BookmarkPlus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
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
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-purple-500" />
              <span>{competition.applicationType}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            <Badge variant="secondary">{competition.category}</Badge>
            {(competition.tags || [])
              .slice(0, 2)
              .map((tag: string, index: number) => (
                <Badge
                  key={`comp-tag-${itemId}-${index}`}
                  variant="outline"
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
            {(competition.tags || []).length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{(competition.tags || []).length - 2} more
              </Badge>
            )}
          </div>

          <Button className="w-full" size="sm">
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  const BusinessOpportunityCard = ({
    opportunity,
  }: {
    opportunity: BusinessOpportunity;
  }) => {
    const itemId = getItemId(opportunity);
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {opportunity.title}
              </CardTitle>
              <CardDescription>{opportunity.company}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFavourite(itemId, "business-opportunity")}
              className="ml-2"
            >
              {favouriteIds.includes(itemId) ? (
                <BookmarkMinus className="h-4 w-4 text-red-500" />
              ) : (
                <BookmarkPlus className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
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
            {(opportunity.tags || [])
              .slice(0, 2)
              .map((tag: string, index: number) => (
                <Badge
                  key={`opp-tag-${itemId}-${index}`}
                  variant="outline"
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
            {(opportunity.tags || []).length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{(opportunity.tags || []).length - 2} more
              </Badge>
            )}
          </div>

          <Button className="w-full" size="sm">
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 animate-pulse text-[#19613F] mx-auto mb-4" />
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Failed to load dashboard</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-serif">
                Welcome back, {dashboardData.user.firstName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {dashboardData.user.school} • {dashboardData.user.grade}
              </p>
            </div>
            <Link href="/auth/logout">
              <Button variant="outline">Logout</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Competitions
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData.stats.totalCompetitions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Opportunities
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData.stats.totalBusinessOpportunities}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Favourites
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData.stats.totalFavourites}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    New This Week
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData.featured.competitions.length +
                      dashboardData.featured.businessOpportunities.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search competitions and opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="featured" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="favourites">Favourites</TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Featured Competitions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {dashboardData.featured.competitions.map(
                  (competition: Competition, index: number) => {
                    const key = getItemId(competition, index, "featured-comp");
                    return (
                      <CompetitionCard key={key} competition={competition} />
                    );
                  },
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Featured Opportunities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {dashboardData.featured.businessOpportunities.map(
                  (opportunity: BusinessOpportunity, index: number) => (
                    <BusinessOpportunityCard
                      key={getItemId(opportunity, index, "featured-opp")}
                      opportunity={opportunity}
                    />
                  ),
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="competitions">
            <div>
              <h2 className="text-2xl font-semibold mb-4">All Competitions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.competitions.map(
                  (competition: Competition, index: number) => {
                    const key = getItemId(competition, index, "all-comp");
                    return (
                      <CompetitionCard key={key} competition={competition} />
                    );
                  },
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="opportunities">
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Business Opportunities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.businessOpportunities.map(
                  (opportunity: BusinessOpportunity, index: number) => (
                    <BusinessOpportunityCard
                      key={getItemId(opportunity, index, "all-opp")}
                      opportunity={opportunity}
                    />
                  ),
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="favourites">
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                Your Favourites
              </h2>
              {dashboardData.favourites.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No favourites yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start saving competitions and opportunities you&apos;re
                      interested in!
                    </p>
                    <Button
                      onClick={() => {
                        const element = document.querySelector(
                          '[value="competitions"]',
                        ) as HTMLButtonElement;
                        if (element && typeof element.click === "function") {
                          element.click();
                        }
                      }}
                    >
                      Browse Competitions
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.favourites.map(
                    (
                      favourite: Competition | BusinessOpportunity,
                      index: number,
                    ) => {
                      // Use a type guard to differentiate
                      if ("category" in favourite) {
                        return (
                          <CompetitionCard
                            key={getItemId(favourite, index, "fav-comp")}
                            competition={favourite as Competition}
                          />
                        );
                      } else if ("company" in favourite) {
                        return (
                          <BusinessOpportunityCard
                            key={getItemId(favourite, index, "fav-opp")}
                            opportunity={favourite as BusinessOpportunity}
                          />
                        );
                      }
                      return null;
                    },
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
