'use client';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { achievements } from '@/data/achievements';
import { Award, ExternalLink } from 'lucide-react';

export function AchievementsSection() {
  if (achievements.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader icon={<Award size={14} />} title="Achievements" color="green" />
      <div className="space-y-4">
        {achievements.map((achievement, index) => (
          <div key={index} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                  <h3 className="font-bold text-white text-base">{achievement.title}</h3>
                </div>
                <p className="text-sm text-slate-300 pl-5">{achievement.description}</p>
                {achievement.date && (
                  <p className="text-xs text-slate-400 pl-5 mt-2">{achievement.date}</p>
                )}
              </div>
              {achievement.url && (
                <a
                  href={achievement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-green-400 transition-colors shrink-0"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
