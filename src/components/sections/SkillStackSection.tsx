'use client';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkillCard } from '@/components/ui/SkillCard';
import { skillStack } from '@/data/skills';
import { Layers } from 'lucide-react';

export function SkillStackSection() {
  return (
    <section>
      <SectionHeader icon={<Layers size={14} />} title="Technical Skill Stack" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillStack.map((skill) => (
          <SkillCard key={skill.name} skill={skill} />
        ))}
      </div>
      <div className="mt-8 p-4 bg-slate-900/20 rounded-xl border border-slate-900 text-[10px] text-slate-500 flex gap-6 italic">
        <span>★★★ : 指揮/一からの構築が可能</span>
        <span>★★ : 実務・チーム開発レベル</span>
        <span>★ : 基本理解/個人開発レベル</span>
      </div>
    </section>
  );
}
