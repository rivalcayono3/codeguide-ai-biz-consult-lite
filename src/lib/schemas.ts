import { z } from "zod";

export const businessInputSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  business_type: z.string().min(1, "Please select a business type"),
  budget: z.number().min(0, "Budget must be a positive number"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  other_criteria: z.record(z.any()).optional().default({}),
});

export const businessTypes = [
  "Restaurant / Food Service",
  "Retail / E-commerce",
  "Technology / Software",
  "Service Based Business",
  "Manufacturing",
  "Healthcare / Wellness",
  "Education / Training",
  "Entertainment / Media",
  "Real Estate",
  "Consulting",
  "Transportation / Logistics",
  "Construction",
  "Financial Services",
  "Beauty / Salon",
  "Fitness / Gym",
  "Other",
] as const;

export type BusinessInput = z.infer<typeof businessInputSchema>;
export type BusinessType = typeof businessTypes[number];