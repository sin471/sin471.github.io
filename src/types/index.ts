export interface Profile {
  name: {
    ja: string;
    en: string;
  };
}

export interface Skill {
  name: string;
  icon: string;
  detail: string;
  level: 1 | 2 | 3;
  years: string;
}

export interface AccountLink {
  name: string;
  url: string;
  icon: string;
}

export interface Work {
  title: string;
  description: string[];
  techStack: string[];
  tags?: string[];
  githubUrl?: string;
  imageUrl?: string;
}

export interface Activity {
  title: string;
  subtitle?: string;
  description: string | string[];
  highlight?: boolean;
  highlightColor?: string;
  imageUrl?: string;
  externalUrl?: string;
}

export interface Research {
  fields: string[];
  interests?: string[];
}

export interface CareerInfo {
  period: string;
  institution: string;
  description: string;
}

export interface Achievement {
  title: string;
  description: string;
  date?: string;
  url?: string;
}

export interface Scholarship {
  title: string;
  period: string;
  amount?: string;
  description: string;
  url?: string;
}

export type PublicationCategory = 'journal' | 'international' | 'domestic' | 'other';

export interface Publication {
  title: string;
  authors: string[];
  venue: string;
  category: PublicationCategory;
  refereed: boolean;
  date: string;
  paperId?: string;
  presentationType?: string;
  url?: string;
  /** 受賞名（例: YANS2026 奨励賞）。カード内で強調表示する */
  award?: string;
}
