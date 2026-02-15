'use client';

import { Skill } from '@/types';
import { StarRating } from './StarRating';

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="flex items-center gap-6 p-5 bg-slate-900/40 rounded-2xl border border-slate-800/60">
      <div className="w-14 h-14 shrink-0 bg-slate-800/50 rounded-xl flex items-center justify-center p-2.5 border border-slate-700/30">
        <img 
          src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${skill.icon}/${skill.icon}-original.svg`} 
          alt={skill.name}
          onError={(e) => { 
            (e.target as HTMLImageElement).src = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg' 
          }}
          className="w-full h-full object-contain shadow-sm"
        />
      </div>
      <div className="grow space-y-1.5 min-w-0">
        <div className="flex justify-between items-end">
          <h4 className="font-bold text-white text-lg leading-none">{skill.name}</h4>
          <span className="text-[10px] text-slate-300 font-mono tracking-tighter">
            {skill.years} Experience
          </span>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-blue-400/80 font-bold uppercase tracking-tighter">
            Related Tech
          </span>
          <p className="text-xs text-slate-200 leading-tight truncate">{skill.detail}</p>
        </div>

        <div className="pt-1">
          <StarRating level={skill.level} />
        </div>
      </div>
    </div>
  );
}
