'use client';

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
      <div className="grid md:grid-cols-2 gap-12 text-sm">
        {activities.map((activity) => (
          <div key={activity.title} className="space-y-4">
            <h3 className="font-bold text-white text-base">{activity.title}</h3>
            {activity.highlight ? (
              <div className={`bg-slate-900 p-4 rounded-xl border border-slate-800 border-l-4 border-l-${activity.highlightColor}-500`}>
                <span className={`text-${activity.highlightColor}-500 font-bold`}>
                  {activity.subtitle}
                </span>
                <p className="text-[11px] mt-1 text-slate-500">{activity.description}</p>
              </div>
            ) : (
              <p className="text-slate-400">{activity.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
