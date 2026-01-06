"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Calendar,
  DollarSign,
  ExternalLink,
  Heart,
  MapPin,
  Users,
} from "lucide-react";

interface BusinessOpportunity {
  id: string;
  title: string;
  organizer: string;
  logo: string;
  gradeTags: string[];
  startDate: string;
  endDate: string;
  cost: string;
  format: string;
  status: string;
  description: string;
  applicationType: string;
  applyUrl: string;
  category: string;
}

interface OpportunityCardProps {
  opportunity: BusinessOpportunity;
  isFavourited: boolean;
  onFavourite: () => void;
}

const formatGradeTags = (tags: string[]): string => {
    if (!tags || tags.length === 0) return "";
    const gradeNumbers = tags.map(tag => parseInt(tag.replace('grade ', ''))).filter(num => !isNaN(num)).sort((a, b) => a - b);
    if (gradeNumbers.length === 0) {
        if (tags.includes('university') || tags.includes('college')) return "Post-Secondary";
        if (tags.some(t => t.toLowerCase().includes('pre-secondary'))) return "Pre-Secondary";
        return tags.join(', ');
    }
    if (gradeNumbers.length === 1) return `Grade ${gradeNumbers[0]}`;
    const min = gradeNumbers[0];
    const max = gradeNumbers[gradeNumbers.length - 1];
    if (min === 9 && max === 12 && gradeNumbers.length === 4) return "Grades 9-12";
    return `Grades ${min}-${max}`;
};

const getStatusStyles = (status: string) => {
    switch (status) {
        case "open": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300/80";
        case "closing-soon": return "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300/80";
        case "upcoming": return "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border-sky-300/80";
        case "closed": return "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-300/80";
        default: return "bg-gray-100 text-gray-800 dark:bg-gray-700/60 dark:text-gray-200 border-gray-300/80";
    }
};

const InfoPill = ({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string | undefined | null;
}) => {
    if (!value || value.toLowerCase() === "tbd" || value.toLowerCase() === "does not specify") return null;
    const displayValue = `${label}: ${value}`;
    return (
        <div
            className="inline-flex items-center gap-2 rounded-full border border-emerald-100/70 bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100/90"
            title={displayValue}
        >
            <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
            <span className="text-emerald-700/90 dark:text-emerald-100/90">{label}:</span>
            <span className="text-gray-700 dark:text-emerald-50">{value}</span>
        </div>
    );
};

export function OpportunityCard({ opportunity, isFavourited, onFavourite }: OpportunityCardProps) {
    const isClosed = opportunity.status === 'closed';
    const formattedGrades = formatGradeTags(opportunity.gradeTags);

    // This is the new, simpler styling logic for the button
    const buttonClass = isClosed
      ? "w-full font-semibold group transition-all bg-gray-400/90 text-white hover:bg-gray-500 shadow-sm"
      : "w-full font-semibold group transition-all bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600 shadow-lg shadow-emerald-500/20";

    return (
        <Card className={`group relative flex flex-col h-full overflow-hidden rounded-2xl border border-emerald-200/60 bg-white/90 py-0 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:bg-[#0f1f2d]/85 ${isClosed ? 'opacity-70 grayscale' : 'hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-900/10'}`}>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/70 via-transparent to-emerald-100/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-emerald-900/30 dark:to-emerald-800/10" />

            <CardHeader className="relative z-10 flex flex-col gap-3 px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusStyles(opportunity.status)}`}>
                            {opportunity.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/40 dark:text-emerald-200">
                            {opportunity.category}
                        </Badge>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 flex-shrink-0 rounded-full border border-emerald-100/60 bg-white/70 shadow-sm transition hover:scale-105 hover:border-emerald-200 dark:border-emerald-800/60 dark:bg-emerald-950/40"
                        onClick={onFavourite}
                        aria-label={isFavourited ? "Remove favourite" : "Add to favourites"}
                    >
                        <Heart className={`h-5 w-5 transition-colors ${isFavourited ? "text-rose-500 fill-rose-500" : "text-emerald-300 dark:text-emerald-700 group-hover:text-rose-400"}`} />
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div
                        className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-emerald-100/70 bg-white shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/40"
                        style={{ padding: "6%" }}
                    >
                        <img
                            src={opportunity.logo}
                            alt={`${opportunity.organizer} logo`}
                            className="h-full w-full object-contain"
                            loading="lazy"
                        />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold leading-tight text-gray-900 dark:text-white line-clamp-2">
                            {opportunity.title}
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700/80 dark:text-emerald-200/80">
                            {opportunity.organizer}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 flex-grow px-4 pb-4 pt-2 space-y-4">
                <div className="rounded-2xl border border-emerald-100/60 bg-white/85 p-3 text-sm text-gray-600 leading-relaxed shadow-inner dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100/90">
                    <p className="line-clamp-4">{opportunity.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <InfoPill icon={Calendar} label="Starts" value={opportunity.startDate} />
                    <InfoPill icon={Calendar} label="Deadline" value={opportunity.endDate} />
                    <InfoPill icon={MapPin} label="Format" value={opportunity.format} />
                    <InfoPill icon={DollarSign} label="Cost" value={opportunity.cost} />
                    {formattedGrades && <InfoPill icon={Users} label="Grades" value={formattedGrades} />}
                </div>
            </CardContent>

            <CardFooter className="relative z-10 px-4 pb-4 pt-2">
                <a href={opportunity.applyUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className={buttonClass}>
                        Learn More
                        <ExternalLink className="h-4 w-4 ml-2 transform transition-transform group-hover:translate-x-1" />
                    </Button>
                </a>
            </CardFooter>
        </Card>
    );
}
//dummy
