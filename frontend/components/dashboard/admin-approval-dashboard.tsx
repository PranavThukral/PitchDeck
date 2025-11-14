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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  Trophy,
  Building,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Check,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Navigation } from "@/components/layout/navigation";
import Image from "next/image";

interface Competition {
  _id: string;
  title: string;
  organizer: string;
  organizerEmail: string;
  gradeEligibility: string;
  deadline: string;
  prize: string;
  status: string;
  description: string;
  applicationType: string;
  frequency: string;
  dates: [string, string];
  location: string;
  cost: string;
  category: string;
  gradeTags: string[];
  contactEmail: string;
  submittedAt: string;
  rejectionReason?: string;
}

interface BusinessOpportunity {
  _id: string;
  title: string;
  company: string;
  companyEmail: string;
  type: string;
  location: string;
  remote: boolean;
  deadline: string;
  description: string;
  requirements: string;
  compensation?: string;
  duration?: string;
  contactEmail: string;
  gradeTags: string[];
  status: string;
  submittedAt: string;
  rejectionReason?: string;
}

interface PendingData {
  pending: {
    competitions: Competition[];
    businessOpportunities: BusinessOpportunity[];
  };
  rejected: {
    competitions: Competition[];
    businessOpportunities: BusinessOpportunity[];
  };
  stats: {
    totalPendingCompetitions: number;
    totalPendingBusinessOpportunities: number;
    totalPending: number;
  };
}

interface AnnouncementSettings {
  isEnabled: boolean;
  title: string;
  message: string;
  imageUrl: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  updatedAt?: string;
}

