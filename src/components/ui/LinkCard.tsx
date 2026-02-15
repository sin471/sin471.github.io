'use client';

import { AccountLink } from '@/types';
import { Code2, Github, Trophy, Twitter } from 'lucide-react';

interface LinkCardProps {
  link: AccountLink;
}

const iconMap: Record<string, React.ReactNode> = {
  github: <Github size={16} />,
  trophy: <Trophy size={16} />,
  code2: <Code2 size={16} />,
  twitter: <Twitter size={16} />,
};

export function LinkCard({ link }: LinkCardProps) {
  return (
    <a 
      href={link.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center justify-center gap-3 bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:border-blue-500/50 hover:bg-slate-900 transition-all"
    >
      <span className="text-slate-400">{iconMap[link.icon]}</span>
      <span className="font-bold">{link.name}</span>
    </a>
  );
}
