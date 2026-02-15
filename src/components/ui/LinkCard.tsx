'use client';

import { AccountLink } from '@/types';

interface LinkCardProps {
  link: AccountLink;
}

const iconMap: Record<string, string> = {
  github: 'https://cdn.simpleicons.org/github/white',
  x: 'https://cdn.simpleicons.org/x/white',
  qiita: 'https://cdn.simpleicons.org/qiita/55C500',
  atcoder: 'https://img.atcoder.jp/assets/atcoder.png',
};

export function LinkCard({ link }: LinkCardProps) {
  return (
    <a 
      href={link.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center justify-center gap-3 bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:border-blue-500/50 hover:bg-slate-900 transition-all"
    >
      <span className="text-slate-400 w-4 h-4 flex items-center justify-center">
        <img src={iconMap[link.icon]} alt={link.name} className="w-4 h-4 object-contain" />
      </span>
      <span className="font-bold">{link.name}</span>
    </a>
  );
}
