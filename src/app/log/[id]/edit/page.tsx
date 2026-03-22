'use client';

import { LogForm } from '@/components/log/LogForm';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';
import { Entry, EntryInput } from '@/types';

export default function EditEntryPage() {
  const { id } = useParams();
  
  const { data: entry, isLoading } = useQuery<Entry>({
    queryKey: ['entry', id],
    queryFn: () => fetch(`/api/entries/${id}`).then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!entry) return <div>Entry not found</div>;

  const entryInput: EntryInput & { id: string } = {
    ...entry,
    projectId: entry.projectId || undefined,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <Link 
          href={`/log/${id}`} 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to entry detail</span>
        </Link>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Edit Log Entry
        </h1>
        <p className="text-slate-500">Refining your learning records.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <LogForm initialData={entryInput} />
      </div>
    </div>
  );
}
