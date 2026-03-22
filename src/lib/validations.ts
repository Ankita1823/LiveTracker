import { z } from 'zod';

// Project Schemas
export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  techStack: z.string().min(1, 'Tech stack is required'),
  tags: z.string().min(1, 'At least one tag is required'),
  status: z.enum(['Idea', 'Building', 'Shipped', 'Paused']),
  links: z.string().optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// Entry Schemas
export const entrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().or(z.date()).optional(),
  notes: z.string().min(1, 'Notes are required'),
  tags: z.string().min(1, 'At least one tag is required'),
  projectId: z.string().optional().nullable(),
});

export type EntryInput = z.infer<typeof entrySchema>;

// Resource Schemas
export const resourceSchema = z.object({
  url: z.string().url('Invalid URL'),
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  notes: z.string().optional(),
  tags: z.string().min(1, 'At least one tag is required'),
  isRead: z.boolean(),
  isFavorite: z.boolean(),
  projectId: z.string().optional().nullable(),
  entryId: z.string().optional().nullable(),
});

export type ResourceInput = z.infer<typeof resourceSchema>;
