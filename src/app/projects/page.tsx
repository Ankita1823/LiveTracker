'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, Search, ExternalLink, Tag as TagIcon, Filter, Layers } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatTags } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { ProjectWithRelations } from '@/types';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const { data: projects, isLoading } = useQuery<ProjectWithRelations[]>({
    queryKey: ['projects'],
    queryFn: () => fetch('/api/projects').then((res) => res.json()),
  });

  const filteredProjects = projects?.filter((project) => 
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    (project.tags && project.tags.toLowerCase().includes(search.toLowerCase())) ||
    (project.techStack && project.techStack.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Idea': return 'info';
      case 'Building': return 'warning';
      case 'Shipped': return 'success';
      case 'Paused': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h2>
          <p className="text-slate-500">Managing the chaos of creation.</p>
        </div>
        <Link 
          href="/projects/new" 
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/10"
        >
          <Plus size={18} />
          <span>New Project</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, tech stack or tags..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm border-l border-slate-200 pl-4 h-8 hidden md:flex">
          <Filter size={16} />
          <span>{filteredProjects?.length ?? 0} projects found</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects?.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-900/5 transition-all group overflow-hidden">
                <CardHeader className="p-0 border-none relative h-32 bg-slate-900 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Layers size={40} className="text-white/20" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant={getStatusVariant(project.status) as any}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-slate-500 line-clamp-2 text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex flex-wrap gap-1.5">
                      {formatTags(project.techStack).map((tech) => (
                        <span key={tech} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-1">
                        <TagIcon size={12} />
                        {formatTags(project.tags).slice(0, 2).join(', ')}
                        {formatTags(project.tags).length > 2 && '...'}
                      </div>
                      {project.links && (
                        <ExternalLink size={14} className="text-slate-300" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {filteredProjects?.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Layers size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No projects found</h3>
              <p className="text-slate-500">Time to start something new!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
