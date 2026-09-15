import { Database, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function EmptyState({ title, description, icon: Icon = Database }: EmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-12 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md">
        {description}
      </p>
    </div>
  );
}
