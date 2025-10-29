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
  gradeTags: string[];
  description: string;
}

interface BusinessOpportunity {
  _id?: string;
  id?: string;
  title: string;
  organizer: string;
  category: string;
  format: string;
  status: string;
  startDate: string;
  endDate: string;
  cost: string;
  costNumeric: number;
  gradeTags: string[];
  description: string;
  applicationType: string;
  applyUrl: string;
  duration: string;
  timeCommitment: string;
  opportunityType: string[];
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
        console.log("🔍 API DATA DEBUG:", {
          competitionsCount: data.data.competitions?.length || 0,
          firstCompetition: data.data.competitions?.[0]
            ? {
                title: data.data.competitions[0].title,
                hasGradeTags: "gradeTags" in data.data.competitions[0],
                gradeTagsValue: data.data.competitions[0].gradeTags,
                hasOldTags: "tags" in data.data.competitions[0],
                oldTagsValue: data.data.competitions[0].tags,
                allKeys: Object.keys(data.data.competitions[0]),
              }
            : null,
        });

        // Validate and transform data to ensure gradeTags field exists
        const transformedData = {
          ...data.data,
          competitions:
            data.data.competitions?.map(
              (comp: Competition & { tags?: string[] }) => ({
                ...comp,
                gradeTags: comp.gradeTags || comp.tags || [],
              }),
            ) || [],
          businessOpportunities:
            data.data.businessOpportunities?.map(
              (opp: BusinessOpportunity & { tags?: string[] }) => ({
                ...opp,
                gradeTags: opp.gradeTags || opp.tags || [],
              }),
            ) || [],
          featured: {
            ...data.data.featured,
            competitions:
              data.data.featured?.competitions?.map(
                (comp: Competition & { tags?: string[] }) => ({
                  ...comp,
                  gradeTags: comp.gradeTags || comp.tags || [],
                }),
              ) || [],
            businessOpportunities:
              data.data.featured?.businessOpportunities?.map(
                (opp: BusinessOpportunity & { tags?: string[] }) => ({
                  ...opp,
                  gradeTags: opp.gradeTags || opp.tags || [],
                }),
              ) || [],
          },
          favourites:
            data.data.favourites?.map(
              (
                fav: (Competition | BusinessOpportunity) & { tags?: string[] },
              ) => ({
                ...fav,
                gradeTags: fav.gradeTags || fav.tags || [],
              }),
            ) || [],
        };

        console.log("🔍 TRANSFORMED DATA:", {
          firstCompTransformed: transformedData.competitions?.[0]
            ? {
                title: transformedData.competitions[0].title,
                gradeTags: transformedData.competitions[0].gradeTags,
                hasGradeTags: "gradeTags" in transformedData.competitions[0],
              }
            : null,
        });

        setDashboardData(transformedData);
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
  // Get the actual database ID for API calls (favorites, etc.)
  const getDatabaseId = (item: Competition | BusinessOpportunity): string => {
    return item._id || item.id || "";
  };

