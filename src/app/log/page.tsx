'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Calendar, Tag as TagIcon, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatTags } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { EntryWithRelations } from '@/types';

export default function LogPage() {
  const [search, setSearch] = useState('');
  const { data: entries, isLoading } = useQuery<EntryWithRelations[]>({
    queryKey: ['entries'],
    queryFn: () => fetch('/api/entries').then((res) => res.json()),
  });

  const filteredEntries = entries?.filter((entry) => 
    entry.title.toLowerCase().includes(search.toLowerCase()) ||
    entry.tags.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Learning Log</h2>
          <p className="text-slate-500">Documenting the daily grind and small wins.</p>
        </div>
        <Link 
          href="/log/new" 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/10"
        >
          <Plus size={18} />
          <span>New Entry</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search entries or tags..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm border-l border-slate-200 pl-4 h-8 hidden md:flex">
          <Filter size={16} />
          <span>{filteredEntries?.length ?? 0} entries found</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEntries?.map((entry) => (
            <Link key={entry.id} href={`/log/${entry.id}`}>
              <Card className="h-full hover:border-blue-400 hover:shadow-lg hover:shadow-blue-900/5 transition-all group">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                      <Calendar size={14} />
                      {formatDate(entry.date)}
                    </div>
                    {entry.project && (
                      <Badge variant="info" className="text-[10px] uppercase">
                        {entry.project.name}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {entry.title}
                  </h3>
                  
                  <p className="text-slate-600 line-clamp-3 mb-4 text-sm flex-grow leading-relaxed">
                    {entry.notes?.replace(/[#*`]/g, '') || ''}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-50">
                    {formatTags(entry.tags).map((tag) => (
                      <div key={tag} className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <TagIcon size={12} className="text-slate-300" />
                        {tag}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {filteredEntries?.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No entries found</h3>
              <p className="text-slate-500">Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
