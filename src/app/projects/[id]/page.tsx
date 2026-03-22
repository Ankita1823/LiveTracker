'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Tag as TagIcon, 
  Trash2, 
  Edit2, 
  Bookmark,
  ExternalLink,
  Layers,
  BookOpen,
  Plus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatTags } from '@/lib/utils';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ProjectWithRelations, ResourceWithRelations } from '@/types';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery<ProjectWithRelations>({
    queryKey: ['project', id],
    queryFn: () => fetch(`/api/projects/${id}`).then((res) => res.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/projects/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
      router.push('/projects');
    },
    onError: () => toast.error('Failed to delete project'),
  });

  const { data: allResources } = useQuery<ResourceWithRelations[]>({
    queryKey: ['resources'],
    queryFn: () => fetch('/api/resources').then((res) => res.json()),
    enabled: !!project,
  });

  if (isLoading) {
    return <DetailLoading />;
  }

  if (!project) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-xl font-bold">Project not found</h3>
        <Link href="/projects" className="text-emerald-500 hover:underline mt-4 inline-block">
          Back to projects
        </Link>
      </div>
    );
  }

  const projectTags = formatTags(project.tags).map(t => t.toLowerCase());
  const projectTech = formatTags(project.techStack).map(t => t.toLowerCase());
  
  const recommendedResources = allResources?.filter(r => {
    // Exclude already linked resources
    if (project.resources.some(pr => pr.id === r.id)) return false;
    
    const resourceTags = formatTags(r.tags).map(t => t.toLowerCase());
    return resourceTags.some(rt => projectTags.includes(rt) || projectTech.includes(rt));
  }).slice(0, 3);

  const getStatusVariant = (status: string): 'info' | 'warning' | 'success' | 'error' | 'default' => {
    switch (status) {
      case 'Idea': return 'info';
      case 'Building': return 'warning';
      case 'Shipped': return 'success';
      case 'Paused': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to projects</span>
        </Link>
        <div className="flex gap-2">
          <Link 
            href={`/projects/${id}/edit`}
            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <Edit2 size={20} />
          </Link>
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to delete this project?')) {
                deleteMutation.mutate();
              }
            }}
            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <div className="h-4 bg-gradient-to-r from-emerald-500 to-blue-500" />
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(project.status)} className="uppercase tracking-wider">
                      {project.status}
                    </Badge>
                    <span className="text-slate-400">•</span>
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">
                      Created {formatDate(project.createdAt)}
                    </div>
                  </div>
                  
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {project.name}
                  </h1>
                  
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {project.description}
                  </p>

                  {project.links && (
                    <div className="flex gap-4">
                      {project.links.split(',').map(link => (
                        <a 
                          key={link}
                          href={link.trim()} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline"
                        >
                          <ExternalLink size={16} />
                          {link.includes('github') ? 'GitHub' : 'Live Demo'}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen size={20} className="text-emerald-500" />
                Project Logs
              </h3>
              <Link 
                href="/log/new"
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus size={16} />
                Add Log
              </Link>
            </div>
            
            {project.entries.length > 0 ? (
              <div className="space-y-4">
                {project.entries.map(entry => (
                  <Link key={entry.id} href={`/log/${entry.id}`}>
                    <Card className="hover:border-emerald-300 transition-all group">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {entry.title}
                          </h4>
                          <p className="text-xs text-slate-400">{formatDate(entry.date)}</p>
                        </div>
                        <ArrowLeft className="rotate-180 text-slate-300 group-hover:text-emerald-500 transition-all" size={18} />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-200">
                <p className="text-slate-500 text-sm">No log entries linked to this project yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {formatTags(project.techStack).map((tech) => (
                  <div 
                    key={tech} 
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {formatTags(project.tags).map((tag) => (
                  <div 
                    key={tag} 
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium"
                  >
                    <TagIcon size={14} className="text-slate-400" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Bookmark size={20} className="text-amber-500" />
              Resources
            </h3>
            {project.resources.length > 0 ? (
              <div className="grid gap-3">
                {project.resources.map((resource) => (
                  <Card key={resource.id} className="p-3 hover:border-amber-400 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                          <Bookmark size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {resource.title}
                        </h4>
                      </div>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 text-slate-300 hover:text-amber-600 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No resources attached.</p>
            )}
          </div>

          {recommendedResources && recommendedResources.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Plus size={14} />
                Recommended
              </h3>
              <div className="grid gap-3">
                {recommendedResources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between group/rec">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Bookmark size={14} className="text-slate-300 flex-shrink-0" />
                      <h4 className="text-xs font-medium text-slate-500 truncate group-hover/rec:text-emerald-600 transition-colors">
                        {resource.title}
                      </h4>
                    </div>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-1 text-slate-300 hover:text-emerald-600 transition-colors flex-shrink-0"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Skeleton className="h-6 w-24" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
