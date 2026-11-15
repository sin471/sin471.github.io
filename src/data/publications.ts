import { publications as velitePublications } from '#site/content';
import { Publication, PublicationCategory } from '@/types';
import { compareYearMonthDesc } from '@/utils/date';

export const categoryLabels: Record<PublicationCategory, string> = {
  journal: '論文誌',
  international: '国際会議',
  domestic: '国内会議',
  other: 'その他',
};

export const publications: Publication[] = velitePublications
  .sort((a, b) => compareYearMonthDesc(a.date, b.date))
  .map(p => ({
    title: p.title,
    authors: p.authors,
    venue: p.venue,
    category: p.category,
    refereed: p.refereed,
    date: p.date,
    paperId: p.paperId,
    presentationType: p.presentationType,
    url: p.url,
    award: p.award,
  }));

/** 査読あり → 査読なし の順。空のグループは含めない */
export const publicationGroups: { label: string; items: Publication[] }[] = [
  { label: '査読あり', items: publications.filter(p => p.refereed) },
  { label: '査読なし', items: publications.filter(p => !p.refereed) },
].filter(g => g.items.length > 0);