  // Check if item is from database (has MongoDB ObjectId) vs Google Sheets
  const isDatabaseItem = (item: Competition | BusinessOpportunity): boolean => {
    const id = item._id || item.id || "";
    // MongoDB ObjectIds are exactly 24 characters and hexadecimal
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Get unique React key for rendering (can contain any characters)
  const getReactKey = (
    item: Competition | BusinessOpportunity,
    index?: number,
    section?: string,
  ): string => {
    const baseId =
      item._id ||
      item.id ||
      `fallback-${item.title?.replace(/\s+/g, "-").toLowerCase() || "unknown"}`;

    // Add section prefix, date and index to make key truly unique
    let dateField = "no-date";

    // Type guard for Competition
    const isCompetition = (
      obj: Competition | BusinessOpportunity,
    ): obj is Competition => {
      return "deadline" in obj;
    };

    // Type guard for BusinessOpportunity
    const isBusinessOpportunity = (
      obj: Competition | BusinessOpportunity,
    ): obj is BusinessOpportunity => {
      return "startDate" in obj;
    };

    if (isCompetition(item) && item.deadline) {
      dateField = item.deadline;
    } else if (isBusinessOpportunity(item) && item.startDate) {
      dateField = item.startDate;
    }

    const sectionPrefix = section ? `${section}-` : "";
    const indexSuffix = index !== undefined ? `-${index}` : "";
    const uniqueId = `${sectionPrefix}${baseId}-${dateField}${indexSuffix}`;

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
    console.log("🔍 CompetitionCard DEBUG:", {
      title: competition.title,
      hasGradeTags: "gradeTags" in competition,
      gradeTagsValue: competition.gradeTags,
      gradeTagsType: typeof competition.gradeTags,
      hasOldTags: "tags" in competition,
      oldTagsValue: (competition as Competition & { tags?: string[] }).tags,
      allKeys: Object.keys(competition),
    });

    const databaseId = getDatabaseId(competition);
    const reactKey = getReactKey(competition);
    const isDbItem = isDatabaseItem(competition);

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
            {isDbItem ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavourite(databaseId, "competition")}
                className="ml-2"
              >
                {favouriteIds.includes(databaseId) ? (
                  <BookmarkMinus className="h-4 w-4 text-red-500" />
                ) : (
                  <BookmarkPlus className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="ml-2 opacity-50 cursor-not-allowed"
                title="Favorites are only available for database-stored items. This item is from Google Sheets."
              >
                <BookmarkPlus className="h-4 w-4 text-gray-300" />
              </Button>
            )}
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
            {(() => {
              try {
                console.log("🔍 About to render competition tags:", {
                  title: competition.title,
                  gradeTags: competition.gradeTags,
                  gradeTagsType: typeof competition.gradeTags,
                  hasGradeTags: "gradeTags" in competition,
                  hasOldTags: "tags" in competition,
                  oldTagsValue: (
                    competition as Competition & { tags?: string[] }
                  ).tags,
                });

                const tags = competition.gradeTags || [];
                return tags.slice(0, 2).map((tag: string, index: number) => (
                  <Badge
                    key={`comp-tag-${reactKey}-${index}`}
                    variant="outline"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ));
              } catch (error) {
                console.error(
                  "🚨 ERROR in competition tags rendering:",
                  error,
                  {
                    competition,
                    gradeTags: competition.gradeTags,
                    hasGradeTags: "gradeTags" in competition,
                  },
                );
                return null;
              }
            })()}
            {(() => {
              try {
                const tags = competition.gradeTags || [];
                return tags.length > 2 ? (
                  <Badge variant="outline" className="text-xs">
                    +{tags.length - 2} more
                  </Badge>
                ) : null;
              } catch (error) {
                console.error("🚨 ERROR in competition tags count:", error);
                return null;
              }
            })()}
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
    console.log("🔍 BusinessOpportunityCard DEBUG:", {
      title: opportunity.title,
      hasGradeTags: "gradeTags" in opportunity,
      gradeTagsValue: opportunity.gradeTags,
      gradeTagsType: typeof opportunity.gradeTags,
      hasOldTags: "tags" in opportunity,
      oldTagsValue: (opportunity as BusinessOpportunity & { tags?: string[] })
        .tags,
      allKeys: Object.keys(opportunity),
    });

    const databaseId = getDatabaseId(opportunity);
    const reactKey = getReactKey(opportunity);
    const isDbItem = isDatabaseItem(opportunity);

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {opportunity.title}
              </CardTitle>
              <CardDescription>{opportunity.organizer}</CardDescription>
            </div>
            {isDbItem ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  toggleFavourite(databaseId, "business-opportunity")
                }
                className="ml-2"
              >
                {favouriteIds.includes(databaseId) ? (
                  <BookmarkMinus className="h-4 w-4 text-red-500" />
                ) : (
                  <BookmarkPlus className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="ml-2 opacity-50 cursor-not-allowed"
                title="Favorites are only available for database-stored items. This item is from Google Sheets."
              >
                <BookmarkPlus className="h-4 w-4 text-gray-300" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
            {opportunity.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span>Start: {formatDate(opportunity.startDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-red-500" />
              <span>End: {formatDate(opportunity.endDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>{opportunity.format}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span>{opportunity.cost}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            <Badge variant="secondary">{opportunity.category}</Badge>
            {(() => {
              try {
                console.log("🔍 About to render opportunity tags:", {
                  title: opportunity.title,
                  gradeTags: opportunity.gradeTags,
                  gradeTagsType: typeof opportunity.gradeTags,
                  hasGradeTags: "gradeTags" in opportunity,
                  hasOldTags: "tags" in opportunity,
                  oldTagsValue: (
                    opportunity as BusinessOpportunity & { tags?: string[] }
                  ).tags,
                });

                const tags = opportunity.gradeTags || [];
                return tags.slice(0, 2).map((tag: string, index: number) => (
                  <Badge
                    key={`opp-tag-${reactKey}-${index}`}
                    variant="outline"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ));
              } catch (error) {
                console.error(
                  "🚨 ERROR in opportunity tags rendering:",
                  error,
                  {
                    opportunity,
                    gradeTags: opportunity.gradeTags,
                    hasGradeTags: "gradeTags" in opportunity,
                  },
                );
                return null;
              }
            })()}
            {(() => {
              try {
                const tags = opportunity.gradeTags || [];
                return tags.length > 2 ? (
                  <Badge variant="outline" className="text-xs">
                    +{tags.length - 2} more
                  </Badge>
                ) : null;
              } catch (error) {
                console.error("🚨 ERROR in opportunity tags count:", error);
                return null;
              }
            })()}
          </div>

          <div className="mt-4">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Learn More
            </Button>
          </div>
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
                    const key = getReactKey(
                      competition,
                      index,
                      "featured-comp",
                    );
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
                      key={getReactKey(opportunity, index, "featured-opp")}
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
                    const key = getReactKey(competition, index, "all-comp");
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
                      key={getReactKey(opportunity, index, "all-opp")}
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
                            key={getReactKey(favourite, index, "fav-comp")}
                            competition={favourite as Competition}
                          />
                        );
                      } else if ("company" in favourite) {
                        return (
                          <BusinessOpportunityCard
                            key={getReactKey(favourite, index, "fav-opp")}
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
