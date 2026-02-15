import { activities as veliteActivities } from '#site/content';
import { Activity } from '@/types';

export const activities: Activity[] = veliteActivities.sort((a, b) => a.order - b.order).map(activity => ({
  title: activity.title,
  subtitle: activity.subtitle,
  description: activity.description,
  highlight: activity.highlight,
  highlightColor: activity.highlightColor,
  imageUrl: activity.imageUrl,
  externalUrl: activity.externalUrl,
}));
