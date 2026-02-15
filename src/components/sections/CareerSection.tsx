'use client';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { careerHistory } from '@/data/career';
import { Briefcase } from 'lucide-react';

export function CareerSection() {
  return (
    <section>
      <SectionHeader icon={<Briefcase size={14} />} title="Career" color="indigo" />
      <div className="border-l border-slate-800 ml-2 space-y-12 pl-8">
        {careerHistory.map((item) => (
          <div key={item.period} className="relative">
            <div className="absolute -left-[37px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
            <p className="text-[10px] text-slate-400 font-mono mb-1">{item.period}</p>
            <h3 className="text-white font-bold text-sm leading-none">{item.institution}</h3>
            {item.description && (
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
