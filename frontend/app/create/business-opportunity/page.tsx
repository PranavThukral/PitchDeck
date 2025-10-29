"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, Calendar, DollarSign, MapPin, Phone, Globe, Tag, Loader2, ArrowLeft, Briefcase } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Navigation } from "@/components/layout/navigation";

export default function CreateBusinessOpportunityPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    logo: "",
    type: "",
    location: "",
    remote: false,
    deadline: "",
    description: "",
    requirements: "",
    compensation: "",
    duration: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    applyUrl: "",
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch("/api/business-opportunities/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          company: formData.company,
          logo: formData.logo || undefined,
          type: formData.type,
          location: formData.location,
          remote: formData.remote,
          deadline: formData.deadline,
          description: formData.description,
          requirements: formData.requirements,
          compensation: formData.compensation || undefined,
          duration: formData.duration || undefined,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || undefined,
          website: formData.website || undefined,
          applyUrl: formData.applyUrl || undefined,
          tags: tagsArray,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Business opportunity submitted for approval! You'll be notified once it's reviewed.");
        router.push("/dashboard/organizer");
      } else {
        toast.error(data.message || "Failed to create business opportunity. Please try again.");
      }
    } catch (error) {
      console.error("Business opportunity creation error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      remote: checked,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/organizer"
              className="inline-flex items-center text-[#19613F] hover:text-[#2CA15F] dark:text-[#2CA15F] dark:hover:text-[#3dd67f] transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">
                  Create Business Opportunity
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Submit your business opportunity for admin approval
                </p>
              </div>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Opportunity Details</span>
              </CardTitle>
              <CardDescription>
                Fill out all the details about your business opportunity. Once submitted, it will be reviewed by our admin team before going live.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Opportunity Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Summer Marketing Internship 2024"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g., Tech Innovations Inc."
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo URL (PNG only)</Label>
                  <Input
                    id="logo"
                    name="logo"
                    type="url"
                    value={formData.logo}
                    onChange={handleInputChange}
                    placeholder="https://example.com/company-logo.png"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-500">
                    Optional: Provide a direct link to your company logo (must end with .png)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the opportunity, what the role involves, company culture, and what participants can expect to learn..."
                    rows={4}
                    required
                    disabled={isLoading}
                    className="resize-none"
                  />
                </div>

                {/* Opportunity Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Opportunity Type *</Label>
                    <Select
                      disabled={isLoading}
                      onValueChange={(value) => handleSelectChange("type", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select opportunity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="job">Job</SelectItem>
                        <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 12 weeks, 6 months, Full-time"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Location and Remote */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Toronto, ON or San Francisco, CA"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="remote"
                      checked={formData.remote}
                      onCheckedChange={handleCheckboxChange}
                      disabled={isLoading}
                    />
                    <Label htmlFor="remote">Remote work available</Label>
                  </div>
                </div>

                {/* Dates and Compensation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline *</Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compensation">Compensation</Label>
                    <Input
                      id="compensation"
                      name="compensation"
                      value={formData.compensation}
                      onChange={handleInputChange}
                      placeholder="e.g., $25/hour, $50,000/year, Unpaid + Learning Credits"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="List the requirements, qualifications, skills, or experience needed for this opportunity..."
                    rows={4}
                    required
                    disabled={isLoading}
                    className="resize-none"
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="hr@company.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Website and Application */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="website">Company Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://company-website.com"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applyUrl">Application URL</Label>
                    <Input
                      id="applyUrl"
                      name="applyUrl"
                      type="url"
                      value={formData.applyUrl}
                      onChange={handleInputChange}
                      placeholder="https://company.com/apply"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="marketing, technology, startup, remote, paid (comma-separated)"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-500">
                    Add up to 10 tags to help students find your opportunity
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Briefcase className="mr-2 h-4 w-4" />
                        Submit Opportunity
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
