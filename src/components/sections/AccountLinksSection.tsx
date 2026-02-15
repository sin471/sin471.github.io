'use client';

import { LinkCard } from '@/components/ui/LinkCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { accountLinks } from '@/data/accounts';
import { Globe } from 'lucide-react';

export function AccountLinksSection() {
  return (
    <section>
      <SectionHeader icon={<Globe size={14} />} title="Account Links" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {accountLinks.map((link) => (
          <LinkCard key={link.name} link={link} />
        ))}
      </div>
    </section>
  );
}
