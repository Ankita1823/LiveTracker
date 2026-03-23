'use client';

import { ProjectForm } from '@/components/projects/ProjectForm';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';
import { Project, ProjectInput } from '@/types';

export default function EditProjectPage() {
  const { id } = useParams();
  
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: () => fetch(`/api/projects/${id}`).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch project');
      return res.json();
    }),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  const projectInput: ProjectInput & { id: string } = {
    ...project,
    status: project.status as 'Idea' | 'Building' | 'Shipped' | 'Paused',
    links: project.links || undefined,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-4">
        <Link 
          href={`/projects/${id}`} 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to project detail</span>
        </Link>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Edit Project
        </h1>
        <p className="text-slate-500">Refining your project details.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <ProjectForm initialData={projectInput} />
      </div>
    </div>
  );
}
