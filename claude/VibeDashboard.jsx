import { Activity, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

export default function VibeDashboard({ score }) {
  let status = "Neutral";
  let colorClass = "text-slate-400";
  let bgClass = "bg-slate-100";
  let Icon = Minus;

  if (score > 0.05) {
    status = "Fanbase Hyped";
    colorClass = "text-emerald-600";
    bgClass = "bg-emerald-50 border-emerald-200";
    Icon = ThumbsUp;
  } else if (score < -0.05) {
    status = "Fanbase Frustrated";
    colorClass = "text-rose-600";
    bgClass = "bg-rose-50 border-rose-200";
    Icon = ThumbsDown;
  } else {
    bgClass = "bg-slate-50 border-slate-200";
  }

  const formattedScore = score.toFixed(3);

  return (
    <div className={`rounded-xl p-8 mb-8 border-2 ${bgClass} transition-all duration-500`}>
      <div className="flex items-center gap-2 mb-2 text-slate-600 font-semibold uppercase tracking-wider text-sm">
        <Activity className="w-5 h-5" />
        Aggregate Vibe Score
      </div>
      
      <div className="flex items-baseline gap-4 mt-4">
        <div className={`text-6xl font-extrabold ${colorClass}`}>
          {formattedScore}
        </div>
        <div className="flex items-center gap-2">
          <Icon className={`w-8 h-8 ${colorClass}`} />
          <span className={`text-2xl font-bold ${colorClass}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
