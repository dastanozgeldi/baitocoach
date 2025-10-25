"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const JOB_TYPES = [
  "Konbini",
  "Restaurant",
  "Warehouse",
  "Delivery",
  "Cleaning",
  "Other",
] as const;

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const TIME_PREFERENCES = [
  "Morning (6am-12pm)",
  "Afternoon (12pm-6pm)",
  "Evening (6pm-10pm)",
  "Late Night (10pm-6am)",
] as const;

const JAPANESE_LEVELS = ["Beginner", "N5", "N4", "N3"] as const;

const CONTACT_METHODS = ["Phone", "Email"] as const;

export function OnboardingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nameRomaji: "",
    nationality: "",
    studentStatus: "",
    jobTypeInterested: "",
    daysAvailable: [] as string[],
    hoursPerWeek: "",
    timePreference: [] as string[],
    hasExperience: "no",
    experienceDescription: "",
    japaneseLevel: "",
    dietaryRestrictions: "",
    preferredContactMethod: "",
    contactDetails: "",
  });

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      daysAvailable: prev.daysAvailable.includes(day)
        ? prev.daysAvailable.filter((d) => d !== day)
        : [...prev.daysAvailable, day],
    }));
  };

  const handleTimeToggle = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      timePreference: prev.timePreference.includes(time)
        ? prev.timePreference.filter((t) => t !== time)
        : [...prev.timePreference, time],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.nameRomaji.trim()) {
        throw new Error("Name is required");
      }
      if (!formData.nationality.trim()) {
        throw new Error("Nationality is required");
      }
      if (!formData.studentStatus.trim()) {
        throw new Error("Student status is required");
      }
      if (!formData.jobTypeInterested) {
        throw new Error("Job type is required");
      }
      if (formData.daysAvailable.length === 0) {
        throw new Error("Please select at least one available day");
      }
      if (!formData.hoursPerWeek || parseInt(formData.hoursPerWeek) <= 0) {
        throw new Error("Hours per week must be greater than 0");
      }
      if (formData.timePreference.length === 0) {
        throw new Error("Please select at least one time preference");
      }
      if (!formData.japaneseLevel) {
        throw new Error("Japanese level is required");
      }
      if (!formData.preferredContactMethod) {
        throw new Error("Preferred contact method is required");
      }
      if (!formData.contactDetails.trim()) {
        throw new Error("Contact details are required");
      }

      const response = await fetch("/api/user-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          hoursPerWeek: parseInt(formData.hoursPerWeek),
          hasExperience: formData.hasExperience === "yes",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save onboarding information");
      }

      router.push("/call");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Welcome to BaitoCoach!</CardTitle>
        <CardDescription>
          Let&apos;s get to know you better so we can help you find the perfect part-time job in Japan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nameRomaji">Name (Romaji) *</Label>
              <Input
                id="nameRomaji"
                value={formData.nameRomaji}
                onChange={(e) =>
                  setFormData({ ...formData, nameRomaji: e.target.value })
                }
                placeholder="Tanaka Taro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality *</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
                placeholder="e.g., Vietnamese, Nepalese, Chinese"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentStatus">Student Status *</Label>
              <Input
                id="studentStatus"
                value={formData.studentStatus}
                onChange={(e) =>
                  setFormData({ ...formData, studentStatus: e.target.value })
                }
                placeholder="e.g., University, Language School, Vocational School"
                required
              />
            </div>
          </div>

          {/* Job Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Preferences</h3>
            
            <div className="space-y-2">
              <Label htmlFor="jobType">What type of job are you interested in? *</Label>
              <Select
                value={formData.jobTypeInterested}
                onValueChange={(value) =>
                  setFormData({ ...formData, jobTypeInterested: value })
                }
              >
                <SelectTrigger id="jobType">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Availability</h3>
            
            <div className="space-y-2">
              <Label>Days Available *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={formData.daysAvailable.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label htmlFor={day} className="font-normal cursor-pointer">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursPerWeek">Hours Per Week *</Label>
              <Input
                id="hoursPerWeek"
                type="number"
                min="1"
                max="168"
                value={formData.hoursPerWeek}
                onChange={(e) =>
                  setFormData({ ...formData, hoursPerWeek: e.target.value })
                }
                placeholder="e.g., 20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Time Preference *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TIME_PREFERENCES.map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={time}
                      checked={formData.timePreference.includes(time)}
                      onCheckedChange={() => handleTimeToggle(time)}
                    />
                    <Label htmlFor={time} className="font-normal cursor-pointer">
                      {time}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Experience</h3>
            
            <div className="space-y-2">
              <Label>Do you have experience in this type of job? *</Label>
              <RadioGroup
                value={formData.hasExperience}
                onValueChange={(value) =>
                  setFormData({ ...formData, hasExperience: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="exp-yes" />
                  <Label htmlFor="exp-yes" className="font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="exp-no" />
                  <Label htmlFor="exp-no" className="font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.hasExperience === "yes" && (
              <div className="space-y-2">
                <Label htmlFor="experienceDescription">
                  Please describe your experience
                </Label>
                <Textarea
                  id="experienceDescription"
                  value={formData.experienceDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experienceDescription: e.target.value,
                    })
                  }
                  placeholder="Tell us about your previous experience in this field..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Language & Additional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Language & Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="japaneseLevel">Japanese Level *</Label>
              <Select
                value={formData.japaneseLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, japaneseLevel: value })
                }
              >
                <SelectTrigger id="japaneseLevel">
                  <SelectValue placeholder="Select your Japanese level" />
                </SelectTrigger>
                <SelectContent>
                  {JAPANESE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietaryRestrictions">
                Dietary Restrictions or Physical Limitations
              </Label>
              <Textarea
                id="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dietaryRestrictions: e.target.value,
                  })
                }
                placeholder="e.g., Halal, vegetarian, cannot lift heavy objects..."
                rows={2}
              />
              <p className="text-sm text-muted-foreground">
                This helps us match you with suitable restaurant or physical jobs
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="space-y-2">
              <Label>Preferred Contact Method *</Label>
              <RadioGroup
                value={formData.preferredContactMethod}
                onValueChange={(value) =>
                  setFormData({ ...formData, preferredContactMethod: value })
                }
              >
                {CONTACT_METHODS.map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={method.toLowerCase()}
                      id={`contact-${method.toLowerCase()}`}
                    />
                    <Label
                      htmlFor={`contact-${method.toLowerCase()}`}
                      className="font-normal cursor-pointer"
                    >
                      {method}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactDetails">
                {formData.preferredContactMethod === "phone"
                  ? "Phone Number *"
                  : "Email Address *"}
              </Label>
              <Input
                id="contactDetails"
                type={formData.preferredContactMethod === "phone" ? "tel" : "email"}
                value={formData.contactDetails}
                onChange={(e) =>
                  setFormData({ ...formData, contactDetails: e.target.value })
                }
                placeholder={
                  formData.preferredContactMethod === "phone"
                    ? "e.g., 080-1234-5678"
                    : "e.g., your.email@example.com"
                }
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Complete Onboarding"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

