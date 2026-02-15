'use client';

import { Activity } from '@/types';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const isAtCoder = activity.title === "AtCoder Rating";
  
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all">
      {activity.imageUrl && (
        <div className="relative w-full h-48 bg-slate-800/50">
          <Image 
            src={activity.imageUrl} 
            alt={activity.title}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-white text-lg">{activity.title}</h3>
          {activity.externalUrl && (
            <a
              href={activity.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-green-400 transition-colors shrink-0"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Visit</span>
            </a>
          )}
        </div>
        
        {isAtCoder ? (
          <div className="mb-3">
            <a 
              href="https://atcoder.jp/users/sin471" 
              target="_blank" 
              rel="noopener noreferrer"
              title="sin471"
            >
              <img 
                src="https://img.shields.io/endpoint?url=https%3A%2F%2Fatcoder-badges.now.sh%2Fapi%2Fatcoder%2Fjson%2Fsin471" 
                alt="AtCoder Rating"
                className="h-5"
              />
            </a>
          </div>
        ) : activity.subtitle ? (
          <p className="text-sm text-slate-300 mb-3">{activity.subtitle}</p>
        ) : null}
        
        {Array.isArray(activity.description) ? (
          <ul className="space-y-2 text-sm text-slate-300">
            {activity.description.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-300">{activity.description}</p>
        )}
      </div>
    </div>
  );
}
