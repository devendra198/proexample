import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  slug: z.string().optional().default(""),
  description: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  sortOrder: z.coerce.number().int().default(0),
});

export const technologySchema = z.object({
  name: z.string().min(1, "Technology name is required").max(100),
  slug: z.string().optional().default(""),
  categoryId: z.string().min(1, "Parent Category is required"),
  description: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  sortOrder: z.coerce.number().int().default(0),
});

export const projectLinkSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().min(1, "URL is required"),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(150),
  projectUrl: z.string().min(1, "Project URL is required"),
  categoryId: z.string().min(1, "Please select a category"),
  technologyId: z.string().min(1, "Please select a technology"),
  slug: z.string().optional().default(""),
  shortDescription: z.string().optional().default(""),
  description: z.string().optional().default(""),
  appStoreUrl: z.union([z.string(), z.literal(""), z.null()]).optional(),
  playStoreUrl: z.union([z.string(), z.literal(""), z.null()]).optional(),
  githubUrl: z.union([z.string(), z.literal(""), z.null()]).optional(),
  imageUrl: z.union([z.string(), z.literal(""), z.null()]).optional(),
  featured: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).default("ACTIVE"),
  sortOrder: z.coerce.number().int().default(0),
  links: z.array(projectLinkSchema).optional().default([]),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
