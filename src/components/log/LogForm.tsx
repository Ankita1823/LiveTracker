'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { entrySchema, EntryInput } from '@/lib/validations';
import { toast } from 'react-hot-toast';
import { Project } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface LogFormProps {
  initialData?: EntryInput & { id: string };
  onSuccess?: () => void;
}

export function LogForm({ initialData, onSuccess }: LogFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => fetch('/api/projects').then((res) => res.json()),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: initialData ? {
      ...initialData,
      date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    } : {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: EntryInput) => {
      const url = initialData 
        ? `/api/entries/${initialData.id}` 
        : '/api/entries';
      const method = initialData ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Failed to save log entry');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      toast.success(initialData ? 'Entry updated' : 'Entry created');
      if (onSuccess) onSuccess();
      else router.push('/log');
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      <div className="space-y-1">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Title</label>
        <input 
          {...register('title')}
          placeholder="e.g. Today I learned..."
          className={cn(
            "w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all",
            errors.title ? "border-rose-300" : "border-slate-200"
          )}
        />
        {errors.title && <p className="text-xs text-rose-500 font-medium">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Date</label>
          <input 
            {...register('date')}
            type="date"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Project (Optional)</label>
          <select 
            {...register('projectId')}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          >
            <option value="">None</option>
            {projects?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Notes (Markdown)</label>
        <textarea 
          {...register('notes')}
          placeholder="Share your progress and insights..."
          rows={10}
          className={cn(
            "w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none font-mono text-sm",
            errors.notes ? "border-rose-300" : "border-slate-200"
          )}
        />
        {errors.notes && <p className="text-xs text-rose-500 font-medium">{errors.notes.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tags</label>
        <input 
          {...register('tags')}
          placeholder="Next.js, UI, Backend"
          className={cn(
            "w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all",
            errors.tags ? "border-rose-300" : "border-slate-200"
          )}
        />
        {errors.tags && <p className="text-xs text-rose-500 font-medium">{errors.tags.message}</p>}
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/10"
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Entry' : 'Create Entry')}
        </button>
      </div>
    </form>
  );
}
