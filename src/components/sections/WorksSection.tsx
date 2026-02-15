'use client';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { WorkCard } from '@/components/ui/WorkCard';
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
      <div className="grid md:grid-cols-2 gap-6">
        {works.map((work) => (
          <WorkCard key={work.title} work={work} />
        ))}
      </div>
    </section>
  );
}
