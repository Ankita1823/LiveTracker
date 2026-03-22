'use client';

import { LogForm } from '@/components/log/LogForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewEntryPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <Link 
          href="/log" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to log</span>
        </Link>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          New Learning Entry
        </h1>
        <p className="text-slate-500">Documenting your progress and daily learning.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <LogForm />
      </div>
    </div>
  );
}
