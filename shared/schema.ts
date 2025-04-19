import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define role enum
export const roleEnum = pgEnum('role', ['user', 'admin']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    email: z.string().email("Invalid email address"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = Omit<z.infer<typeof insertUserSchema>, "confirmPassword">;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

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

// Define public links for business cards
export const publicLinks = pgTable("public_links", {
  id: serial("id").primaryKey(),
  businessCardId: integer("business_card_id").references(() => businessCards.id).notNull(),
  uniqueSlug: text("unique_slug").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPublicLinkSchema = createInsertSchema(publicLinks)
  .omit({ id: true, viewCount: true, createdAt: true });

export type InsertPublicLink = z.infer<typeof insertPublicLinkSchema>;
export type PublicLink = typeof publicLinks.$inferSelect;
