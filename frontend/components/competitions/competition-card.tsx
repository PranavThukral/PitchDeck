import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Calendar,
  Trophy,
  Users,
  ExternalLink,
  DollarSign,
  Clock,
  MapPin,
} from "lucide-react";
import Link from "next/link";

// hi

interface Competition {
  id: string;
  title: string;
  organizer: string;
  logo: string;
  gradeTags: string[];
  deadline: string;
  prize: string;
  status: string;
  description: string;
  applicationType: string;
  applyUrl: string;
  frequency: string;
  dates: [string, string];
  location: string;
  cost: string;
  registrationOpens?: string;
}

interface CompetitionCardProps {
  competition: Competition;
  isFavourited?: boolean;
  onFavourite?: () => void;
}

const formatGradeTags = (tags: string[]): string => {
  if (!tags || tags.length === 0) return "All Grades";
  const gradeNumbers = tags
    .map((tag) => parseInt(tag.replace("grade ", "")))
    .filter((num) => !isNaN(num))
    .sort((a, b) => a - b);
  if (gradeNumbers.length === 0) {
    if (tags.includes("university") || tags.includes("college"))
      return "Post-Secondary";
    if (tags.some((t) => t.toLowerCase().includes("pre-secondary")))
      return "Pre-Secondary";
    return "Varies";
  }
  if (gradeNumbers.length === 1) return `Grade ${gradeNumbers[0]}`;
  const min = gradeNumbers[0];
  const max = gradeNumbers[gradeNumbers.length - 1];
  if (min === 9 && max === 12 && gradeNumbers.length === 4)
    return "Grades 9-12";
  if (min === 9 && max === 10 && gradeNumbers.length === 2)
    return "Grades 9-10";
  if (min === 11 && max === 12 && gradeNumbers.length === 2)
    return "Grades 11-12";
  return `Grades ${min}-${max}`;
};

export function CompetitionCard({ competition }: CompetitionCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closing-soon":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "closed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.toLowerCase().includes("tbd")) return "TBD";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getApplicationStatus = () => {
    return competition.applicationType === "external" ? "External" : "Internal";
  };

  const isClosed = competition.status === "closed";

  return (
    <>
      <Card
        className={`hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 py-0 ${isClosed ? "opacity-75 grayscale" : ""}`}
      >
        <CardHeader className="pb-4 pt-4 px-6 border-b border-green-200 dark:border-green-700 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
          <div className="flex items-center justify-between">
            <Badge
              className={`${getStatusColor(competition.status)} px-3 py-1 text-xs font-semibold`}
            >
              {competition.status.replace("-", " ").toUpperCase()}
            </Badge>
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                Deadline
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {formatDate(competition.deadline)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow space-y-4 p-6 bg-white dark:bg-gray-900">
          <div className="bg-green-50 dark:bg-green-900/50 p-3 rounded-lg border border-green-200 dark:border-green-700 h-20 flex items-center justify-center">
            <h3 className="font-bold text-lg text-center text-gray-900 dark:text-white leading-tight line-clamp-2">
              {competition.title}
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-green-300 dark:border-green-600 flex items-center justify-center min-h-[100px]">
            <div className="w-24 h-24 flex items-center justify-center">
              <img
                src={competition.logo || "/logos/placeholder.svg"}
                alt={`${competition.organizer} logo`}
                width="96"
                height="96"
                className="rounded-lg object-contain max-w-full max-h-full"
                loading="lazy"
              />
            </div>
          </div>
          {competition.description && (
            <blockquote className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-green-300 dark:border-green-600">
              <p className="italic text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {competition.description}
              </p>
            </blockquote>
          )}
          <div className="space-y-2 pt-2">
            <div className="flex items-center text-sm">
              <DollarSign className="h-4 w-4 mr-2 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                Cost:
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {competition.cost}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                Grades:
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {formatGradeTags(competition.gradeTags)}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                Frequency:
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {competition.frequency}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4 pb-4 mt-auto bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 border-t border-green-200 dark:border-green-700">
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-green-300 dark:border-green-600 text-[#19613F] dark:text-green-300 font-medium"
              onClick={(e) => {
                e.stopPropagation();
                setDialogOpen(true);
              }}
            >
              View Details
            </Button>
            <a
              href={competition.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 ${isClosed ? "pointer-events-none" : ""}`}
              onClick={(e) => {
                if (isClosed) e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg"
                disabled={isClosed}
              >
                {isClosed ? "Closed" : "Apply"}
                {!isClosed && <ExternalLink className="h-4 w-4 ml-1" />}
              </Button>
            </a>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl rounded-xl border-2 border-green-200 dark:border-green-700">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 h-8 w-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() => setDialogOpen(false)}
            aria-label="Close"
          >
            ×
          </Button>

          <div className="pb-6 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-t-xl -m-6 mb-6 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg p-2 flex-shrink-0">
                <img
                  src={competition.logo || "/logos/placeholder.svg"}
                  alt={`${competition.organizer} logo`}
                  width="64"
                  height="64"
                  className="rounded object-contain max-w-full max-h-full"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                  {competition.title}
                </h3>
                <p className="text-base font-medium text-[#19613F] dark:text-green-300">
                  {competition.organizer}
                </p>
                <Badge className={`${getStatusColor(competition.status)} mt-2`}>
                  {competition.status.replace("-", " ").toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6 -mt-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {competition.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-[#19613F] dark:text-green-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Eligibility
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {formatGradeTags(competition.gradeTags)}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Prizes
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {competition.prize}
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Cost
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {competition.cost}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Frequency
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {competition.frequency}
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Deadline
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {formatDate(competition.deadline)}
                </p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Location
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {competition.location}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Additional Details
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Competition Dates:
                  </span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {formatDate(competition.dates[0])} to{" "}
                    {formatDate(competition.dates[1])}
                  </span>
                </div>
                {competition.registrationOpens && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Registration:
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {competition.registrationOpens}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Application Type:
                  </span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {getApplicationStatus()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              {competition.applicationType === "internal" ? (
                <Link href={competition.applyUrl} className="block w-full">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 text-lg shadow-lg"
                    disabled={isClosed}
                  >
                    Apply Now
                  </Button>
                </Link>
              ) : (
                <a
                  href={competition.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 text-lg shadow-lg"
                    disabled={isClosed}
                  >
                    Apply Now
                    <ExternalLink className="h-5 w-5 ml-2" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
