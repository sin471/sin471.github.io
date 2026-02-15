import { skills as veliteSkills } from '#site/content';
import { Skill } from '@/types';

export const skillStack: Skill[] = veliteSkills
  .sort((a, b) => {
    // レベル降順（3 -> 2 -> 1）
    if (a.level !== b.level) {
      return b.level - a.level;
    }
    // 同じレベル内では名前順（アルファベット順）
    return a.name.localeCompare(b.name);
  })
  .map(skill => ({
    name: skill.name,
    icon: skill.icon,
    detail: skill.detail,
    level: skill.level as 1 | 2 | 3,
    years: skill.years,
  }));