export default function AdminApprovalDashboard() {
  const [pendingData, setPendingData] = useState<PendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingItems, setProcessingItems] = useState<Set<string>>(
    new Set(),
  );
  const [announcementSettings, setAnnouncementSettings] =
    useState<AnnouncementSettings | null>(null);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    Competition | BusinessOpportunity | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    fetchPendingItems();
    fetchAnnouncementSettings();
  }, []);

  const fetchAnnouncementSettings = async () => {
    try {
      const response = await fetch("/api/admin/announcement", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setAnnouncementSettings(data.data);
      } else if (data.message) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to load announcement settings:", error);
      toast.error("Failed to load popup settings");
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const handleAnnouncementSave = async () => {
    if (!announcementSettings) return;
    setAnnouncementSaving(true);
    try {
      const response = await fetch("/api/admin/announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(announcementSettings),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Popup settings updated");
        setAnnouncementSettings(data.data);
      } else {
        toast.error(data.message || "Failed to update popup settings");
      }
    } catch (error) {
      console.error("Failed to update popup settings:", error);
      toast.error("Failed to update popup settings");
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const fetchPendingItems = async () => {
    try {
      const response = await fetch("/api/admin/pending", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setPendingData(data.data);
      } else {
        toast.error(data.message || "Failed to load pending items");
      }
    } catch (error) {
      console.error("Failed to fetch pending items:", error);
      toast.error("Failed to load pending items");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (
    itemId: string,
    itemType: "competition" | "business-opportunity",
  ) => {
    setProcessingItems((prev) => new Set(prev).add(itemId));

    try {
      const response = await fetch("/api/admin/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemId,
          itemType,
          action: "approve",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `${itemType === "competition" ? "Competition" : "Business opportunity"} approved successfully!`,
        );
        await fetchPendingItems(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to approve item");
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("An error occurred while approving");
    } finally {
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    const itemType =
      "category" in selectedItem ? "competition" : "business-opportunity";
    setProcessingItems((prev) => new Set(prev).add(selectedItem._id));

    try {
      const response = await fetch("/api/admin/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemId: selectedItem._id,
          itemType,
          action: "reject",
          rejectionReason: rejectionReason.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `${itemType === "competition" ? "Competition" : "Business opportunity"} rejected successfully!`,
        );
        setShowRejectDialog(false);
        setSelectedItem(null);
        setRejectionReason("");
        await fetchPendingItems(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to reject item");
      }
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error("An error occurred while rejecting");
    } finally {
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedItem._id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          <Badge
            variant={
              competition.status === "pending"
                ? "secondary"
                : competition.status === "rejected"
                  ? "destructive"
                  : "default"
            }
          >
            {competition.status}
          </Badge>
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
          {(competition.gradeTags || [])
            .slice(0, 2)
            .map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          {(competition.gradeTags || []).length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{(competition.gradeTags || []).length - 2} more
            </Badge>
          )}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>Contact: {competition.contactEmail}</p>
          <p>Submitted: {formatDate(competition.submittedAt)}</p>
        </div>

        {competition.rejectionReason && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md mb-4">
            <p className="text-sm text-red-700 dark:text-red-400">
              <strong>Rejection Reason:</strong> {competition.rejectionReason}
            </p>
          </div>
        )}

        {competition.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleApprove(competition._id, "competition")}
              disabled={processingItems.has(competition._id)}
            >
              {processingItems.has(competition._id) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => {
                setSelectedItem(competition);
                setShowRejectDialog(true);
              }}
              disabled={processingItems.has(competition._id)}
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
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
          <Badge
            variant={
              opportunity.status === "pending"
                ? "secondary"
                : opportunity.status === "rejected"
                  ? "destructive"
                  : "default"
            }
          >
            {opportunity.status}
          </Badge>
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
          {(opportunity.gradeTags || [])
            .slice(0, 2)
            .map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          {(opportunity.gradeTags || []).length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{(opportunity.gradeTags || []).length - 2} more
            </Badge>
          )}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>Contact: {opportunity.contactEmail}</p>
          <p>Submitted: {formatDate(opportunity.submittedAt)}</p>
        </div>

        {opportunity.rejectionReason && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md mb-4">
            <p className="text-sm text-red-700 dark:text-red-400">
              <strong>Rejection Reason:</strong> {opportunity.rejectionReason}
            </p>
          </div>
        )}

        {opportunity.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() =>
                handleApprove(opportunity._id, "business-opportunity")
              }
              disabled={processingItems.has(opportunity._id)}
            >
              {processingItems.has(opportunity._id) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => {
                setSelectedItem(opportunity);
                setShowRejectDialog(true);
              }}
              disabled={processingItems.has(opportunity._id)}
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
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
            <Shield className="h-12 w-12 animate-pulse text-red-600 mx-auto mb-4" />
            <p className="text-lg">Loading admin dashboard...</p>
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
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Review and approve submissions before they go live
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Pending Reviews
                    </p>
                    <p className="text-2xl font-bold">
                      {pendingData?.stats.totalPending || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Competitions
                    </p>
                    <p className="text-2xl font-bold">
                      {pendingData?.stats.totalPendingCompetitions || 0}
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
                      {pendingData?.stats.totalPendingBusinessOpportunities ||
                        0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popup Controls */}
          <Card className="mb-8 border-emerald-200/70 dark:border-emerald-700/40">
            <CardHeader>
              <CardTitle>Social Welcome Popup</CardTitle>
              <CardDescription>
                Manage the pop-up students see when they land on TPD from Instagram or TikTok.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {announcementLoading ? (
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-300">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  Loading popup settings...
                </div>
              ) : announcementSettings ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="popup-title">Title</Label>
                      <Input
                        id="popup-title"
                        value={announcementSettings.title}
                        onChange={(event) =>
                          setAnnouncementSettings((prev) =>
                            prev
                              ? { ...prev, title: event.target.value }
                              : prev,
                          )
                        }
                        placeholder="Coming from our socials?"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="popup-enabled"
                        checked={announcementSettings.isEnabled}
                        onCheckedChange={(checked) =>
                          setAnnouncementSettings((prev) =>
                            prev
                              ? { ...prev, isEnabled: checked === true }
                              : prev,
                          )
                        }
                      />
                      <Label
                        htmlFor="popup-enabled"
                        className="text-sm text-gray-600 dark:text-gray-300"
                      >
                        Show popup to new visitors
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popup-message">Message</Label>
                    <Textarea
                      id="popup-message"
                      value={announcementSettings.message}
                      onChange={(event) =>
                        setAnnouncementSettings((prev) =>
                          prev
                            ? { ...prev, message: event.target.value }
                            : prev,
                        )
                      }
                      rows={3}
                      placeholder="Let students know what to do next..."
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="popup-image">Poster image URL</Label>
                      <Input
                        id="popup-image"
                        value={announcementSettings.imageUrl}
                        onChange={(event) =>
                          setAnnouncementSettings((prev) =>
                            prev
                              ? { ...prev, imageUrl: event.target.value }
                              : prev,
                          )
                        }
                        placeholder="https://..."
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Use a hosted image or poster to tease the opportunity.
                      </p>
                    </div>
                    <div className="flex items-center justify-center rounded-2xl border border-dashed border-emerald-200/70 bg-emerald-50/40 p-4 dark:border-emerald-700/50 dark:bg-emerald-900/20">
                      <div className="relative h-32 w-full max-w-[180px] overflow-hidden rounded-xl">
                        <Image
                          src={
                            announcementSettings.imageUrl?.trim() ||
                            "/images/TPD.png"
                          }
                          alt="Popup preview"
                          fill
                          className="object-cover"
                          sizes="180px"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popup-signup-link">Sign up link</Label>
                    <Input
                      id="popup-signup-link"
                      value={announcementSettings.primaryCtaUrl}
                      onChange={(event) =>
                        setAnnouncementSettings((prev) =>
                          prev
                            ? { ...prev, primaryCtaUrl: event.target.value }
                            : prev,
                        )
                      }
                      placeholder="https://"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Controls the glowing green “Sign up” button. Secondary button is locked to the opportunities page.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <Button
                      onClick={handleAnnouncementSave}
                      disabled={announcementSaving}
                    >
                      {announcementSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save popup"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Unable to load popup settings.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pending Approval ({pendingData?.stats.totalPending || 0})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Recently Rejected
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6">
              {pendingData?.stats.totalPending === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No pending submissions to review at the moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {(pendingData?.pending.competitions?.length || 0) > 0 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-blue-500" />
                        Pending Competitions (
                        {pendingData?.pending.competitions?.length || 0})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {pendingData?.pending.competitions?.map(
                          (competition) => (
                            <CompetitionCard
                              key={competition._id}
                              competition={competition}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {(pendingData?.pending.businessOpportunities?.length || 0) >
                    0 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Building className="h-6 w-6 text-green-500" />
                        Pending Business Opportunities (
                        {pendingData?.pending.businessOpportunities?.length ||
                          0}
                        )
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingData?.pending.businessOpportunities?.map(
                          (opportunity) => (
                            <BusinessOpportunityCard
                              key={opportunity._id}
                              opportunity={opportunity}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-6">
              {(pendingData?.rejected.competitions?.length || 0) === 0 &&
              (pendingData?.rejected.businessOpportunities?.length || 0) ===
                0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No rejected items
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No recently rejected submissions to show.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {(pendingData?.rejected.competitions?.length || 0) > 0 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-blue-500" />
                        Rejected Competitions (
                        {pendingData?.rejected.competitions?.length || 0})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {pendingData?.rejected.competitions?.map(
                          (competition) => (
                            <CompetitionCard
                              key={competition._id}
                              competition={competition}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {(pendingData?.rejected.businessOpportunities?.length || 0) >
                    0 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Building className="h-6 w-6 text-green-500" />
                        Rejected Business Opportunities (
                        {pendingData?.rejected.businessOpportunities?.length ||
                          0}
                        )
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingData?.rejected.businessOpportunities?.map(
                          (opportunity) => (
                            <BusinessOpportunityCard
                              key={opportunity._id}
                              opportunity={opportunity}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this{" "}
              {selectedItem && "category" in selectedItem
                ? "competition"
                : "business opportunity"}
              . This will help the organizer understand what needs to be
              improved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why this submission is being rejected..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={
                !rejectionReason.trim() ||
                (selectedItem ? processingItems.has(selectedItem._id) : false)
              }
            >
              {selectedItem && processingItems.has(selectedItem._id) ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Reject Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
