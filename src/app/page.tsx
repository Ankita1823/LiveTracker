'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Briefcase, 
  BookOpen, 
  Bookmark, 
  Flame,
  ArrowUpRight,
  LucideIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { DashboardStats, EntryWithRelations } from '@/types';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['stats'],
    queryFn: () => fetch('/api/stats').then((res) => {
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }),
  });

  const { data: entries, isLoading: entriesLoading } = useQuery<EntryWithRelations[]>({
    queryKey: ['entries'],
    queryFn: () => fetch('/api/entries').then((res) => {
      if (!res.ok) throw new Error('Failed to fetch entries');
      return res.json();
    }),
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLoading = statsLoading || entriesLoading;

  if (isLoading) {
    return <DashboardLoading />;
  }

  const recentEntries = Array.isArray(entries) ? entries.slice(0, 5) : [];
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 lg:p-12 text-white shadow-2xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-emerald-600 rounded-full blur-[100px] opacity-20 animate-pulse" />
        
        <div className="relative z-10 space-y-4">
          <Badge variant="premium" className="px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Welcome Back, Developer
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
            Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Future</span>, One Log at a Time.
          </h2>
          <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
            Track your learning progress, manage projects, and organize your development resources in one beautiful workspace.
          </p>
          <div className="flex gap-4 pt-4">
            <Link 
              href="/log/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 hover:scale-105 active:scale-95"
            >
              New Entry
            </Link>
            <Link 
              href="/projects/new"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
            >
              Start Project
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Entries" 
          value={stats?.totalEntries ?? 0} 
          icon={BookOpen} 
          color="blue"
          href="/log"
        />
        <StatCard 
          title="Active Projects" 
          value={stats?.totalProjects ?? 0} 
          icon={Briefcase} 
          color="emerald"
          href="/projects"
        />
        <StatCard 
          title="Resources" 
          value={stats?.totalResources ?? 0} 
          icon={Bookmark} 
          color="amber"
          href="/resources"
        />
        <StatCard 
          title="Current Streak" 
          value={`${stats?.streak ?? 0} days`} 
          icon={Flame} 
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity size={20} className="text-blue-500" />
              Learning Activity
            </h3>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.activityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    hide 
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    labelClassName="text-slate-500 text-sm"
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    barSize={12}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Top Tech Tags</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats?.topTags && stats.topTags.length > 0 ? (
              stats.topTags.map((tag, idx) => (
                <div key={tag.tag} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700">{tag.tag}</span>
                    <span className="text-slate-400">{tag.count} usages</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${(tag.count / (stats.topTags[0]?.count || 1)) * 100}%`,
                        backgroundColor: COLORS[idx % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-400 italic text-sm">
                No tags tracked yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen size={20} className="text-blue-500" />
              Recent Logs
            </h3>
            <Link href="/log" className="text-sm font-bold text-blue-600 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentEntries && recentEntries.length > 0 ? (
                recentEntries.map((entry) => (
                  <Link key={entry.id} href={`/log/${entry.id}`} className="block hover:bg-slate-50 transition-colors">
                    <div className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900">{entry.title}</h4>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                      {entry.project && (
                        <Badge variant="info" className="text-[10px]">
                          {entry.project.name}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-20 text-center text-slate-400 italic text-sm">
                  No logs recorded yet. Start your journey!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Flame size={20} className="text-rose-500" />
              Consistency
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center">
                <span className="text-4xl font-black text-slate-900">{stats?.streak}</span>
              </div>
              <Flame size={24} className="absolute -top-2 -right-2 text-rose-500 animate-bounce" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-900">Day Streak</p>
              <p className="text-sm text-slate-500">Keep it up! Consistency is key to mastery.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'amber' | 'rose';
  href?: string;
}

function StatCard({ title, value, icon: Icon, color, href }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-500 text-white shadow-lg shadow-blue-500/20',
    emerald: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
    amber: 'bg-amber-500 text-white shadow-lg shadow-amber-500/20',
    rose: 'bg-rose-500 text-white shadow-lg shadow-rose-500/20',
  };

  const Content = (
    <Card className="group hover:-translate-y-2 transition-all duration-300">
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={cn("p-4 rounded-2xl transition-all duration-300 group-hover:scale-110", colors[color])}>
          <Icon size={28} strokeWidth={2.5} />
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href}>
        {Content}
      </Link>
    );
  }

  return Content;
}

function DashboardLoading() {
  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 lg:p-12 text-white">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 bg-slate-800" />
          <Skeleton className="h-16 w-3/4 bg-slate-800" />
          <Skeleton className="h-6 w-2/3 bg-slate-800" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 w-32 bg-slate-800" />
            <Skeleton className="h-12 w-32 bg-slate-800" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[400px] rounded-3xl" />
        <Skeleton className="h-[400px] rounded-3xl" />
      </div>
    </div>
  );
}
