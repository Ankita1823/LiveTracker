'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Briefcase, Bookmark, Plus, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Learning Log', href: '/log', icon: BookOpen },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Resources', href: '/resources', icon: Bookmark },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 right-6 z-50 p-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 transition-all duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        "w-72 bg-slate-950 text-white flex flex-col h-screen sticky top-0 transition-all duration-500 z-40 border-r border-slate-900",
        "fixed lg:sticky lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">DevLog</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Live Tracking</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 relative group",
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-bold tracking-tight">{item.name}</span>
                {isActive && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Ready to build?</p>
            <Link 
              href="/log/new"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-white text-slate-950 py-3 px-4 rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
            >
              <Plus size={18} strokeWidth={3} />
              <span>QUICK LOG</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
