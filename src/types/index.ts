import { Project, Entry, Resource } from '@prisma/client';
import { ProjectInput, EntryInput, ResourceInput } from '@/lib/validations';

export type { Project, Entry, Resource, ProjectInput, EntryInput, ResourceInput };

export type ProjectWithRelations = Project & {
  entries: Entry[];
  resources: Resource[];
};

export type EntryWithRelations = Entry & {
  project?: Project | null;
  resources: Resource[];
};

export type ResourceWithRelations = Resource & {
  project?: Project | null;
  entries: Entry[];
};

export type DashboardStats = {
  totalEntries: number;
  totalProjects: number;
  totalResources: number;
  streak: number;
  activityData: { date: string; count: number }[];
  topTags: { tag: string; count: number }[];
};
