'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resourceSchema, ResourceInput } from '@/lib/validations';
import { toast } from 'react-hot-toast';
import { ResourceWithRelations, Project, Entry } from '@/types';
import { cn } from '@/lib/utils';

interface ResourceFormProps {
  initialData?: ResourceWithRelations;
  onSuccess: () => void;
}

export function ResourceForm({ initialData, onSuccess }: ResourceFormProps) {
  const queryClient = useQueryClient();
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => fetch('/api/projects').then((res) => res.json()),
  });

  const { data: entries } = useQuery<Entry[]>({
    queryKey: ['entries'],
    queryFn: () => fetch('/api/entries').then((res) => res.json()),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResourceInput & { entryId?: string }>({
    resolver: zodResolver(resourceSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      url: initialData.url,
      category: initialData.category,
      notes: initialData.notes || "",
      tags: initialData.tags,
      isRead: initialData.isRead,
      isFavorite: initialData.isFavorite,
      projectId: initialData.projectId || "",
      entryId: initialData.entries?.[0]?.id || "",
    } : {
      isRead: false,
      isFavorite: false,
      projectId: "",
      entryId: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ResourceInput) => {
      const url = initialData 
        ? `/api/resources/${initialData.id}` 
        : '/api/resources';
      const method = initialData ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Failed to save resource');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success(initialData ? 'Resource updated' : 'Resource created');
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-700">Title</label>
        <input 
          {...register('title')}
          placeholder="Resource Title"
          className={cn(
            "w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition-all",
            errors.title ? "border-rose-300" : "border-slate-200"
          )}
        />
        {errors.title && <p className="text-xs text-rose-500 font-medium">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-700">URL</label>
        <input 
          {...register('url')}
          placeholder="https://..."
          className={cn(
            "w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition-all",
            errors.url ? "border-rose-300" : "border-slate-200"
          )}
        />
        {errors.url && <p className="text-xs text-rose-500 font-medium">{errors.url.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Category</label>
          <input 
            {...register('category')}
            placeholder="e.g. Design, Backend"
            className={cn(
              "w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition-all",
              errors.category ? "border-rose-300" : "border-slate-200"
            )}
          />
          {errors.category && <p className="text-xs text-rose-500 font-medium">{errors.category.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Project (Optional)</label>
          <select 
            {...register('projectId')}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
          >
            <option value="">None</option>
            {projects?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Entry (Optional)</label>
          <select 
            {...register('entryId')}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
          >
            <option value="">None</option>
            {entries?.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-700">Tags (comma separated)</label>
        <input 
          {...register('tags')}
          placeholder="tag1, tag2"
          className={cn(
            "w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition-all",
            errors.tags ? "border-rose-300" : "border-slate-200"
          )}
        />
        {errors.tags && <p className="text-xs text-rose-500 font-medium">{errors.tags.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-700">Notes (Optional)</label>
        <textarea 
          {...register('notes')}
          rows={3}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2 rounded-lg font-bold transition-all shadow-lg shadow-amber-900/10"
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Resource' : 'Add Resource')}
        </button>
      </div>
    </form>
  );
}
