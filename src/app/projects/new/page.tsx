'use client';

import { ProjectForm } from '@/components/projects/ProjectForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-4">
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to projects</span>
        </Link>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Create New Project
        </h1>
        <p className="text-slate-500">Launch your next big idea.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <ProjectForm />
      </div>
    </div>
  );
}
