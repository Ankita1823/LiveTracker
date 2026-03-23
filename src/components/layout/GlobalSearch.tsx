'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, Briefcase, Bookmark, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Entry, Project, Resource } from '@/types';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const { data: entries } = useQuery<Entry[]>({
    queryKey: ['entries'],
    queryFn: () => fetch('/api/entries').then(res => {
      if (!res.ok) throw new Error('Failed to fetch entries');
      return res.json();
    }),
    enabled: isOpen,
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => fetch('/api/projects').then(res => {
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    }),
    enabled: isOpen,
  });

  const { data: resources } = useQuery<Resource[]>({
    queryKey: ['resources'],
    queryFn: () => fetch('/api/resources').then(res => {
      if (!res.ok) throw new Error('Failed to fetch resources');
      return res.json();
    }),
    enabled: isOpen,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = {
    entries: Array.isArray(entries) ? entries.filter(e => e.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3) : [],
    projects: Array.isArray(projects) ? projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3) : [],
    resources: Array.isArray(resources) ? resources.filter(r => r.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3) : [],
  };

  const hasResults = results.entries.length > 0 || results.projects.length > 0 || results.resources.length > 0;

  const navigate = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-30 p-4 bg-slate-900 text-white rounded-full shadow-2xl hover:scale-110 transition-all group lg:hidden"
      >
        <Search size={24} />
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Global Search"
        className="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              autoFocus
              placeholder="Search everything... (or press Ctrl+K)"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {query && !hasResults && (
              <div className="text-center py-10 text-slate-400">
                No results found for &quot;{query}&quot;
              </div>
            )}

            {!query && (
              <div className="text-center py-10 text-slate-400">
                Start typing to search projects, logs, and resources...
              </div>
            )}

            {results.projects.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Projects</h3>
                {results.projects.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-left transition-colors group"
                  >
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Briefcase size={18} />
                    </div>
                    <span className="font-bold text-slate-700">{p.name}</span>
                  </button>
                ))}
              </div>
            )}

            {results.entries.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Learning Logs</h3>
                {results.entries.map(e => (
                  <button 
                    key={e.id}
                    onClick={() => navigate(`/log/${e.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-left transition-colors group"
                  >
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <BookOpen size={18} />
                    </div>
                    <span className="font-bold text-slate-700">{e.title}</span>
                  </button>
                ))}
              </div>
            )}

            {results.resources.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Resources</h3>
                {results.resources.map(r => (
                  <button 
                    key={r.id}
                    onClick={() => navigate('/resources')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 text-left transition-colors group"
                  >
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Bookmark size={18} />
                    </div>
                    <span className="font-bold text-slate-700">{r.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
