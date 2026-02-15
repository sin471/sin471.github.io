'use client';

import { Award } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { certifications } from '@/data/certifications';

export function CertificationsSection() {
  return (
    <section>
      <SectionHeader icon={<Award size={14} />} title="Certifications" />
      <div className="space-y-2">
        {certifications.map((cert, index) => (
          <div key={index} className="flex items-start gap-3 text-sm text-slate-300">
            <span className="text-blue-400 mt-1">•</span>
            <span>{cert.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
