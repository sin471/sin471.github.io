'use client';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { academicHistory } from '@/data/academic';
import { GraduationCap } from 'lucide-react';

export function AcademicSection() {
  return (
    <section>
      <SectionHeader icon={<GraduationCap size={14} />} title="Academic" color="yellow" />
      <div className="space-y-6">
        {academicHistory.map((item) => (
          <div key={item.period} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
              <h3 className="text-white font-bold text-lg">{item.institution}</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed pl-5">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
