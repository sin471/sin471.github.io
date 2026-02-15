import { skills as veliteSkills } from '#site/content';
import { Skill } from '@/types';

export const skillStack: Skill[] = veliteSkills.sort((a, b) => a.order - b.order).map(skill => ({
  name: skill.name,
  icon: skill.icon,
  detail: skill.detail,
  level: skill.level as 1 | 2 | 3,
  years: skill.years,
}));

