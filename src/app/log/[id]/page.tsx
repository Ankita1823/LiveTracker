'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Calendar, 
  Tag as TagIcon, 
  Trash2, 
  Edit2, 
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatTags } from '@/lib/utils';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { EntryWithRelations } from '@/types';

export default function EntryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: entry, isLoading } = useQuery<EntryWithRelations>({
    queryKey: ['entry', id],
    queryFn: () => fetch(`/api/entries/${id}`).then((res) => res.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/entries/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      toast.success('Entry deleted successfully');
      router.push('/log');
    },
    onError: () => toast.error('Failed to delete entry'),
  });

  const { data: allEntries } = useQuery<EntryWithRelations[]>({
    queryKey: ['entries'],
    queryFn: () => fetch('/api/entries').then((res) => res.json()),
    enabled: !!entry,
  });

  if (isLoading) {
    return <DetailLoading />;
  }

  if (!entry) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-xl font-bold">Entry not found</h3>
        <Link href="/log" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to log
        </Link>
      </div>
    );
  }

  const entryTags = formatTags(entry.tags).map(t => t.toLowerCase());
  const relatedLogs = allEntries?.filter(e => {
    if (e.id === entry.id) return false;
    
    // Same project
    if (entry.projectId && e.projectId === entry.projectId) return true;
    
    // Same tags
    const otherTags = formatTags(e.tags).map(t => t.toLowerCase());
    return otherTags.some(ot => entryTags.includes(ot));
  }).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Link 
          href="/log" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to log</span>
        </Link>
        <div className="flex gap-2">
          <Link 
            href={`/log/${id}/edit`}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <Edit2 size={18} />
          </Link>
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to delete this entry?')) {
                deleteMutation.mutate();
              }
            }}
            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="info" className="uppercase tracking-wider">
            Log Entry
          </Badge>
          <span className="text-slate-400">•</span>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium uppercase tracking-wider">
            <Calendar size={14} />
            {formatDate(entry.date)}
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          {entry.title}
        </h1>
        
        {entry.project && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Project:</span>
            <Link 
              href={`/projects/${entry.project.id}`}
              className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              {entry.project.name}
              <ExternalLink size={12} />
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="shadow-lg shadow-slate-200/50">
            <CardContent className="p-8 prose prose-slate max-w-none">
              <ReactMarkdown>{entry.notes}</ReactMarkdown>
            </CardContent>
          </Card>

          {entry.resources.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Bookmark size={20} className="text-blue-500" />
                Linked Resources
              </h3>
              <div className="grid gap-4">
                {entry.resources.map((resource) => (
                  <Card key={resource.id} className="p-4 hover:border-blue-400 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                          <Bookmark size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {resource.title}
                          </h4>
                          <p className="text-xs text-slate-400">{resource.category}</p>
                        </div>
                      </div>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {formatTags(entry.tags).map((tag) => (
                <div 
                  key={tag} 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium"
                >
                  <TagIcon size={14} className="text-slate-400" />
                  {tag}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Last Updated
            </h3>
            <p className="text-sm text-slate-600 font-medium">
              {formatDate(entry.updatedAt)}
            </p>
          </div>

          {relatedLogs && relatedLogs.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Related Entries
              </h3>
              <div className="grid gap-3">
                {relatedLogs.map((rel) => (
                  <Link key={rel.id} href={`/log/${rel.id}`}>
                    <div className="group/rel">
                      <h4 className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {rel.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        {formatDate(rel.date)}
                      </p>
                    </div>
                  </Link>
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
    <div className="max-w-4xl mx-auto space-y-8">
      <Skeleton className="h-6 w-24" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Skeleton className="lg:col-span-3 h-[500px] rounded-xl" />
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}
