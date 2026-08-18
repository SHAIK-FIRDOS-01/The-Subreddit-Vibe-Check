export default function VibeDashboard({ score, posts = [] }) {
  let status = "NEUTRAL";
  let colorClass = "text-amber";
  let bgClass = "bg-amber text-on-primary";
  let borderColor = "border-amber";

  if (score >= 0.05) {
    status = "FANBASE HYPED";
    colorClass = "text-primary";
    bgClass = "bg-primary text-on-primary";
    borderColor = "border-primary";
  } else if (score <= -0.05) {
    status = "FANBASE FRUSTRATED";
    colorClass = "text-coral";
    bgClass = "bg-coral text-on-primary";
    borderColor = "border-coral";
  }

  const formattedScore = (score > 0 ? "+" : "") + score.toFixed(3);
  const pointerPosition = ((score + 1) / 2) * 100;

  let posCount = 0;
  let neuCount = 0;
  let negCount = 0;

  posts.forEach(post => {
    if (post.sentiment_score >= 0.05) posCount++;
    else if (post.sentiment_score <= -0.05) negCount++;
    else neuCount++;
  });

  const total = posts.length || 1;
  const posPct = Math.round((posCount / total) * 100);
  const neuPct = Math.round((neuCount / total) * 100);
  const negPct = Math.round((negCount / total) * 100);

  let mostPos = null;
  let mostNeg = null;

  if (posts.length > 0) {
    const sorted = [...posts].sort((a, b) => b.sentiment_score - a.sentiment_score);
    mostPos = sorted[0];
    mostNeg = sorted[sorted.length - 1];
  }

  return (
    <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
      {/* Aggregate Score Module */}
      <div className="bg-surface border border-hairline p-6 flex flex-col gap-6 relative">
        <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${borderColor}`}></div>
        <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${borderColor}`}></div>
        <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${borderColor}`}></div>
        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${borderColor}`}></div>
        <div className="flex justify-between items-start">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Current Sentiment</span>
          <div className={`${bgClass} px-2 py-1 font-label-caps text-[10px] uppercase border ${borderColor} tracking-widest`}>
            {status}
          </div>
        </div>
        <div className={`font-data-tabular text-[80px] leading-none ${colorClass} font-bold tracking-tighter`}>
          {formattedScore}
        </div>
        {/* Linear Spectrum Marker */}
        <div className="flex flex-col gap-2 w-full mt-6">
          <div className="flex justify-between font-label-caps text-[10px] text-outline-variant">
            <span>(-) TOXIC</span>
            <span>NEUTRAL</span>
            <span>(+) HYPED</span>
          </div>
          <div className="relative h-1 w-full bg-surface-container-high">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3 bg-outline-variant"></div>
            <div 
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-4 ${bgClass} border border-background`}
              style={{ left: `${pointerPosition}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Sentiment Distribution Module */}
      <div className="bg-surface border border-hairline p-6 flex flex-col gap-6">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-hairline pb-2">Signal Mix</span>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 font-data-tabular text-sm text-mint">{posCount}</div>
            <div className="flex-grow h-2 bg-surface-container-high overflow-hidden">
              <div className="h-full bg-mint" style={{ width: `${posPct}%` }}></div>
            </div>
            <div className="w-16 font-label-caps text-[10px] text-right text-outline-variant">POSITIVE</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 font-data-tabular text-sm text-amber">{neuCount}</div>
            <div className="flex-grow h-2 bg-surface-container-high overflow-hidden">
              <div className="h-full bg-amber" style={{ width: `${neuPct}%` }}></div>
            </div>
            <div className="w-16 font-label-caps text-[10px] text-right text-outline-variant">NEUTRAL</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 font-data-tabular text-sm text-coral">{negCount}</div>
            <div className="flex-grow h-2 bg-surface-container-high overflow-hidden">
              <div className="h-full bg-coral" style={{ width: `${negPct}%` }}></div>
            </div>
            <div className="w-16 font-label-caps text-[10px] text-right text-outline-variant">NEGATIVE</div>
          </div>
        </div>
      </div>

      {/* Derived Signals */}
      <div className="bg-surface border border-hairline p-6 flex flex-col gap-4">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-hairline pb-2">Strongest Signals</span>
        
        {mostPos && (
          <div className="flex flex-col gap-1">
            <span className="font-label-caps text-[10px] text-mint uppercase">Most Positive Signal</span>
            <div className="flex items-start gap-2">
              <span className="font-data-tabular text-sm text-mint shrink-0 mt-0.5">{(mostPos.sentiment_score > 0 ? '+' : '') + mostPos.sentiment_score.toFixed(3)}</span>
              <span className="font-body-md text-sm text-on-surface line-clamp-2 leading-tight">{mostPos.title}</span>
            </div>
          </div>
        )}
        
        {mostNeg && (
          <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-hairline border-dashed">
            <span className="font-label-caps text-[10px] text-coral uppercase">Most Negative Signal</span>
            <div className="flex items-start gap-2">
              <span className="font-data-tabular text-sm text-coral shrink-0 mt-0.5">{mostNeg.sentiment_score.toFixed(3)}</span>
              <span className="font-body-md text-sm text-on-surface line-clamp-2 leading-tight">{mostNeg.title}</span>
            </div>
          </div>
        )}
      </div>

      {/* Methodology Note */}
      <div className="p-4 border border-hairline border-dashed bg-surface-container-lowest flex flex-col gap-2">
        <p className="font-data-tabular text-xs text-outline-variant leading-relaxed">
          SYS.NOTE: NLP model trained on Reddit lexicon. Sentiment weights adjusted for hyperbole and sarcasm.
        </p>
        <p className="font-data-tabular text-xs text-outline-variant leading-relaxed mt-2 pt-2 border-t border-hairline border-dashed">
          Sentiment reflects language in post titles. It is not a measure of factual accuracy, team performance, or community consensus.
        </p>
      </div>
    </div>
  );
}
