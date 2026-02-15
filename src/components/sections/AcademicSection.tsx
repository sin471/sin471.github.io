'use client';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { academicHistory } from '@/data/academic';
import { GraduationCap } from 'lucide-react';

export function AcademicSection() {
  return (
    <section>
      <SectionHeader icon={<GraduationCap size={14} />} title="Academic & Career" />
      <div className="border-l border-slate-800 ml-2 space-y-12 pl-8">
        {academicHistory.map((item) => (
          <div key={item.period} className="relative">
            <div className="absolute -left-[37px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
            <p className="text-[10px] text-slate-500 font-mono mb-1">{item.period}</p>
            <h3 className="text-white font-bold text-sm leading-none">{item.institution}</h3>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
