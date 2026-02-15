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

export interface AcademicInfo {
  period: string;
  institution: string;
  description: string;
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
