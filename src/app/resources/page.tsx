'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Tag as TagIcon, 
  Bookmark, 
  Star, 
  CheckCircle2, 
  Circle,
  MoreVertical,
  Trash2,
  Edit2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ResourceForm } from '@/components/resources/ResourceForm';
import { formatTags } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ResourceWithRelations } from '@/types';

export default function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceWithRelations | null>(null);
  
  const queryClient = useQueryClient();

  const { data: resources, isLoading } = useQuery<ResourceWithRelations[]>({
    queryKey: ['resources'],
    queryFn: () => fetch('/api/resources').then((res) => {
      if (!res.ok) throw new Error('Failed to fetch resources');
      return res.json();
    }),
  });

  const categories = ['All', ...Array.from(new Set(Array.isArray(resources) ? resources.map(r => r.category) : []))];

  const filteredResources = Array.isArray(resources) ? resources.filter((resource) => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(search.toLowerCase()) ||
      (resource.tags && resource.tags.toLowerCase().includes(search.toLowerCase())) ||
      resource.url.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === 'All' || resource.category === category;
    
    return matchesSearch && matchesCategory;
  }) : [];

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<ResourceWithRelations> }) => {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update resource');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete resource');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Resources</h2>
          <p className="text-slate-500">Curating the best of the web.</p>
        </div>
        <button 
          onClick={() => {
            setEditingResource(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-amber-900/10"
        >
          <Plus size={18} />
          <span>Add Resource</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          {Array.isArray(categories) && categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                category === cat 
                  ? "bg-amber-100 text-amber-700 border border-amber-200" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(filteredResources) && filteredResources.map((resource) => (
            <Card key={resource.id} className="group hover:border-amber-400 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
                    <Bookmark size={20} />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => updateMutation.mutate({ 
                        id: resource.id, 
                        data: { ...resource, isFavorite: !resource.isFavorite } 
                      })}
                      className={`p-1.5 rounded-lg transition-colors ${
                        resource.isFavorite ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
                      }`}
                    >
                      <Star size={16} fill={resource.isFavorite ? "currentColor" : "none"} />
                    </button>
                    
                    <div className="relative group/menu">
                      <button className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 top-full mt-1 opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto transition-all duration-200 bg-white border border-slate-200 rounded-lg shadow-xl z-10 w-32 overflow-hidden">
                        <button 
                          onClick={() => {
                            setEditingResource(resource);
                            setIsModalOpen(true);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this resource?')) {
                              deleteMutation.mutate(resource.id);
                            }
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {resource.title}
                    </h3>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-slate-300 hover:text-amber-600 transition-colors flex-shrink-0"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    {resource.category}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                  <div className="flex flex-wrap gap-1">
                    {formatTags(resource.tags).slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-50 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => updateMutation.mutate({ 
                      id: resource.id, 
                      data: { ...resource, isRead: !resource.isRead } 
                    })}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                      resource.isRead ? "text-emerald-500" : "text-slate-300 hover:text-slate-500"
                    }`}
                  >
                    {resource.isRead ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    {resource.isRead ? "READ" : "UNREAD"}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredResources?.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Bookmark size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No resources found</h3>
              <p className="text-slate-500">Bookmark interesting articles or tools!</p>
            </div>
          )}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingResource ? 'Edit Resource' : 'Add Resource'}
      >
        <ResourceForm 
          initialData={editingResource || undefined} 
          onSuccess={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
