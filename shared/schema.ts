import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define social media platform schema
export const SocialMediaPlatformSchema = z.enum([
  "LinkedIn",
  "Twitter",
  "Instagram",
  "Facebook",
  "GitHub",
  "YouTube",
  "TikTok",
  "Pinterest",
  "Reddit",
  "Snapchat",
  "Other"
]);

export type SocialMediaPlatform = z.infer<typeof SocialMediaPlatformSchema>;

export const SocialMediaSchema = z.object({
  platform: SocialMediaPlatformSchema,
  url: z.string().url("Please enter a valid URL"),
});

export type SocialMedia = z.infer<typeof SocialMediaSchema>;

// Define template schema
export const TemplateSchema = z.enum([
  "Classic",
  "Modern",
  "Vibrant",
  "Fresh",
  "Minimal"
]);

export type Template = z.infer<typeof TemplateSchema>;

// Define business card schema
export const businessCards = pgTable("business_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  deviceId: text("device_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  socialMedia: jsonb("social_media").$type<SocialMedia[]>(),
  template: text("template").notNull().default("Classic"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBusinessCardSchema = createInsertSchema(businessCards)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    socialMedia: z.array(SocialMediaSchema).optional(),
  });

export type InsertBusinessCard = z.infer<typeof insertBusinessCardSchema>;
export type BusinessCard = typeof businessCards.$inferSelect;

// Form validation schema with more specific validation rules
export const businessCardFormSchema = insertBusinessCardSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  bio: z.string().max(200, "Bio must be under 200 characters").optional(),
});
