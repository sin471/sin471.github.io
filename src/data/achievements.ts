import { achievements as veliteAchievements } from '#site/content';
import { Achievement } from '@/types';

export const achievements: Achievement[] = veliteAchievements.sort((a, b) => a.order - b.order).map(achievement => ({
  title: achievement.title,
  description: achievement.description,
  date: achievement.date,
  url: achievement.url,
}));
