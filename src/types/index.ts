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
  description: string;
  tags?: string[];
}

export interface Activity {
  title: string;
  subtitle: string;
  description: string;
  highlight?: boolean;
  highlightColor?: string;
}

export interface AcademicInfo {
  period: string;
  institution: string;
  description: string;
}
