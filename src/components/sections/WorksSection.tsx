'use client';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { works } from '@/data/works';
import { Code2 } from 'lucide-react';

export function WorksSection() {
  return (
    <section>
      <SectionHeader 
        icon={<Code2 size={14} />} 
        title="Works / Projects" 
        color="blue"
        border 
      />
      <div className="grid md:grid-cols-2 gap-12 text-sm leading-relaxed">
        {works.map((work) => (
          <div key={work.title} className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-3 italic">
              {work.title}
              {work.tags?.map((tag) => (
                <span 
                  key={tag}
                  className="text-[10px] not-italic bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20"
                >
                  {tag}
                </span>
              ))}
            </h3>
            <p className="text-slate-400">{work.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
