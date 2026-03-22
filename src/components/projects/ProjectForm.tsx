'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, ProjectInput } from '@/lib/validations';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ProjectFormProps {
  initialData?: ProjectInput & { id: string };
  onSuccess?: () => void;
}

export function ProjectForm({ initialData, onSuccess }: ProjectFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || {
      status: 'Idea',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProjectInput) => {
      const url = initialData 
        ? `/api/projects/${initialData.id}` 
        : '/api/projects';
      const method = initialData ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Failed to save project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(initialData ? 'Project updated' : 'Project created');
      if (onSuccess) onSuccess();
      else router.push('/projects');
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      <div className="space-y-1">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Project Name</label>
        <input 
          {...register('name')}
          placeholder="e.g. Awesome App"
          className={cn(
            "w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all",
            errors.name ? "border-rose-300" : "border-slate-200"
          )}
        />
        {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Description</label>
        <textarea 
          {...register('description')}
          placeholder="What are you building?"
          rows={3}
          className={cn(
            "w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none",
            errors.description ? "border-rose-300" : "border-slate-200"
          )}
        />
        {errors.description && <p className="text-xs text-rose-500 font-medium">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Status</label>
          <select 
            {...register('status')}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
          >
            <option value="Idea">💡 Idea</option>
            <option value="Building">🏗️ Building</option>
            <option value="Shipped">🚀 Shipped</option>
            <option value="Paused">⏸️ Paused</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tech Stack</label>
          <input 
            {...register('techStack')}
            placeholder="Next.js, Tailwind, Prisma"
            className={cn(
              "w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all",
              errors.techStack ? "border-rose-300" : "border-slate-200"
            )}
          />
          {errors.techStack && <p className="text-xs text-rose-500 font-medium">{errors.techStack.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tags</label>
        <input 
          {...register('tags')}
          placeholder="Frontend, Backend, Side Project"
          className={cn(
            "w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all",
            errors.tags ? "border-rose-300" : "border-slate-200"
          )}
        />
        {errors.tags && <p className="text-xs text-rose-500 font-medium">{errors.tags.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Links (Optional)</label>
        <input 
          {...register('links')}
          placeholder="GitHub, Live Demo"
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
        />
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
          className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/10"
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Project' : 'Create Project')}
        </button>
      </div>
    </form>
  );
}
