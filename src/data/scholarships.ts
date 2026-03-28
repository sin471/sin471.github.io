import { scholarships as veliteScholarships } from '#site/content';
import { Scholarship } from '@/types';

export const scholarships: Scholarship[] = veliteScholarships.sort((a, b) => a.order - b.order).map(s => ({
  title: s.title,
  period: s.period,
  amount: s.amount,
  description: s.description,
  url: s.url,
}));
