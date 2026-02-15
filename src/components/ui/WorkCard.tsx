'use client';

import { Work } from '@/types';
import { Github } from 'lucide-react';
import Image from 'next/image';

interface WorkCardProps {
  work: Work;
}

export function WorkCard({ work }: WorkCardProps) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
      {work.imageUrl && (
        <div className="relative w-full h-48 bg-slate-800/50">
          <Image 
            src={work.imageUrl} 
            alt={work.title}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-white italic">{work.title}</h3>
            {work.tags?.map((tag) => (
              <span 
                key={tag}
                className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
          {work.githubUrl && (
            <a
              href={work.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-blue-400 transition-colors shrink-0"
            >
              <Github size={14} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          )}
        </div>
        
        <div className="space-y-4">
          {/* プロジェクト説明 */}
          <div>
            <ul className="space-y-2 text-sm text-slate-300">
              {work.description.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 技術スタック */}
          <div>
            <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-wider mb-2">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {work.techStack.map((tech) => (
                <span 
                  key={tech}
                  className="text-xs px-2 py-1 bg-slate-800/50 rounded border border-slate-700/30 text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
