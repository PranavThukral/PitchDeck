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
  likes?: number;
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
  likes?: number;
}

interface DashboardData {
  competitions: Competition[];
  businessOpportunities: BusinessOpportunity[];
  featured: {
    competitions: Competition[];
    businessOpportunities: BusinessOpportunity[];
  };
  favourites: (Competition | BusinessOpportunity)[];
  likedItems: string[];
  stats: {
    totalCompetitions: number;
    totalBusinessOpportunities: number;
    totalFavourites: number;
    totalLikes: number;
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
  const [likedIds, setLikedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/general");
      const data = await response.json();

      if (data.success) {

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

        setDashboardData(transformedData);
        setFavouriteIds(
          data.data.favourites.map(
            (fav: Competition | BusinessOpportunity) => fav._id || fav.id,
          ),
        );
        setLikedIds(data.data.likedItems || []);
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
        console.error("Favourites API error:", data);
        toast.error(data.message || "Failed to update favourites");
      }
    } catch (error) {
      console.error("Favourite error:", error);
      toast.error(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const toggleLike = async (
    itemId: string,
    itemType: "competition" | "business-opportunity",
  ) => {
    try {
      const isLiked = likedIds.includes(itemId);
      const method = isLiked ? "DELETE" : "POST";

      const response = await fetch("/api/auth/likes", {
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
        if (isLiked) {
          setLikedIds((prev) => prev.filter((id) => id !== itemId));
          toast.success("Removed like");
        } else {
          setLikedIds((prev) => [...prev, itemId]);
          toast.success("Liked!");
        }
        // Refresh dashboard to update like counts
        fetchDashboardData();
      } else {
        console.error("Likes API error:", data);
        toast.error(data.message || "Failed to update likes");
      }
    } catch (error) {
      console.error("Like error:", error);
      toast.error(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Helper function to get ID from item with deadline to ensure uniqueness
  // Get the actual database ID for API calls (favorites, etc.)
  const getDatabaseId = (item: Competition | BusinessOpportunity): string => {
    const id = item._id || item.id || "";
    return id;
  };

  // Check if item has a valid ID for like/bookmark functionality
  const canInteract = (item: Competition | BusinessOpportunity): boolean => {
    const id = item._id || item.id || "";
    const hasValidId = id.length > 0;
    return hasValidId;
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

    const databaseId = getDatabaseId(competition);
    const reactKey = getReactKey(competition);
    const canUserInteract = canInteract(competition);

    const handleBookmarkClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (canUserInteract && databaseId) {
        await toggleFavourite(databaseId, "competition");
      } else {
        toast.error("This item cannot be bookmarked (missing ID)");
      }
    };

    const handleLikeClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (canUserInteract && databaseId) {
        await toggleLike(databaseId, "competition");
      } else {
        toast.error("This item cannot be liked (missing ID)");
      }
    };

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
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmarkClick}
                disabled={!canUserInteract}
                title={
                  !canUserInteract
                    ? "Missing item ID"
                    : favouriteIds.includes(databaseId)
                      ? "Remove bookmark"
                      : "Bookmark"
                }
              >
                {favouriteIds.includes(databaseId) ? (
                  <BookmarkMinus className="h-4 w-4 text-red-500" />
                ) : (
                  <BookmarkPlus
                    className={`h-4 w-4 ${!canUserInteract ? "text-gray-300" : ""}`}
                  />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeClick}
                disabled={!canUserInteract}
                title={
                  !canUserInteract
                    ? "Missing item ID"
                    : likedIds.includes(databaseId)
                      ? "Unlike"
                      : "Like"
                }
              >
                <Heart
                  className={`h-4 w-4 ${
                    !canUserInteract
                      ? "text-gray-300"
                      : likedIds.includes(databaseId)
                        ? "text-red-500 fill-red-500"
                        : ""
                  }`}
                />
              </Button>
            </div>
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
            {(competition.gradeTags || []).slice(0, 2).map((tag: string, index: number) => (
              <Badge
                key={`comp-tag-${reactKey}-${index}`}
                variant="outline"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
            {(competition.gradeTags || []).length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{(competition.gradeTags || []).length - 2} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Heart className="h-4 w-4" />
              <span>{competition.likes || 0} likes</span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const BusinessOpportunityCard = ({
    opportunity,
  }: {
    opportunity: BusinessOpportunity;
  }) => {

    const databaseId = getDatabaseId(opportunity);
    const reactKey = getReactKey(opportunity);
    const canUserInteract = canInteract(opportunity);

    const handleBookmarkClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (canUserInteract && databaseId) {
        await toggleFavourite(databaseId, "business-opportunity");
      } else {
        toast.error("This item cannot be bookmarked (missing ID)");
      }
    };

    const handleLikeClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (canUserInteract && databaseId) {
        await toggleLike(databaseId, "business-opportunity");
      } else {
        toast.error("This item cannot be liked (missing ID)");
      }
    };

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
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmarkClick}
                disabled={!canUserInteract}
                title={
                  !canUserInteract
                    ? "Missing item ID"
                    : favouriteIds.includes(databaseId)
                      ? "Remove bookmark"
                      : "Bookmark"
                }
              >
                {favouriteIds.includes(databaseId) ? (
                  <BookmarkMinus className="h-4 w-4 text-red-500" />
                ) : (
                  <BookmarkPlus
                    className={`h-4 w-4 ${!canUserInteract ? "text-gray-300" : ""}`}
                  />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeClick}
                disabled={!canUserInteract}
                title={
                  !canUserInteract
                    ? "Missing item ID"
                    : likedIds.includes(databaseId)
                      ? "Unlike"
                      : "Like"
                }
              >
                <Heart
                  className={`h-4 w-4 ${
                    !canUserInteract
                      ? "text-gray-300"
                      : likedIds.includes(databaseId)
                        ? "text-red-500 fill-red-500"
                        : ""
                  }`}
                />
              </Button>
            </div>
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
            {(opportunity.gradeTags || []).slice(0, 2).map((tag: string, index: number) => (
              <Badge
                key={`opp-tag-${reactKey}-${index}`}
                variant="outline"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
            {(opportunity.gradeTags || []).length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{(opportunity.gradeTags || []).length - 2} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Heart className="h-4 w-4" />
              <span>{opportunity.likes || 0} likes</span>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
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
            <div className="flex gap-2">
              <Link href="/auth/logout">
                <Button variant="outline">Logout</Button>
              </Link>
            </div>
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
                    Your Likes
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData.stats.totalLikes}
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
