export default function PostFeed({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="col-span-1 lg:col-span-8 bg-surface border border-hairline flex flex-col relative">
      <div className="absolute top-0 right-0 bg-primary text-on-primary px-2 py-1 font-label-caps text-[10px] uppercase">
        DATA: REDDIT FEED
      </div>
      <div className="p-6 border-b border-hairline flex justify-between items-end mt-4">
        <h2 className="font-headline-md text-xl text-on-surface uppercase tracking-wide">Hot posts shaping the conversation</h2>
        <span className="font-data-tabular text-xs text-primary">[{posts.length} Posts Analyzed]</span>
      </div>
      
      <div className="flex flex-col w-full divide-y divide-hairline bg-surface-container-lowest">
        {/* List Header */}
        <div className="flex p-3 px-6 font-label-caps text-[10px] text-outline-variant uppercase bg-surface">
          <div className="w-12 shrink-0">RANK</div>
          <div className="flex-grow min-w-0">SUBJECT</div>
          <div className="w-24 shrink-0 text-right">SCORE</div>
        </div>
        
        {/* Post Rows */}
        {posts.map((post, idx) => {
          const score = post.sentiment_score;
          let color = "amber";
          if (score >= 0.05) color = "mint";
          else if (score <= -0.05) color = "coral";
          
          const rank = (idx + 1).toString().padStart(2, '0');
          const formattedScore = (score > 0 ? "+" : "") + score.toFixed(3);

          return (
            <div key={idx} className="flex items-center p-4 px-6 hover:bg-surface-container-low transition-colors group cursor-crosshair">
              <div className="font-data-tabular text-sm text-outline-variant w-12 shrink-0 group-hover:text-primary">
                {rank}
              </div>
              <div className="flex-grow pr-4 min-w-0">
                <h3 className="font-body-md text-sm text-on-surface break-words">
                  {post.title}
                </h3>
              </div>
              <div className="flex items-center justify-end gap-3 w-24 shrink-0">
                <div className={`w-1 h-3 bg-${color}`}></div>
                <span className={`font-data-tabular text-sm text-${color}`}>
                  {formattedScore}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
