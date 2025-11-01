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
        case "open": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300";
        case "closing-soon": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300";
        case "upcoming": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300";
        case "closed": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300";
        default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300";
    }
};

const InfoItem = ({ icon: Icon, value }: { icon: React.ElementType, value: string | undefined | null }) => {
    if (!value || value.toLowerCase() === 'tbd' || value.toLowerCase() === 'does not specify') return null;
    return (
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{value}</span>
        </div>
    );
};

export function OpportunityCard({ opportunity, isFavourited, onFavourite }: OpportunityCardProps) {
    const isClosed = opportunity.status === 'closed';
    const formattedGrades = formatGradeTags(opportunity.gradeTags);

    // This is the new, simpler styling logic for the button
    const buttonClass = isClosed
      ? "w-full font-semibold group transition-colors bg-gray-400 dark:bg-gray-600 text-white hover:bg-green-500 dark:hover:bg-green-700"
      : "w-full font-semibold group transition-colors bg-green-600 hover:bg-green-700 text-white";

    return (
        <Card className={`group flex flex-col h-full rounded-xl overflow-hidden transition-all duration-300 ${isClosed ? 'opacity-70 grayscale' : 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-900/10'}`}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 flex-shrink-0 bg-white rounded-lg flex items-center justify-center border p-1">
                        <img
                            src={opportunity.logo}
                            alt={`${opportunity.organizer} logo`}
                            className="h-12 w-12 object-contain"
                            loading="lazy"
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                            {opportunity.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{opportunity.organizer}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onFavourite}>
                    <Heart className={`h-5 w-5 transition-colors ${isFavourited ? "text-red-500 fill-red-500" : "text-gray-300 dark:text-gray-600 group-hover:text-red-400"}`} />
                </Button>
            </CardHeader>

            <CardContent className="flex-grow p-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={`border font-semibold ${getStatusStyles(opportunity.status)}`}>
                        {opportunity.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="border bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300">
                        {opportunity.category}
                    </Badge>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                    {opportunity.description}
                </p>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <InfoItem icon={Calendar} value={opportunity.startDate} />
                        <InfoItem icon={Calendar} value={opportunity.endDate} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <InfoItem icon={MapPin} value={opportunity.format} />
                        <InfoItem icon={DollarSign} value={opportunity.cost} />
                    </div>
                    {formattedGrades && <InfoItem icon={Users} value={formattedGrades} />}
                </div>
            </CardContent>

            <CardFooter className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t">
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