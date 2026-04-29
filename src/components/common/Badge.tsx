import { LeadScore, LeadStatus } from '@/lib/types';

interface BadgeProps {
  type: 'score' | 'status';
  value: string;
}

const scoreConfig: Record<string, string> = {
  High: 'bg-red-100 text-red-700 border border-red-200',
  Medium: 'bg-blue-100 text-blue-700 border border-blue-200',
  Low: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const statusConfig: Record<string, string> = {
  New: 'bg-purple-100 text-purple-700 border border-purple-200',
  Assigned: 'bg-blue-100 text-blue-700 border border-blue-200',
  'In Progress': 'bg-amber-100 text-amber-700 border border-amber-200',
  Closed: 'bg-green-100 text-green-700 border border-green-200',
};

export function ScoreBadge({ score }: { score: LeadScore }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${scoreConfig[score]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${score === 'High' ? 'bg-red-500' : score === 'Medium' ? 'bg-blue-500' : 'bg-slate-400'}`} />
      {score}
    </span>
  );
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig[status]}`}>
      {status}
    </span>
  );
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) {
  const variants: Record<string, string> = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}
