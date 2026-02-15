'use client';

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  color?: 'blue' | 'green' | 'yellow' | 'slate' | 'indigo';
  border?: boolean;
}

export function SectionHeader({ 
  icon, 
  title, 
  color = 'slate',
  border = false 
}: SectionHeaderProps) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    slate: 'text-slate-300',
    indigo: 'text-indigo-400',
  };

  const borderClass = border ? 'pb-2 border-b border-slate-900' : '';

  return (
    <h2 className={`text-xs font-bold tracking-[0.3em] ${colorClasses[color]} uppercase mb-8 flex items-center gap-2 ${borderClass}`}>
      {icon} {title}
    </h2>
  );
}
