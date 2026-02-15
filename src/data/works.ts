import { works as veliteWorks } from '#site/content';
import { Work } from '@/types';

export const works: Work[] = veliteWorks.sort((a, b) => a.order - b.order).map(work => ({
  title: work.title,
  description: work.description,
  techStack: work.techStack,
  tags: work.tags,
  githubUrl: work.githubUrl,
  imageUrl: work.imageUrl,
}));

