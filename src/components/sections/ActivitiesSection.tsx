'use client';

import { ActivityCard } from '@/components/ui/ActivityCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { activities } from '@/data/activities';
import { BookOpen } from 'lucide-react';

export function ActivitiesSection() {
  return (
    <section>
      <SectionHeader 
        icon={<BookOpen size={14} />} 
        title="Activities" 
        color="green"
        border 
      />
      <div className="grid md:grid-cols-2 gap-6">
        {activities.map((activity) => (
          <ActivityCard key={activity.title} activity={activity} />
        ))}
      </div>
    </section>
  );
}
